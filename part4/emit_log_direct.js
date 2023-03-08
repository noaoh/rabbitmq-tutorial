import amqplib from "amqplib";

async function main() {
    let conn;
    try {
        conn = await amqplib.connect('amqp://127.0.0.1:5672');

        const channel = await conn.createChannel();
        const args = process.argv.slice(2);
        const msg = args.slice(1).join(' ') || 'Hello World!';
        const severity = (args.length > 0) ? args[0] : 'info';
        const exchange = 'direct_logs';

        await channel.assertExchange(exchange, 'direct', {
            durable: false,
        });

        channel.publish(exchange, severity, Buffer.from(msg));
        console.log(`  [x] Sent ${severity} '${msg}'`);
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