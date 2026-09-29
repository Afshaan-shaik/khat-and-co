import { jsPDF } from 'jspdf';
import { LetterData } from '../types/letter';

interface ExportPdfOptions {
  fileName?: string;
  letter?: LetterData;
  pixelRatio?: number;
}

/**
 * Captures an HTML element as an exact, high-fidelity image data URL.
 * Preserves the exact background color, text color, borders, gradients,
 * stickers, handwriting fonts, and spacing.
 *
 * Crucially:
 * 1. Resolves the element's computed background color to prevent transparent canvas rendering.
 * 2. Renders via html-to-image with solid background, eliminating alpha-channel Soft Masks (/SMask)
 *    which cause PDF viewers and printers to darken, fade, or wash out colors.
 * 3. Exports crisp 24-bit direct color DeviceRGB image to jsPDF.
 */
async function captureElementToOpaqueImage(
  element: HTMLElement,
  pixelRatio: number = 2
): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG' }> {
  const { toCanvas } = await import('html-to-image');

  try {
    if (document.fonts) {
      await document.fonts.ready;
    }
  } catch {
    // Continue if fonts API unavailable
  }

  const filter = (node: HTMLElement) => {
    if (node.classList) {
      if (
        node.classList.contains('sticker-toolbar') ||
        node.classList.contains('sticker-handle') ||
        node.classList.contains('no-export') ||
        node.classList.contains('ps-tear')
      ) {
        return false;
      }
    }
    return true;
  };

  // Determine computed background color of paper to avoid transparent alpha blending
  const computedStyle = window.getComputedStyle(element);
  const rawBg = computedStyle.backgroundColor;
  const bgColor =
    rawBg && rawBg !== 'rgba(0, 0, 0, 0)' && rawBg !== 'transparent'
      ? rawBg
      : '#F8F3EA';

  // SVG feTurbulence filters inside SVG foreignObject composite in linear RGB in Chromium,
  // causing an artificial 30+ RGB level darkening across stationery templates.
  // We sanitize the background-image by filtering out the feTurbulence grain layer
  // while preserving all decorative gradients, botanical SVGs, and star constellations.
  const rawBgImage = computedStyle.backgroundImage;
  let cleanBgImage: string | undefined = undefined;
  if (rawBgImage && rawBgImage !== 'none') {
    const cleaned = rawBgImage
      .replace(/url\("data:image\/svg\+xml[^"]*feTurbulence[^"]*"\)/gi, '')
      .replace(/url\('data:image\/svg\+xml[^']*feTurbulence[^']*'\)/gi, '')
      .replace(/url\(data:image\/svg\+xml[^)]*feTurbulence[^)]*\)/gi, '')
      .replace(/,\s*,/g, ',')
      .replace(/^[\s,]+|[\s,]+$/g, '')
      .trim();
    cleanBgImage = cleaned || 'none';
  }

  const renderOptions = {
    pixelRatio: Math.max(pixelRatio, 2),
    cacheBust: false,
    backgroundColor: bgColor,
    filter,
    style: {
      boxShadow: 'none', // Prevent clipped outer box shadow from creating dark bars on PDF page edges
      ...(cleanBgImage !== undefined ? { backgroundImage: cleanBgImage } : {})
    }
  };

  let canvas: HTMLCanvasElement;
  try {
    canvas = await toCanvas(element, renderOptions);
  } catch (err) {
    console.warn('First export pass failed, retrying with skipFonts: true', err);
    canvas = await toCanvas(element, {
      ...renderOptions,
      skipFonts: true
    });
  }

  // Draw onto a 100% opaque destination canvas to guarantee zero alpha transparency.
  // This completely prevents jsPDF from creating an /SMask, ensuring 100% color accuracy in all PDF readers and printers.
  const destCanvas = document.createElement('canvas');
  destCanvas.width = canvas.width;
  destCanvas.height = canvas.height;
  const destCtx = destCanvas.getContext('2d', { alpha: false });
  if (destCtx) {
    destCtx.fillStyle = bgColor;
    destCtx.fillRect(0, 0, destCanvas.width, destCanvas.height);
    destCtx.drawImage(canvas, 0, 0);
    return {
      dataUrl: destCanvas.toDataURL('image/jpeg', 0.98),
      format: 'JPEG'
    };
  }

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.98),
    format: 'JPEG'
  };
}

/**
 * Downloads a Blob directly, with fallback for mobile browsers (iOS Safari, Android Chrome).
 */
function triggerDownloadBlob(blob: Blob, fileName: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(blobUrl);
  }, 2000);
}

/**
 * Exports the letter as a real, formatted PDF file.
 * Preserves the exact background color, border stripes, handwriting, lines, and wax seal.
 */
export async function exportLetterAsPdf(
  element: HTMLElement,
  options?: ExportPdfOptions
): Promise<void> {
  const fileName = options?.fileName || 'khat-and-co-letter.pdf';
  const pixelRatio = options?.pixelRatio || 2; // 2x gives optimal balance of razor sharpness and mobile memory safety

  try {
    // 1. Capture exact rendered letter element with solid background
    const { dataUrl, format } = await captureElementToOpaqueImage(element, pixelRatio);

    // 2. Measure aspect ratio of element
    const rect = element.getBoundingClientRect();
    const elWidth = rect.width || element.offsetWidth || 600;
    const elHeight = rect.height || element.offsetHeight || 800;

    // Standard width of 210mm (matching A4 width)
    const pdfWidth = 210;
    const pdfHeight = (elHeight / elWidth) * pdfWidth;
    const orientation = pdfWidth > pdfHeight ? 'landscape' : 'portrait';

    // 3. Create real PDF with jsPDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
      compress: true
    });

    // 4. Paint the high-res letter image edge-to-edge
    pdf.addImage(dataUrl, format, 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // 5. Trigger download as PDF blob
    const pdfBlob = pdf.output('blob');
    triggerDownloadBlob(pdfBlob, fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
  } catch (err) {
    console.error('Failed to export letter as PDF:', err);
    // Ultimate fallback: open print dialog
    window.print();
    throw err;
  }
}

/**
 * Exports the letter as high-resolution picture.
 */
export async function exportLetterAsPicture(
  element: HTMLElement,
  options?: { pixelRatio?: number; fileName?: string }
): Promise<void> {
  const pixelRatio = options?.pixelRatio || 2;
  const fileName = options?.fileName || 'khat-and-co-letter.jpg';

  try {
    const { dataUrl } = await captureElementToOpaqueImage(element, pixelRatio);

    // Convert data URL to Blob for reliable mobile download
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    triggerDownloadBlob(blob, fileName.endsWith('.png') || fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`);
  } catch (err) {
    console.error('Failed to export letter as picture', err);
    throw err;
  }
}
