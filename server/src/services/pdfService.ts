import PDFDocument from 'pdfkit';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ReportRow } from './reportData.service.js';
import { statusLabel } from './reportData.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_REGULAR = path.resolve(__dirname, '..', 'assets', 'fonts', 'Amiri-Regular.ttf');
const FONT_BOLD = path.resolve(__dirname, '..', 'assets', 'fonts', 'Amiri-Bold.ttf');

interface ReportMeta {
  companyName: string;
  systemName: string;
  logoPath?: string | null;
  generatedBy?: string;
}

const COLUMNS = [
  { key: 'categoryName', label: 'الفئة', width: 90 },
  { key: 'kpiName', label: 'المؤشر', width: 110 },
  { key: 'period', label: 'الفترة', width: 55 },
  { key: 'currentValue', label: 'القيمة الحالية', width: 65 },
  { key: 'target', label: 'المستهدف', width: 60 },
  { key: 'achievementPercent', label: 'نسبة الإنجاز', width: 65 },
  { key: 'growthPercent', label: 'النمو %', width: 55 },
  { key: 'status', label: 'الحالة', width: 60 },
];

/**
 * pdfkit/fontkit already perform full Arabic glyph shaping + bidi reordering
 * when given plain logical-order Unicode text, as long as the registered font
 * (Amiri here) ships proper GSUB shaping tables. No manual reshaping/reversal
 * is needed - and doing it manually actively breaks rendering.
 *
 * fontkit's Arabic shaper occasionally collapses the space between two words
 * when specific letter shapes are adjacent across the word boundary (e.g. two
 * final/initial Qaf forms). Doubling spaces reliably keeps the gap without
 * otherwise affecting layout.
 */
function t(text: string): string {
  return text.replace(/ /g, '  ');
}
export function generateReportPdf(rows: ReportRow[], meta: ReportMeta): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.registerFont('Arabic', FONT_REGULAR);
    doc.registerFont('Arabic-Bold', FONT_BOLD);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const rightEdge = doc.page.width - doc.page.margins.right;

    // Header
    if (meta.logoPath && fs.existsSync(meta.logoPath)) {
      try {
        doc.image(meta.logoPath, doc.page.margins.left, doc.page.margins.top, { height: 40 });
      } catch {
        // ignore invalid image
      }
    }

    doc
      .font('Arabic-Bold')
      .fontSize(18)
      .text(t(meta.companyName), doc.page.margins.left, doc.page.margins.top, {
        width: pageWidth - 60,
        align: 'right',
      });
    doc
      .font('Arabic')
      .fontSize(12)
      .fillColor('#555')
      .text(t(meta.systemName), { width: pageWidth - 60, align: 'right' });

    const now = new Date();
    doc
      .fontSize(9)
      .fillColor('#888')
      .text(t(`تاريخ التقرير: ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB')}`), {
        width: pageWidth,
        align: 'right',
      });

    doc.moveDown(1.2);
    doc.fillColor('#000');

    const startY = doc.y;
    let y = startY;
    const rowHeight = 22;
    const headerHeight = 24;

    function drawHeader(atY: number) {
      let x = rightEdge;
      doc.font('Arabic-Bold').fontSize(9);
      for (const col of COLUMNS) {
        x -= col.width;
        doc.rect(x, atY, col.width, headerHeight).fill('#0B2545');
        doc.fillColor('#FFFFFF').text(t(col.label), x + 4, atY + 7, { width: col.width - 8, align: 'center' });
      }
      doc.fillColor('#000');
      return atY + headerHeight;
    }

    y = drawHeader(y);

    doc.font('Arabic').fontSize(8.5);

    rows.forEach((row, idx) => {
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
        y = drawHeader(y);
        doc.font('Arabic').fontSize(8.5);
      }

      if (idx % 2 === 0) {
        doc.rect(doc.page.margins.left, y, pageWidth, rowHeight).fill('#F5F7FA');
        doc.fillColor('#000');
      }

      const values: Record<string, string> = {
        categoryName: row.categoryName,
        kpiName: row.kpiName,
        period: `${row.quarter} ${row.year}`,
        currentValue: `${row.currentValue} ${row.unit}`,
        target: `${row.target} ${row.unit}`,
        achievementPercent: `${row.achievementPercent}%`,
        growthPercent: `${row.growthPercent}%`,
        status: statusLabel(row.status),
      };

      let x = rightEdge;
      for (const col of COLUMNS) {
        x -= col.width;
        const text = values[col.key] ?? '';
        doc.text(t(text), x + 4, y + 6, { width: col.width - 8, align: 'center' });
      }

      // row border
      doc
        .moveTo(doc.page.margins.left, y + rowHeight)
        .lineTo(rightEdge, y + rowHeight)
        .strokeColor('#E2E8F0')
        .lineWidth(0.5)
        .stroke();

      y += rowHeight;
    });

    if (rows.length === 0) {
      doc
        .font('Arabic')
        .fontSize(11)
        .fillColor('#888')
        .text(t('لا توجد بيانات مطابقة لعوامل التصفية المحددة'), doc.page.margins.left, y + 20, {
          width: pageWidth,
          align: 'center',
        });
    }

    // Footer with page numbers
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .font('Arabic')
        .fontSize(8)
        .fillColor('#999')
        .text(t(`صفحة ${i + 1} من ${range.count}`), doc.page.margins.left, doc.page.height - 25, {
          width: pageWidth,
          align: 'center',
        });
    }

    doc.end();
  });
}
