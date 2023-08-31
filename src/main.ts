import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from './common/exceptions';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {

  const logger = new Logger('MAIN APP');

  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableVersioning(
    {
      type: VersioningType.URI,
      prefix: 'V',
    }
  )

  app.enableCors();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(port);
  logger.log(`App listening on port ${port}`);
}
bootstrap();