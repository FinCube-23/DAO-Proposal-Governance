import { Transport, TcpOptions, MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose']
  });
  const microservice = await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: 'pending-proposal-queue',  //Routing Key
      queueOptions: {
        durable: true,  // Make the queue durable (survive restarts)
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Audit Trail service API')
    .setDescription(
      'Audit Trail Service provides auditing the transactions occurring on chain',
    )
    .setVersion('1.0')
    .addTag('audit-trail')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  app.startAllMicroservices();
  app.enableCors();
  await app.listen(3000);
}
bootstrap();

