import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

export function ValidateAuth(): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        // Create a RabbitMQ client
        const client: ClientProxy = ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost'], // Change to your RabbitMQ URL
            queue: 'validate-authorization',
            queueOptions: { durable: false },
          },
        });

        // Send validation request and wait for response
        const userId = args[0]; // Assuming the first argument is userId
        const response = await client.send('validate-authorization', { userId }).toPromise();

        if (response?.status === 'success') {
          return await originalMethod.apply(this, args);
        } else {
          throw new Error('Authorization failed');
        }
      } catch (error) {
        console.error('Authorization error:', error);
        throw error;
      }
    };

    return descriptor;
  };
}
