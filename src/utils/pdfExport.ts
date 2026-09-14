import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Converts an oklab(...) string to an rgb/rgba string supported by html2canvas
 */
function oklabToRgbStr(match: string): string {
  try {
    const inner = match.replace(/^oklab\s*\(\s*/i, '').replace(/\s*\)$/, '');
    const [colorPart, alphaPart] = inner.split('/');
    const parts = colorPart.replace(/,/g, ' ').trim().split(/\s+/);
    if (parts.length < 3) return 'rgb(217, 119, 6)';

    let L = parseFloat(parts[0]);
    if (parts[0].endsWith('%')) L = parseFloat(parts[0]) / 100;

    let aVal = parseFloat(parts[1]);
    if (parts[1].endsWith('%')) aVal = (parseFloat(parts[1]) / 100) * 0.4;

    let bVal = parseFloat(parts[2]);
    if (parts[2].endsWith('%')) bVal = (parseFloat(parts[2]) / 100) * 0.4;

    let alpha = 1;
    if (alphaPart) {
      const aStr = alphaPart.trim();
      if (aStr.endsWith('%')) alpha = parseFloat(aStr) / 100;
      else alpha = parseFloat(aStr);
      if (isNaN(alpha)) alpha = 1;
    }

    if (isNaN(L) || isNaN(aVal) || isNaN(bVal)) return 'rgb(217, 119, 6)';

    const l_ = L + 0.3963377774 * aVal + 0.2158037573 * bVal;
    const m_ = L - 0.1055613458 * aVal - 0.0638541728 * bVal;
    const s_ = L - 0.0894841775 * aVal - 1.2914855480 * bVal;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const transfer = (x: number) => {
      if (x <= 0) return 0;
      if (x <= 0.0031308) return 12.92 * x;
      return 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    };

    const r = Math.min(255, Math.max(0, Math.round(transfer(r_lin) * 255)));
    const g = Math.min(255, Math.max(0, Math.round(transfer(g_lin) * 255)));
    const b = Math.min(255, Math.max(0, Math.round(transfer(b_lin) * 255)));

    if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgb(217, 119, 6)';

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return 'rgb(217, 119, 6)';
  }
}

/**
 * Converts an oklch(...) string to an rgb/rgba string supported by html2canvas
 */
function oklchToRgbStr(match: string): string {
  try {
    const inner = match.replace(/^oklch\s*\(\s*/i, '').replace(/\s*\)$/, '');
    const [colorPart, alphaPart] = inner.split('/');
    const parts = colorPart.replace(/,/g, ' ').trim().split(/\s+/);
    if (parts.length < 3) return 'rgb(217, 119, 6)';

    let l = parseFloat(parts[0]);
    if (parts[0].endsWith('%')) l = parseFloat(parts[0]) / 100;

    let c = parseFloat(parts[1]);
    if (parts[1].endsWith('%')) c = (parseFloat(parts[1]) / 100) * 0.4;

    let h = parseFloat(parts[2]);
    if (parts[2].endsWith('deg')) h = parseFloat(parts[2]);
    else if (parts[2].endsWith('rad')) h = (parseFloat(parts[2]) * 180) / Math.PI;
    else if (parts[2].endsWith('turn')) h = parseFloat(parts[2]) * 360;

    let a = 1;
    if (alphaPart) {
      const aStr = alphaPart.trim();
      if (aStr.endsWith('%')) a = parseFloat(aStr) / 100;
      else a = parseFloat(aStr);
      if (isNaN(a)) a = 1;
    }

    if (isNaN(l) || isNaN(c) || isNaN(h)) return 'rgb(217, 119, 6)';

    const hRad = (h * Math.PI) / 180;
    const okA = c * Math.cos(hRad);
    const okB = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * okA + 0.2158037573 * okB;
    const m_ = l - 0.1055613458 * okA - 0.0638541728 * okB;
    const s_ = l - 0.0894841775 * okA - 1.2914855480 * okB;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const transfer = (x: number) => {
      if (x <= 0) return 0;
      if (x <= 0.0031308) return 12.92 * x;
      return 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    };

    const r = Math.min(255, Math.max(0, Math.round(transfer(r_lin) * 255)));
    const g = Math.min(255, Math.max(0, Math.round(transfer(g_lin) * 255)));
    const b = Math.min(255, Math.max(0, Math.round(transfer(b_lin) * 255)));

    if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgb(217, 119, 6)';

    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return 'rgb(217, 119, 6)';
  }
}

/**
 * Replaces all oklch(...) and oklab(...) in CSS text with rgb/rgba equivalents,
 * properly handling nested parentheses (e.g. var(...), calc(...)).
 */
