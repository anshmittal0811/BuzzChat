import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, Producer, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
    private producer: Producer = this.kafka.producer();
    private isProducerConnected = false;

    async onModuleInit() {
        try {
            await this.producer.connect();
            this.isProducerConnected = true;
            console.log('[KAFKA] Producer connected successfully');
        } catch (error) {
            console.error('[KAFKA] Failed to connect producer:', error);
        }
    }

    async onModuleDestroy() {
        try {
            if (this.isProducerConnected) {
                await this.producer.disconnect();
                this.isProducerConnected = false;
                console.log('[KAFKA] Producer disconnected');
            }
        } catch (error) {
            console.error('[KAFKA] Error disconnecting producer:', error);
        }
    }

    async produce(topic: string, message: any) {
        try {
            if (!this.isProducerConnected) {
                await this.producer.connect();
                this.isProducerConnected = true;
            }
            
            await this.producer.send({
                topic,
                messages: [{ value: JSON.stringify(message) }],
            });
            
            console.log(`[KAFKA] Message published to topic: ${topic}`);
        } catch (error) {
            console.error(`[KAFKA] Failed to publish to topic ${topic}:`, error);
            throw error;
        }
    }

    async createConsumer(groupId: string, topics: string[], onMessage: (payload: EachMessagePayload) => Promise<void>) {
        const consumer: Consumer = this.kafka.consumer({ groupId });
        
        try {
            await consumer.connect();
            console.log(`[KAFKA] Consumer connected with groupId: ${groupId}`);
            
            for (const topic of topics) {
                await consumer.subscribe({ topic, fromBeginning: true });
                console.log(`[KAFKA] Subscribed to topic: ${topic}`);
            }
            
            await consumer.run({ 
                eachMessage: async (payload) => {
                    try {
                        await onMessage(payload);
                    } catch (error) {
                        console.error(`[KAFKA] Error processing message from topic ${payload.topic}:`, error);
                    }
                }
            });
        } catch (error) {
            console.error(`[KAFKA] Consumer error for groupId ${groupId}:`, error);
            throw error;
        }
    }
}
