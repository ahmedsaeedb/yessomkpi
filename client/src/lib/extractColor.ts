/**
 * Samples an uploaded logo image on an offscreen canvas and returns an
 * approximate dominant brand color as a #rrggbb hex string. Pixels close to
 * white/black/transparent are skipped so the logo's mark color wins over its background.
 */
export function extractDominantColor(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const size = 48;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const [pr, pg, pb, pa] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
          if (pa < 128) continue;

          const max = Math.max(pr, pg, pb);
          const min = Math.min(pr, pg, pb);
          const lightness = (max + min) / 2 / 255;
          const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));

          // skip near-white, near-black, and low-saturation (grey) pixels
          if (lightness > 0.92 || lightness < 0.08 || saturation < 0.15) continue;

          r += pr;
          g += pg;
          b += pb;
          count++;
        }

        if (count === 0) {
          resolve(null);
          return;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        resolve(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}
