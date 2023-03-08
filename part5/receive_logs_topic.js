import amqplib from "amqplib";

async function main() {
    try {
        const args = process.argv.slice(2);
        if (args.length === 0) {
            console.log("Usage: receive_logs_topic.js <facility>.<severity>");
            process.exit(1);
        }

        const conn = await amqplib.connect('amqp://127.0.0.1:5672');
        const channel = await conn.createChannel();

        const exchange = 'topic_logs';

        process.once('SIGINT', async () => {
            await channel.close();
            await conn.close();
        });

        await channel.assertExchange(exchange, 'topic', {
            durable: false,
        });

        const { queue } = await channel.assertQueue('', {
            exclusive: true,
        });
        console.log('  [*] Waiting for logs.  To exit press CTRL+C');

        args.forEach(async (key) => {
            await channel.bindQueue(queue, exchange, key);
        });

        await channel.consume(queue, (msg) => {
            if (msg) {
                console.log(`  [x] ${msg.fields.routingKey}:'${msg.content.toString()}'`);
            } else {
                console.warn('  [x] Consumer cancelled');
            }
        }, {
            noAck: true,
        });
    } catch (err) {
        console.log(err);
    }
}

await main();