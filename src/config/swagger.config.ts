import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
.setTitle('Test Backend')
.setDescription('Test API description')
.setVersion('1.0')
.addTag('Test')
.addBearerAuth()
.build();