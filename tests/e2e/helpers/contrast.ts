import { Page, Locator } from '@playwright/test';

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseColor(colorStr: string): RGBA {
  const hexMatch = colorStr.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
      a: 1
    };
  }

  const rgbaMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1
    };
  }

  return { r: 0, g: 0, b: 0, a: 1 };
}

export function blend(fg: RGBA, bg: RGBA): RGBA {
  const alpha = fg.a;
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
    a: 1
  };
}

export function getLuminance(c: RGBA): number {
  const a = [c.r, c.g, c.b].map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function getContrastRatio(fg: RGBA, bg: RGBA): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Calculates WCAG contrast ratio for a locator by inspecting computed styles in browser context.
 * Walks up the DOM tree to locate the effective background color, accounting for element and ancestor opacity.
 */
export async function getElementContrastRatio(page: Page, locator: Locator): Promise<number> {
  return await locator.evaluate((el: HTMLElement) => {
    function parseRgba(str: string): { r: number; g: number; b: number; a: number } {
      const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        return {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10),
          a: match[4] !== undefined ? parseFloat(match[4]) : 1
        };
      }
      return { r: 0, g: 0, b: 0, a: 1 };
    }

    function sRGBtoLin(colorChannel: number): number {
      const v = colorChannel / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }

    function calcLuminance(c: { r: number; g: number; b: number }): number {
      return 0.2126 * sRGBtoLin(c.r) + 0.7152 * sRGBtoLin(c.g) + 0.0722 * sRGBtoLin(c.b);
    }

    const style = window.getComputedStyle(el);
    let fg = parseRgba(style.color);

    // Accumulate total opacity from element and all its ancestors
    let totalOpacity = 1;
    let curr: HTMLElement | null = el;
    while (curr) {
      const op = parseFloat(window.getComputedStyle(curr).opacity) || 1;
      totalOpacity *= op;
      curr = curr.parentElement;
    }
    fg.a *= totalOpacity;

    // Find the effective background color: collect background layers from element up ancestors to the first opaque layer
    const bgLayers: { r: number; g: number; b: number; a: number }[] = [];
    curr = el;
    while (curr) {
      const bgStyle = window.getComputedStyle(curr);
      const bgColor = parseRgba(bgStyle.backgroundColor);
      if (bgColor.a > 0.01) {
        bgLayers.unshift(bgColor);
        if (bgColor.a >= 0.95) {
          break; // Found solid base
        }
      }
      curr = curr.parentElement;
    }

    // Default canvas background (white in light mode, #121420 in dark mode)
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    let bg = isDarkTheme ? { r: 18, g: 20, b: 32, a: 1 } : { r: 255, g: 255, b: 255, a: 1 };
    for (const layer of bgLayers) {
      bg = {
        r: Math.round(layer.r * layer.a + bg.r * (1 - layer.a)),
        g: Math.round(layer.g * layer.a + bg.g * (1 - layer.a)),
        b: Math.round(layer.b * layer.a + bg.b * (1 - layer.a)),
        a: 1
      };
    }

    // Blend foreground over effective background
    const blendedFg = {
      r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
      g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
      b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a))
    };

    const l1 = calcLuminance(blendedFg);
    const l2 = calcLuminance(bg);

    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });
}
