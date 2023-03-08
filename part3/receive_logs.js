import amqplib from "amqplib";

async function main() {
    try {
        const conn = await amqplib.connect('amqp://127.0.0.1:5672');
        const channel = await conn.createChannel();

        const exchange = 'logs';

        process.once('SIGINT', async () => {
            await channel.close();
            await conn.close();
        });

        await channel.assertExchange(exchange, 'fanout', {
            durable: false,
        });

        const { queue } = await channel.assertQueue('', {
            exclusive: true,
        });
        await channel.bindQueue(queue, exchange, '');

        await channel.consume(queue, (message) => {
            if (message) {
                console.log(`  [x] '${message.content.toString()}'`);
            } else {
                console.warn('  [x] Consumer cancelled')
            }
        }, { noAck: true });

        console.log('  [*] Waiting for logs.  To exit press CTRL+C')
    } catch (err) {
        console.warn(err);
    }
}

await main();