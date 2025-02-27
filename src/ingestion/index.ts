import { startKafkaIngestion } from './kafka';
import { readLinksFromCsv } from './csv';
import dotenv from 'dotenv';

dotenv.config();

const CSV_FILE_PATH = process.env.CSV_FILE_PATH || 'articles_dataset.csv';

export async function startIngestion(callback: (link: string) => void) {
  const useKafka = process.env.USE_KAFKA === 'true';

  if (useKafka) {
    try {
      await startKafkaIngestion(callback);
      console.log('Using Kafka for data ingestion');
    } catch (error) {
      console.error('Failed to start Kafka ingestion:', error);
      console.log('Falling back to CSV ingestion...');
      await readLinksFromCsv(CSV_FILE_PATH, callback);
    }
  } else {
    console.log('Kafka disabled. Using CSV ingestion...');
    await readLinksFromCsv(CSV_FILE_PATH, callback);
  }
}