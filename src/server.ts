import { createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { schema } from './schema';
import { startIngestion } from './ingestion';
import { extractArticleContent } from './content/extractor';
import { storeInVectorDatabase } from './vector';
import { Langfuse } from 'langfuse';

dotenv.config();

if (!process.env.LANGFUSE_API_KEY || !process.env.LANGFUSE_PUBLIC_KEY) {
  throw new Error('Missing LANGFUSE_API_KEY or LANGFUSE_PUBLIC_KEY in .env');
}
const langfuse = new Langfuse({
  secretKey: process.env.LANGFUSE_API_KEY,
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
});
console.log('Langfuse initialized.');

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  landingPage: process.env.NODE_ENV !== 'production'
});
const httpServer = createServer(yoga);
const PORT = Number(process.env.PORT) || 3000;

startIngestion(async (link: string) => {
  console.log('Received link from ingestion:', link);
  try {
    const article = await extractArticleContent(link);
    console.log('Extracted article:', article.title, `(content length: ${article.content.length})`);
    if (article) {
      const storedArticle = await storeInVectorDatabase(article);
      console.log(`Article stored from link: ${link}`, storedArticle);
    } else {
      console.warn(`Failed to extract article from link: ${link}`);
    }
  } catch (error) {
    console.error('Error processing link:', link, error);
  }
});

httpServer.listen(PORT, () => {
  console.log(`GraphQL server is running on http://localhost:${PORT}`);
});