export async function exportLetterAsPicture(
  element: HTMLElement,
  options?: { pixelRatio?: number; fileName?: string }
): Promise<void> {
  const pixelRatio = options?.pixelRatio || 3; // 3x crisp high-res export
  const fileName = options?.fileName || 'khat-and-co-letter.png';

  try {
    // Dynamic import: Only loads export bundle when user explicitly clicks Save
    const { toPng } = await import('html-to-image');

    // Deselect any active sticker handles before capturing
    const dataUrl = await toPng(element, {
      pixelRatio,
      cacheBust: true,
      filter: (node: HTMLElement) => {
        // Exclude sticker controls/toolbars and drag handles from exported picture
        if (node.classList && (
          node.classList.contains('sticker-toolbar') ||
          node.classList.contains('sticker-handle') ||
          node.classList.contains('no-export')
        )) {
          return false;
        }
        return true;
      }
    });

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export letter as picture', err);
    throw err;
  }
}
