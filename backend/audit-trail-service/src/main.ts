import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    logger: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'],
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3000,
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
  const document = SwaggerModule.createDocument(swaggerApp, config);
  SwaggerModule.setup('api', swaggerApp, document);
  await app.listen();
  // Start the Swagger application on a different port
  await swaggerApp.listen(3232);
}
bootstrap();
