import amqplib from "amqplib";

async function main() {
    const conn = await amqplib.connect('amqp://127.0.0.1:5672');
    const channel = await conn.createChannel();

    const queue = 'hello';
    const msg = 'Hello world';

    await channel.assertQueue(queue, {
        durable: false,
    });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(`  [x] Sent ${msg}`);

    await channel.close();
    await conn.close();
}

await main();
