import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

if (
  !process.env.KAFKA_BROKER ||
  !process.env.KAFKA_USERNAME ||
  !process.env.KAFKA_PASSWORD ||
  !process.env.KAFKA_TOPIC_NAME
) {
  throw new Error('One or more Kafka environment variables are missing.');
}

const kafka = new Kafka({
  clientId: 'news-producer',
  brokers: [process.env.KAFKA_BROKER],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
});

const producer = kafka.producer();

const produceMessages = async () => {
  try {
    await producer.connect();
    console.log('Producer connected');

    const messages = [
      { value: 'https://www.bbc.com/news/articles/cy4m84d2xz2o' },
      { value: 'https://www.bbc.com/news/articles/clyxypryrnko' },
      { value: 'https://www.gavi.org/vaccineswork/cameroons-historic-malaria-vaccine-introduction-shows-signs-success-one-year' },
    ];

    await producer.send({
      topic: process.env.KAFKA_TOPIC_NAME!,
      messages,
    });

    console.log('Messages sent:', messages);
  } catch (error) {
    console.error('Error sending messages:', error);
  } finally {
    await producer.disconnect();
  }
};

produceMessages();