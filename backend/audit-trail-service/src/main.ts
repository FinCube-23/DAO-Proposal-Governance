import { Transport, TcpOptions, MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    logger: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'],
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672/'],
      queue: 'proposal-queue',
    },
  });

  // Create a separate NestApplication instance for Swagger
  const swaggerApp = await NestFactory.create(AppModule);
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
  await app.listen(3000);

}
bootstrap();