export function replaceOklchInText(cssText: string): string {
  if (!cssText) return cssText;
  if (!/okl(ch|ab)/i.test(cssText)) return cssText;

  let result = cssText;
  const regex = /okl(ch|ab)\s*\(/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(result)) !== null) {
    const startIdx = match.index;
    const isOklab = match[0].toLowerCase().includes('oklab');
    const startParen = result.indexOf('(', startIdx);

    if (startParen === -1) continue;

    let parenCount = 1;
    let endParen = -1;
    for (let i = startParen + 1; i < result.length; i++) {
      if (result[i] === '(') parenCount++;
      else if (result[i] === ')') {
        parenCount--;
        if (parenCount === 0) {
          endParen = i;
          break;
        }
      }
    }

    if (endParen !== -1) {
      const fullMatch = result.substring(startIdx, endParen + 1);
      const rgbVal = isOklab ? oklabToRgbStr(fullMatch) : oklchToRgbStr(fullMatch);
      result = result.substring(0, startIdx) + rgbVal + result.substring(endParen + 1);
      regex.lastIndex = startIdx + rgbVal.length;
    }
  }

  // Fallback pass to strip any residual unparsed oklab / oklch functions or keywords
  if (/okl(ch|ab)/i.test(result)) {
    result = result
      .replace(/oklab\s*\([^)]*\)/gi, 'rgb(217, 119, 6)')
      .replace(/oklch\s*\([^)]*\)/gi, 'rgb(217, 119, 6)')
      .replace(/oklab/gi, 'rgb')
      .replace(/oklch/gi, 'rgb');
  }

  return result;
}

const COLOR_PROPERTIES = [
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'fill',
  'stroke',
  'box-shadow',
  'text-shadow',
  'background-image',
  'background',
];

/**
 * Sanitizes cloned document for html2canvas to avoid oklch/oklab unsupported function errors
 */
const sanitizeDocumentForHtml2Canvas = (clonedDoc: Document) => {
  // 1. Remove/convert all <link rel="stylesheet"> elements so html2canvas doesn't parse un-sanitized external stylesheets
  const linkEls = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
  linkEls.forEach((link) => {
    try {
      const href = (link as HTMLLinkElement).href;
      const sheet = Array.from(document.styleSheets).find((s) => s.href === href);
      if (sheet) {
        let cssText = '';
        try {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach((rule) => {
              cssText += rule.cssText + '\n';
            });
          }
        } catch {
          // Ignore cross-origin stylesheet errors
        }
        if (cssText) {
          const styleEl = clonedDoc.createElement('style');
          styleEl.textContent = replaceOklchInText(cssText);
          clonedDoc.head.appendChild(styleEl);
        }
      }
    } catch {
      // Ignore errors
    }
    link.parentNode?.removeChild(link);
  });

  // 2. Sanitize all existing <style> elements in cloned document
  const styleEls = Array.from(clonedDoc.querySelectorAll('style'));
  styleEls.forEach((style) => {
    if (style.textContent) {
      style.textContent = replaceOklchInText(style.textContent);
    }
  });

  // 3. Process all main window stylesheets and append cleaned copies to cloned document
  try {
    const allSheets = Array.from(document.styleSheets);
    allSheets.forEach((sheet) => {
      try {
        if (sheet.cssRules) {
          let cssText = '';
          Array.from(sheet.cssRules).forEach((rule) => {
            cssText += rule.cssText + '\n';
          });
          if (/okl(ch|ab)/i.test(cssText)) {
            const cleaned = replaceOklchInText(cssText);
            const styleEl = clonedDoc.createElement('style');
            styleEl.textContent = cleaned;
            clonedDoc.head.appendChild(styleEl);
          }
        }
      } catch {
        // Ignore cross-origin stylesheet access
      }
    });
  } catch {
    // Ignore stylesheet access errors
  }

  // 3b. Sync input and textarea values so html2canvas renders user-entered text accurately
  try {
    const origInputs = document.querySelectorAll('input, textarea, select');
    const clonedInputs = clonedDoc.querySelectorAll('input, textarea, select');
    origInputs.forEach((origEl, idx) => {
      const clonedEl = clonedInputs[idx] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (clonedEl && origEl) {
        if ('value' in origEl && 'value' in clonedEl) {
          clonedEl.value = (origEl as HTMLInputElement).value;
          clonedEl.setAttribute('value', (origEl as HTMLInputElement).value);
        }
        if (origEl instanceof HTMLTextAreaElement && clonedEl instanceof HTMLTextAreaElement) {
          clonedEl.textContent = origEl.value;
        }
      }
    });
  } catch {
    // Ignore input sync errors
  }

  // 4. Process all elements in clonedDoc and replace inline style attributes and computed styles containing oklab/oklch
  const origElements = Array.from(document.querySelectorAll('*'));
  const clonedElements = Array.from(clonedDoc.querySelectorAll('*'));

  clonedElements.forEach((clonedEl, idx) => {
    const htmlEl = clonedEl as HTMLElement;

    if (htmlEl.getAttribute) {
      const styleAttr = htmlEl.getAttribute('style');
      if (styleAttr && /okl(ch|ab)/i.test(styleAttr)) {
        htmlEl.setAttribute('style', replaceOklchInText(styleAttr));
      }
      const fill = htmlEl.getAttribute('fill');
      if (fill && /okl(ch|ab)/i.test(fill)) {
        htmlEl.setAttribute('fill', replaceOklchInText(fill));
      }
      const stroke = htmlEl.getAttribute('stroke');
      if (stroke && /okl(ch|ab)/i.test(stroke)) {
        htmlEl.setAttribute('stroke', replaceOklchInText(stroke));
      }
    }

    const origEl = origElements[idx] as HTMLElement | undefined;
    if (origEl && window.getComputedStyle) {
      try {
        const computed = window.getComputedStyle(origEl);
        COLOR_PROPERTIES.forEach((prop) => {
          const val = computed.getPropertyValue(prop);
          if (val && typeof val === 'string' && /okl(ch|ab)/i.test(val)) {
            const converted = replaceOklchInText(val);
            htmlEl.style.setProperty(prop, converted, 'important');
          }
        });
      } catch {
        // Ignore computed style errors
      }
    }
  });
};

