import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import Share from 'react-native-share';
import * as XLSX from 'xlsx';
import { bytesToBase64, utf8Bytes } from '@/utils/base64';

export type ReportExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportSection {
  heading: string;
  columns: string[];
  rows: (string | number)[][];
}

/** Isi dokumen ekspor — sama dengan web (`report-export-types.ts`). */
export interface ExportDocument {
  title: string;
  subtitle?: string;
  sections: ExportSection[];
}

const MIME: Record<ReportExportFormat, string> = {
  pdf: 'application/pdf',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
};

/** Nama file tanpa ekstensi (ekstensi ditambahkan dari mime saat file ditulis). */
export function reportFileBaseName(dateFrom: string, dateTo: string): string {
  return `laporan_${dateFrom}_${dateTo}`;
}

export function reportFileExtension(format: ReportExportFormat): string {
  return format === 'excel' ? 'xlsx' : format;
}

// ---- CSV -----------------------------------------------------------------

function escapeCsvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const toCsvRow = (fields: (string | number)[]) =>
  fields.map(escapeCsvField).join(',');

function csvBase64(doc: ExportDocument): string {
  const lines: string[] = [toCsvRow([doc.title])];
  if (doc.subtitle) {
    lines.push(toCsvRow([doc.subtitle]));
  }
  for (const section of doc.sections) {
    lines.push('', toCsvRow([section.heading]), toCsvRow(section.columns));
    for (const row of section.rows) {
      lines.push(toCsvRow(row));
    }
  }
  // BOM supaya Excel membaca UTF-8 dengan benar.
  return bytesToBase64(utf8Bytes(`﻿${lines.join('\r\n')}`));
}

// ---- Excel ---------------------------------------------------------------

function sanitizeSheetName(name: string, usedNames: Set<string>): string {
  const cleaned =
    name
      .replace(/[:\\/?*[\]]/g, ' ')
      .trim()
      .slice(0, 31) || 'Sheet';
  let candidate = cleaned;
  let suffix = 2;
  while (usedNames.has(candidate)) {
    candidate = `${cleaned.slice(0, 28)} ${suffix}`;
    suffix += 1;
  }
  usedNames.add(candidate);
  return candidate;
}

function excelBase64(doc: ExportDocument): string {
  const workbook = XLSX.utils.book_new();
  const usedNames = new Set<string>();
  for (const section of doc.sections) {
    const worksheet = XLSX.utils.aoa_to_sheet([
      [section.heading],
      section.columns,
      ...section.rows,
    ]);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      sanitizeSheetName(section.heading, usedNames),
    );
  }
  return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
}

// ---- PDF -----------------------------------------------------------------

const PDF_PRIMARY_COLOR: [number, number, number] = [18, 132, 107];
const PDF_MARGIN = 14;

/** Font bawaan PDF (WinAnsi) tidak punya tanda minus "−" yang dipakai format uang. */
const pdfText = (value: string | number) => String(value).replace(/−/g, '-');

function pdfBase64(doc: ExportDocument): string {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let cursorY = 18;

  pdf.setFontSize(16);
  pdf.text(pdfText(doc.title), PDF_MARGIN, cursorY);
  cursorY += 6;

  if (doc.subtitle) {
    pdf.setFontSize(10);
    pdf.setTextColor(120);
    pdf.text(pdfText(doc.subtitle), PDF_MARGIN, cursorY);
    pdf.setTextColor(0);
    cursorY += 6;
  }

  for (const section of doc.sections) {
    if (cursorY > pageHeight - 40) {
      pdf.addPage();
      cursorY = 18;
    }
    pdf.setFontSize(12);
    pdf.text(pdfText(section.heading), PDF_MARGIN, cursorY + 6);

    autoTable(pdf, {
      startY: cursorY + 10,
      head: [section.columns.map(pdfText)],
      body: section.rows.map(row => row.map(pdfText)),
      styles: { fontSize: 9 },
      headStyles: { fillColor: PDF_PRIMARY_COLOR },
      margin: { left: PDF_MARGIN, right: PDF_MARGIN },
    });

    const finalY = (pdf as unknown as { lastAutoTable?: { finalY: number } })
      .lastAutoTable?.finalY;
    cursorY = (finalY ?? cursorY + 10) + 12;
  }

  // "data:application/pdf;filename=…;base64,XXXX" → ambil bagian base64 saja.
  const dataUri = pdf.output('datauristring');
  return dataUri.slice(dataUri.indexOf('base64,') + 'base64,'.length);
}

// ---- Share ---------------------------------------------------------------

/**
 * Membuat file laporan lalu membuka share sheet Android (simpan ke Files/Drive, kirim, atau buka).
 * Mengembalikan `false` bila pengguna menutup share sheet tanpa memilih apa pun.
 */
export async function shareReport(
  format: ReportExportFormat,
  fileBaseName: string,
  doc: ExportDocument,
): Promise<boolean> {
  const base64 =
    format === 'csv'
      ? csvBase64(doc)
      : format === 'excel'
      ? excelBase64(doc)
      : pdfBase64(doc);
  const result = await Share.open({
    url: `data:${MIME[format]};base64,${base64}`,
    type: MIME[format],
    filename: fileBaseName,
    // FileProvider bawaan library hanya mencakup cache internal (bukan external cache).
    useInternalStorage: true,
    failOnCancel: false,
  });
  return result.success !== false && !result.dismissedAction;
}
