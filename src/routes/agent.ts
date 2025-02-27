import { Router, Request, Response, NextFunction } from 'express';
import { searchVectorDatabase } from '../vector';
import { generateResponse } from '../llm/gemini';

const router = Router();

router.post('/agent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query field is required.' });
      return;
    }

    const relevantArticles = await searchVectorDatabase(query);

    let prompt = `User Query: ${query}\n\n`;
    if (relevantArticles.length > 0) {
      prompt += "Context:\n";
      relevantArticles.forEach((article: any, index: number) => {
        prompt += `${index + 1}. Title: ${article.title}\nContent: ${article.content}\n\n`;
      });
    }

    const llmResponse = await generateResponse(prompt);
    const answer = llmResponse.generated_text || llmResponse.answer || "No answer generated";

    const sources = relevantArticles.map((article: any) => ({
      title: article.title,
      url: article.url,
      date: new Date(article.date).toISOString(),
    }));

    res.json({ answer, sources });
  } catch (error) {
    console.error('Error processing /agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;