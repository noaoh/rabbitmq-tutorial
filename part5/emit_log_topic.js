import amqplib from "amqplib";

async function main() {
    let conn;
    try {
        conn = await amqplib.connect('amqp://127.0.0.1:5672');

        const channel = await conn.createChannel();
        const args = process.argv.slice(2);
        const key = (args.length > 0) ? args[0] : 'anonymous.info';
        const msg = args.slice(1).join(' ') || 'Hello World!';
        const exchange = 'topic_logs';

        await channel.assertExchange(exchange, 'topic', {
            durable: false,
        });

        await channel.publish(exchange, key, Buffer.from(msg));
        console.log(`  [x] Sent ${key}:'${msg}'`);
        await channel.close();
    } catch (err) {
        console.log(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}

await main();