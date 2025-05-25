import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Export data as CSV
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Desired output file name
 * @returns {String} file path
 */
export const exportToCSV = (data, fileName) => {
  try {
    const fields = Object.keys(data[0] || {});
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    const filePath = path.join('exports', `${fileName}.csv`);
    fs.writeFileSync(filePath, csv);
    return filePath;
  } catch (err) {
    throw new Error('CSV Export Failed: ' + err.message);
  }
};

/**
 * Export data as PDF
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Desired output file name
 * @returns {String} file path
 */
export const exportToPDF = (data, fileName) => {
  try {
    const doc = new PDFDocument();
    const filePath = path.join('exports', `${fileName}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(18).text(`${fileName} Report`, { align: 'center' });
    doc.moveDown();

    data.forEach((item, idx) => {
      doc.fontSize(12).text(`Record ${idx + 1}:`);
      Object.entries(item).forEach(([key, value]) => {
        doc.text(`  ${key}: ${value}`);
      });
      doc.moveDown();
    });

    doc.end();
    return filePath;
  } catch (err) {
    throw new Error('PDF Export Failed: ' + err.message);
  }
};
