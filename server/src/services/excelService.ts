import ExcelJS from 'exceljs';
import type { ReportRow } from './reportData.service.js';
import { statusLabel } from './reportData.service.js';

interface ReportMeta {
  companyName: string;
  systemName: string;
}

export async function generateReportExcel(rows: ReportRow[], meta: ReportMeta): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = meta.companyName;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('التقرير', {
    views: [{ rightToLeft: true }],
  });

  sheet.mergeCells('A1:H1');
  sheet.getCell('A1').value = meta.companyName;
  sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0B2545' } };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.mergeCells('A2:H2');
  sheet.getCell('A2').value = meta.systemName;
  sheet.getCell('A2').font = { size: 12, color: { argb: 'FF555555' } };
  sheet.getCell('A2').alignment = { horizontal: 'center' };

  sheet.mergeCells('A3:H3');
  sheet.getCell('A3').value = `تاريخ التصدير: ${new Date().toLocaleDateString('en-GB')}`;
  sheet.getCell('A3').font = { size: 9, color: { argb: 'FF888888' } };
  sheet.getCell('A3').alignment = { horizontal: 'center' };

  sheet.addRow([]);

  const headerRow = sheet.addRow([
    'الفئة',
    'المؤشر',
    'السنة',
    'الربع',
    'القيمة الحالية',
    'القيمة السابقة',
    'المستهدف',
    'الفرق',
    'نسبة النمو %',
    'نسبة الإنجاز %',
    'الحالة',
    'آخر تحديث',
  ]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B2545' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  rows.forEach((row, idx) => {
    const dataRow = sheet.addRow([
      row.categoryName,
      row.kpiName,
      row.year,
      row.quarter,
      row.currentValue,
      row.previousValue,
      row.target,
      row.currentValue - row.target,
      row.growthPercent,
      row.achievementPercent,
      statusLabel(row.status),
      new Date(row.updatedAt).toLocaleDateString('en-GB'),
    ]);
    dataRow.eachCell((cell) => {
      cell.alignment = { horizontal: 'center' };
    });
    if (idx % 2 === 0) {
      dataRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F7FA' } };
      });
    }
  });

  sheet.columns.forEach((col) => {
    col.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
