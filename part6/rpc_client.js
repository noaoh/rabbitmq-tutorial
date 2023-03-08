#!/usr/bin/env node

import amqp from 'amqplib';
import { basename } from 'path';
import { v4 as uuid } from 'uuid';

async function main() {
    const queue = 'rpc_queue';

    const n = parseInt(process.argv[2], 10);
    if (isNaN(n)) {
        console.warn('Usage: %s number', basename(process.argv[1]));
        process.exit(1);
    }

    let connection;
    try {
        connection = await amqp.connect('amqp://127.0.0.1:5672');
        const channel = await connection.createChannel();
        const correlationId = uuid();

        const requestFib = new Promise(async (resolve) => {
            const { queue: replyTo } = await channel.assertQueue('', { exclusive: true });

            await channel.consume(replyTo, (message) => {
                if (!message) console.warn('  [x] Consumer cancelled');
                else if (message.properties.correlationId === correlationId) {
                    resolve(message.content.toString());
                }
            }, { noAck: true });

            await channel.assertQueue(queue, { durable: false });
            console.log(`  [x] Requesting fib(${n})`);
            channel.sendToQueue(queue, Buffer.from(n.toString()), {
                correlationId,
                replyTo,
            });
        });

        const fibN = await requestFib;
        console.log(`  [.] Got fib(${n}) = ${fibN}`);
    } catch (err) {
        console.warn(err);
    } finally {
        if (connection) await connection.close();
    };
}

await main();
