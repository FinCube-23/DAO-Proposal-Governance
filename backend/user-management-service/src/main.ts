import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { Transport, MicroserviceOptions, RmqOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const microservice = await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: 'proposal-queue', // Queue name
    },
  });

  const config = new DocumentBuilder()
    .setTitle('User Management Service API')
    .setDescription(
      'User management service provides registration and login for users',
    )
    .setVersion('1.0')
    .addTag('user-management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  app.startAllMicroservices();
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
