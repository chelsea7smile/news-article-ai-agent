import { Client } from 'pg';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const client = new Client({
  connectionString: process.env.PG_CONNECTION_STRING,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((error) => console.error('Postgres connection error:', error));

async function createTableIfNotExists() {
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
}

async function computeEmbedding(article: { title: string; content: string; }): Promise<number[]> {
  const model = "models/text-embedding-004";
  const requestBody = {
    model,
    content: {
      parts: [{ text: `${article.title}\n\n${article.content}` }]
    },
    taskType: "RETRIEVAL_DOCUMENT",
    title: article.title
  };

  console.log('Computing embedding for:', article.title);
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${process.env.GEMINI_API_KEY}`,
    requestBody,
    {
      headers: { "Content-Type": "application/json" }
    }
  );
  
  if (!response.data || !response.data.embedding || !response.data.embedding.values) {
    console.error("Invalid embedding response from Gemini API:", response.data);
    throw new Error("Invalid embedding response from Gemini API");
  }
  console.log('Embedding computed (first 10 values):', response.data.embedding.values.slice(0, 10));
  return response.data.embedding.values;
}

function toPgVector(embedding: number[]): string {
  return '[' + embedding.join(',') + ']';
}
export async function storeInVectorDatabase(article: {
  title: string;
  content: string;
  url: string;
  date: string;
}) {
  await createTableIfNotExists();

  console.log('Storing article:', article.title);
  const embedding = await computeEmbedding({ title: article.title, content: article.content });
  const embeddingStr = toPgVector(embedding);
  console.log("Computed embedding string:", embeddingStr);

  const query = `
    INSERT INTO articles (title, content, url, date, embedding)
    VALUES ($1, $2, $3, $4, $5::vector)
    RETURNING *;
  `;
  const values = [article.title, article.content, article.url, article.date, embeddingStr];
  const res = await client.query(query, values);
  console.log('Stored article:', res.rows[0]);
  return res.rows[0];
}

export async function searchVectorDatabase(queryText: string) {
  console.log('Searching articles for query:', queryText);
  const queryEmbedding = await computeEmbedding({ title: queryText, content: queryText });
  const vectorQuery = toPgVector(queryEmbedding);

  const searchQuery = `
    SELECT title, url, date, content, embedding
    FROM articles
    ORDER BY embedding <=> $1
    LIMIT 5;
  `;
  const res = await client.query(searchQuery, [vectorQuery]);
  console.log('Search results:', res.rows);
  return res.rows;
}