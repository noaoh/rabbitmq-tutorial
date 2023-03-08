import amqplib from "amqplib";

async function main() {
    const conn = await amqplib.connect('amqp://127.0.0.1:5672');
    const channel = await conn.createChannel();

    const queue = 'task_queue';
    const msg = process.argv.slice(2).join(' ') || 'Hello World!';

    channel.assertQueue(queue, {
        durable: true,
    });
    channel.sendToQueue(queue, Buffer.from(msg), {
        persistent: true,
    });
    console.log(`  [x] Sent ${msg}`);

    setTimeout(() => {
        conn.close();
        process.exit(0);
    }, 500);
}

await main();