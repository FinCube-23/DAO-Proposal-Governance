import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('User Management Service API')
    .setDescription(
      'User management service provides registration and login for users',
    )
    .setVersion('1.0')
    .addTag('user-management')
    .addBearerAuth()
    .build();

  const eventBus = await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: 'proposal-update-queue', // Routing Key from where this service listens 
      queueOptions: {
        durable: true, // Make the queue durable (survive restarts)
      },
    },
  });

  app.enableCors();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
