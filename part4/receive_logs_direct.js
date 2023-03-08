import amqplib from "amqplib";

async function main() {
    try {
        const args = process.argv.slice(2);
        if (args.length === 0) {
            console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
            process.exit(1);
        }

        const conn = await amqplib.connect('amqp://127.0.0.1:5672');
        const channel = await conn.createChannel();

        const exchange = 'direct_logs';

        process.once('SIGINT', async () => {
            await channel.close();
            await conn.close();
        });

        await channel.assertExchange(exchange, 'direct', {
            durable: false,
        });

        const { queue } = await channel.assertQueue('', {
            exclusive: true,
        });

        console.log('  [*] Waiting for logs.  To exit press CTRL+C')

        args.forEach(async (severity) => {
            await channel.bindQueue(queue, exchange, severity);
        });

        await channel.consume(queue, (message) => {
            if (message) {
                console.log(`  [x] ${message.fields.routingKey}: '${message.content.toString()}'`);
            } else {
                console.warn('  [x] Consumer cancelled')
            }
        }, {
            noAck: true 
        });
    } catch (err) {
        console.warn(err);
    }
}

await main();