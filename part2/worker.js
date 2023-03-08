import amqplib from "amqplib";

async function main() {
    const conn = await amqplib.connect('amqp://127.0.0.1:5672');
    const channel = await conn.createChannel();

    const queue = 'task_queue';
    channel.assertQueue(queue, {
        durable: true,
    });
    channel.prefetch(1);

    channel.consume(queue, (msg) => {
        const secs = msg.content.toString().split('.').length - 1;

        console.log(`  [x] Received ${msg.content.toString()}`);
        setTimeout(() => {
            console.log('  [x] Done');
            channel.ack(msg);
        }, secs * 1000);
    }, {
        noAck: false,
    });
}

await main();