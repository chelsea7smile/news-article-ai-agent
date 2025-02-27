import { Client } from 'pg';

export async function createTableIfNotExists(client: Client) {
  const query = `
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      url TEXT NOT NULL,
      date DATE NOT NULL,
      embedding vector(768)
    );
  `;
  await client.query(query);
  console.log("Table 'articles' ensured to exist.");
}