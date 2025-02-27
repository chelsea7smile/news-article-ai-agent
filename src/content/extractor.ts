import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function extractArticleContent(url: string) {
  try {
    console.log(`Extracting content from URL: ${url}`);
    const { data: html } = await axios.get(url, { responseType: 'text' });
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      throw new Error(`Unable to parse article content from URL: ${url}`);
    }
    
    return {
      title: article.title || 'Untitled',
      content: article.textContent || article.content || '',
      url,
      date: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    throw error;
  }
}
