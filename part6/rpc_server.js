#!/usr/bin/env node
import amqp from 'amqplib';


const fibMap = new Map();
fibMap.set(0, 1);
fibMap.set(1, 1);

function fib(n) {
  if (isNaN(n) || n < 0) {
    return -1;
  }

  if (fibMap.has(n)) {
    return fibMap.get(n);
  } else {
    const res = fib(n - 1) + fib(n - 2);
    fibMap.set(n, res);
    return res;
  }
}

async function main() {
  try {
    const queue = 'rpc_queue';
    const connection = await amqp.connect('amqp://127.0.0.1:5672');
    const channel = await connection.createChannel();

    process.once('SIGINT', async () => { 
      await channel.close();
      await connection.close();
    });

    await channel.assertQueue(queue, { durable: false });

    channel.prefetch(1);
    await channel.consume(queue, (message) => {
      const n = parseInt(message.content.toString(), 10);
      console.log(`  [.] fib(${n})`);
      const response = fib(n);
      channel.sendToQueue(message.properties.replyTo, Buffer.from(response.toString()), {
        correlationId: message.properties.correlationId
      });
      channel.ack(message);
    });

    console.log('  [x] Awaiting RPC requests. To exit press CTRL+C.');
  }
  catch (err) {
    console.warn(err);
  }
}

await main();
