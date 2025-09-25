import './tracing'; 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { WinstonLogger } from './shared/common/logger/winston-logger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
    logger: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'],
  });

  const config = new DocumentBuilder()
    .setTitle('Web3 Proxy Service API')
    .setDescription('Web3 Proxy Service is used to interact with smart-contract')
    .setVersion('1.0')
    .addTag('web3-proxy')
    .build();

  const winstonLogger = app.get(WinstonLogger);
  app.useLogger(winstonLogger);

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
