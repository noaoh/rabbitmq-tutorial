import amqplib from "amqplib";

async function main() {
    let conn;
    try {
        conn = await amqplib.connect('amqp://127.0.0.1:5672');

        const channel = await conn.createChannel();
        const exchange = 'logs';
        const msg = process.argv.slice(2).join(' ') || 'Hello World!';

        await channel.assertExchange(exchange, 'fanout', {
            durable: false,
        });

        channel.publish(exchange, '', Buffer.from(msg));
        console.log(`  [x] Sent ${msg}`);
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