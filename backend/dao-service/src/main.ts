import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { Transport, TcpOptions, MicroserviceOptions } from '@nestjs/microservices';
import { otelSDK } from './tracing';


async function bootstrap() {
  await otelSDK.start();
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'],
  });

  const microservice = await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: 'proposal-update-queue', // Routing Key
      queueOptions: {
        durable: true,  // Make the queue durable (survive restarts)
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('DAO service API')
    .setDescription(
      'DAO Service provides interaction services with the FincubeDAO contract',
    )
    .setVersion('1.0')
    .addTag('dao')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.startAllMicroservices();
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
