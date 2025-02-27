import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const {
  KAFKA_BROKER,
  KAFKA_USERNAME,
  KAFKA_PASSWORD,
  KAFKA_TOPIC_NAME,
  KAFKA_GROUP_ID_PREFIX,
} = process.env;

if (!KAFKA_BROKER || !KAFKA_USERNAME || !KAFKA_PASSWORD || !KAFKA_TOPIC_NAME || !KAFKA_GROUP_ID_PREFIX) {
  console.warn('Kafka environment variables are missing. Check your .env if you plan to use Kafka.');
}

export async function startKafkaIngestion(callback: (link: string) => void) {
  if (!KAFKA_BROKER || !KAFKA_USERNAME || !KAFKA_PASSWORD || !KAFKA_TOPIC_NAME || !KAFKA_GROUP_ID_PREFIX) {
    throw new Error('Kafka environment variables are missing. Please check your .env file.');
  }

  const kafka = new Kafka({
    clientId: 'news-article-agent',
    brokers: [KAFKA_BROKER],
    ssl: true,
    sasl: {
      mechanism: 'plain',
      username: KAFKA_USERNAME,
      password: KAFKA_PASSWORD,
    },
  });

  const consumer = kafka.consumer({ groupId: `${KAFKA_GROUP_ID_PREFIX}-consumer` });

  await consumer.connect();
  console.log('Kafka consumer connected');
  
  await consumer.subscribe({ topic: KAFKA_TOPIC_NAME, fromBeginning: false });
  console.log(`✅ Kafka subscribed to topic "${KAFKA_TOPIC_NAME}"`);

  await consumer.run({
    eachMessage: async ({ message, partition, topic }) => {
      if (!message.value) return;
      const link = message.value.toString();
      console.log(`Kafka message received from topic ${topic}, partition ${partition}: ${link}`);
      callback(link);
    },
  });
}