/**
 * Preloads all <img> tags inside an element to ensure html2canvas captures full image content
 */
async function preloadImagesInElement(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 2500);
        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve();
        };
        if ('decode' in img) {
          img.decode().then(() => {
            clearTimeout(timeout);
            resolve();
          }).catch(() => {
            clearTimeout(timeout);
            resolve();
          });
        }
      });
    })
  );
}

/**
 * Utility to export an HTML element directly into a high-quality PDF document.
 * Handles A4 scaling, images, logos, text rendering, and multi-page layouts.
 */
export const downloadElementAsPDF = async (
  elementOrId: HTMLElement | string,
  filename: string = 'Dokumen_LPKSM_TSN.pdf',
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<boolean> => {
  try {
    const targetEl =
      typeof elementOrId === 'string'
        ? document.getElementById(elementOrId)
        : elementOrId;

    if (!targetEl) {
      console.error('Target element for PDF export not found.');
      return false;
    }

    // Preload all images inside element
    await preloadImagesInElement(targetEl);

    // Determine if element is an A4 document canvas
    const isDocCanvas =
      targetEl.classList.contains('official-document-canvas') ||
      targetEl.id.includes('doc-canvas') ||
      targetEl.id.includes('kta-print-paper-sheet');

    // Capture the element using html2canvas with 2x scale for crisp 300DPI
    const canvas = await html2canvas(targetEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: targetEl.scrollWidth || 800,
      windowHeight: targetEl.scrollHeight || 1130,
      onclone: sanitizeDocumentForHtml2Canvas,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Initialize jsPDF A4 document
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Set margin to 0 for official document canvases so it matches exact print preview
    const margin = isDocCanvas ? 0 : 4;
    const printableWidth = pdfWidth - margin * 2;
    const printableHeight = (canvas.height * printableWidth) / canvas.width;

    if (printableHeight <= pdfHeight - margin * 2 + 2) {
      // Single page document - fill exact A4 area
      pdf.addImage(
        imgData,
        'JPEG',
        margin,
        margin,
        printableWidth,
        isDocCanvas ? pdfHeight : Math.min(printableHeight, pdfHeight - margin * 2)
      );
    } else {
      // Multi-page document
      let heightLeft = printableHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, printableHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - printableHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, printableHeight);
        heightLeft -= pdfHeight;
      }
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
};

/**
 * Utility to batch export multiple document elements into a single combined multi-page PDF.
 */
export const downloadBatchElementsAsPDF = async (
  elementIdsOrNodes: Array<HTMLElement | string>,
  filename: string = 'Kumpulan_Dokumen_LPKSM_TSN.pdf'
): Promise<boolean> => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    let isFirstPage = true;

    for (const item of elementIdsOrNodes) {
      const targetEl =
        typeof item === 'string' ? document.getElementById(item) : item;

      if (!targetEl) continue;

      await preloadImagesInElement(targetEl);

      const isDocCanvas =
        targetEl.classList.contains('official-document-canvas') ||
        targetEl.id.includes('doc-canvas') ||
        targetEl.id.includes('kta-print-paper-sheet');

      const canvas = await html2canvas(targetEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: sanitizeDocumentForHtml2Canvas,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      if (!isFirstPage) {
        pdf.addPage();
      }

      const margin = isDocCanvas ? 0 : 4;
      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = (canvas.height * printableWidth) / canvas.width;

      pdf.addImage(
        imgData,
        'JPEG',
        margin,
        margin,
        printableWidth,
        isDocCanvas ? pdfHeight : Math.min(printableHeight, pdfHeight - margin * 2)
      );
      isFirstPage = false;
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to batch generate PDF:', error);
    return false;
  }
};


