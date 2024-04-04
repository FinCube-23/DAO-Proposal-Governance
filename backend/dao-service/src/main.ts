import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2'],
  });
  await app.listen(3000);
}
bootstrap();
