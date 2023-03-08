import amqplib from "amqplib";

async function main() {
    const conn = await amqplib.connect('amqp://127.0.0.1:5672');
    const channel = await conn.createChannel();

    const queue = 'hello';
    await channel.assertQueue(queue, {
        durable: false,
    });

    console.log(`  [*] Waiting for messages in ${queue}.  To exit press CTRL+C`);
    channel.consume(queue, (msg) => {
        console.log(`  [x] Received ${msg.content.toString()}`);
    }, {
        noAck: true,
    });
}

await main();