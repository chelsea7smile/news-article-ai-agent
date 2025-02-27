# News Article Agent
video demo - https://www.loom.com/share/986e630926554c23aa09144b08b52ce8

This repository contains a Node.js-based query-response application that integrates with a large language model (LLM) to build a Retrieval-Augmented Generation (RAG) system. The application ingests a dataset of recent news article URLs, extracts and cleans the content, computes embeddings, and stores the data in a vector database. When a user sends a query, the system retrieves relevant articles from the database and generates an answer using the Gemini API.

## Features

- **Data Ingestion:**  
  - **Kafka:** Ingest news article URLs in real-time (preferred).  
  - **CSV:** Fallback to a CSV file (`articles_dataset.csv`) if Kafka is unavailable.
- **Content Extraction:**  
  Downloads HTML content from the URL and extracts the main article using JSDOM and Readability.
- **Vector Storage:**  
  Computes embeddings for each article using the Gemini API and stores the article with its embedding in a PostgreSQL database using the pgvector extension.
- **GraphQL API:**  
  A GraphQL endpoint (implemented with GraphQL Yoga) that accepts user queries and returns generated answers along with a list of relevant article sources.
- **Monitoring:**  
  Integration with Langfuse for enhanced monitoring and debugging.
- **Containerized Deployment:**  
  Docker and Docker Compose are used to simplify setup and deployment.

## Technologies Used

- **Backend:** Node.js, TypeScript  
- **API:** GraphQL Yoga  
- **Data Ingestion:** Kafka (using kafkajs) and CSV (using csv-parser)  
- **Content Extraction:** axios, JSDOM, @mozilla/readability  
- **Database:** PostgreSQL with pgvector  
- **LLM Integration:** Gemini API  
- **Monitoring:** Langfuse  
- **Containerization:** Docker, Docker Compose

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for Docker-based deployment)
- Node.js (if you want to run locally without Docker)

### Environment Variables

Create a `.env` file in the root directory with your configuration. For example:
LLM & Monitoring

GEMINI_API_KEY=your-gemini-api-key
LANGFUSE_API_KEY=your-langfuse-api-key
LANGFUSE_PUBLIC_KEY=your-langfuse-public-key
LANGFUSE_BASE_URL=https://cloud.langfuse.com

PostgreSQL

PG_CONNECTION_STRING=postgresql://username:password@localhost:5432/yourdbname

Kafka Configuration (if using Kafka ingestion)


CSV Fallback

CSV_FILE_PATH=./articles_dataset.csv

Server Port

PORT=3001

> **Note:** Do not expose sensitive keys publicly. Use appropriate mechanisms (like environment variables) to secure your credentials.

### Running Locally via Docker

1. **Build and Run Containers:**

   From the root of the project, run:

   ```bash
   docker compose up --build

This command will build and start two containers:
	•	db: PostgreSQL (with pgvector installed).
	•	app: The Node.js application.

	2.	Access the Application:
The GraphQL API will be available at http://localhost:3000.

Running Locally Without Docker
	1.	Install Dependencies:
  npm install

  	2.	Start PostgreSQL:
Ensure your PostgreSQL server is running and accessible via the connection string defined in PG_CONNECTION_STRING.
	3.	Run the Application:
  npx ts-node src/server.ts

The GraphQL API will be available at http://localhost:3001.

Using the GraphQL API

You can test the application using the following sample GraphQL queries in a GraphQL playground or any HTTP client (e.g., Postman):
query {
  agent(query: "Tell me the latest news about Justin Trudeau") {
    answer
    sources {
      title
      url
      date
    }
  }
}

query {
  agent(query: "What do you know about LA fires?") {
    answer
    sources {
      title
      url
      date
    }
  }
}

query {
  agent(query: "Summarize this article: https://www.bbc.com/news/articles/clyxypryrnko") {
    answer
    sources {
      title
      url
      date
    }
  }
}


How It Works
	1.	Data Ingestion:
	•	Kafka: If USE_KAFKA is true, the application consumes URLs from the specified Kafka topic.
	•	CSV: If Kafka ingestion fails or is disabled, the application reads URLs from articles_dataset.csv.
	2.	Content Extraction:
Each URL is fetched, and the main content is extracted using JSDOM and Readability.
	3.	Vector Storage:
The extracted article (with title, content, URL, and current date) is processed to compute an embedding using the Gemini API. The article and its embedding are then stored in a PostgreSQL database with pgvector.
	4.	Query Processing:
When a user submits a query through the GraphQL API, the system:
	•	Searches the vector database for articles with similar embeddings.
	•	Constructs a prompt that includes the user query and the content of the relevant articles.
	•	Sends the prompt to the Gemini API to generate an answer.
	•	Returns the generated answer along with a list of source articles.


Optimizations & Future Enhancements
	•	Cost/Token Usage: Consider caching embeddings or using batching for API calls to reduce the number of calls to the Gemini API.
	•	Latency: Use response streaming to improve perceived performance for large responses.
	•	Monitoring: Leverage Langfuse to monitor API performance and errors.

License

This project is licensed under the MIT License.