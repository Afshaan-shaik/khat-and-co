import { jsPDF } from 'jspdf';
import { LetterData } from '../types/letter';

interface ExportPdfOptions {
  fileName?: string;
  letter?: LetterData;
  pixelRatio?: number;
}

/**
 * Robustly captures an HTML element as high-resolution PNG data URL.
 * Automatically handles cross-origin font errors and style parsing gracefully.
 */
async function captureElementToPng(
  element: HTMLElement,
  pixelRatio: number = 2
): Promise<string> {
  const { toPng } = await import('html-to-image');

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

  try {
    // Primary attempt: high fidelity with font parsing using cached fonts
    return await toPng(element, {
      pixelRatio,
      cacheBust: false,
      filter,
      backgroundColor: undefined
    });
  } catch (err) {
    console.warn('First export pass failed, retrying with skipFonts: true', err);
    // Secondary attempt: bypass external font fetching to prevent CORS/security block
    return await toPng(element, {
      pixelRatio: Math.min(pixelRatio, 2),
      skipFonts: true,
      cacheBust: false,
      filter
    });
  }
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
    // 1. Capture exact rendered letter element
    const dataUrl = await captureElementToPng(element, pixelRatio);

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
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

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
 * Exports the letter as high-resolution PNG picture.
 */
export async function exportLetterAsPicture(
  element: HTMLElement,
  options?: { pixelRatio?: number; fileName?: string }
): Promise<void> {
  const pixelRatio = options?.pixelRatio || 2;
  const fileName = options?.fileName || 'khat-and-co-letter.png';

  try {
    const dataUrl = await captureElementToPng(element, pixelRatio);

    // Convert data URL to Blob for reliable mobile download
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    triggerDownloadBlob(blob, fileName.endsWith('.png') ? fileName : `${fileName}.png`);
  } catch (err) {
    console.error('Failed to export letter as picture', err);
    throw err;
  }
}
