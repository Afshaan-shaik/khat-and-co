/**
 * Copies text to clipboard with automatic fallback for mobile browsers & WebViews
 * where transient user activation may expire during async network calls.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // 1. Modern Async Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Async clipboard writeText failed, trying execCommand fallback:', err);
    }
  }

  // 2. Fallback: temporary textarea using execCommand('copy')
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) return true;
    } catch (err) {
      console.warn('execCommand copy fallback failed:', err);
    }
  }

  return false;
}
