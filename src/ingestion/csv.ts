import fs from 'fs';
import csv from 'csv-parser';


export async function readLinksFromCsv(filePath: string, callback: (link: string) => void) {
  return new Promise<void>((resolve, reject) => {
    let count = 0;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        console.log('CSV row read:', row);
        const link = row.URL || row.url;
        if (link) {
          count++;
          callback(link);
        }
      })
      .on('end', () => {
        console.log(`✅ CSV file successfully processed, total links: ${count}`);
        resolve();
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}