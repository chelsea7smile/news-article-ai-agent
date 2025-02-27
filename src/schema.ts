import { makeExecutableSchema } from '@graphql-tools/schema';
import { searchVectorDatabase } from './vector';
import { generateResponse } from './llm/gemini';

const typeDefs = /* GraphQL */ `
  type Source {
    title: String!
    url: String!
    date: String!
  }

  type AgentResponse {
    answer: String!
    sources: [Source!]!
  }

  type Query {
    agent(query: String!): AgentResponse!
  }
`;

const resolvers = {
  Query: {
    agent: async (_: any, { query }: { query: string }) => {
      const relevantArticles = await searchVectorDatabase(query);

      let prompt = `User Query: ${query}\n\n`;
      if (relevantArticles.length > 0) {
        prompt += "Context:\n";
        relevantArticles.forEach((article: any, index: number) => {
          prompt += `${index + 1}. Title: ${article.title}\nContent: ${article.content}\n\n`;
        });
      }

      const llmResponse = await generateResponse(prompt);
      const answer = llmResponse.answer || "No answer generated";

      const sources = relevantArticles.map((article: any) => ({
        title: article.title,
        url: article.url,
        date: new Date(article.date).toISOString()
      }));

      return { answer, sources };
    }
  }
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });