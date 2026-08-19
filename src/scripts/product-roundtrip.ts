import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';
import { Product } from '../data/product/product.entity';

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get(DataSource);

    const productRepository = dataSource.getRepository(Product);

    const product = productRepository.create({
      name: 'StarCi T-Shirt',
      priceCents: 250000,
    });

    const savedProduct = await productRepository.save(product);

    console.log('Saved product:', savedProduct);

    const foundProduct = await productRepository.findOneBy({
      id: savedProduct.id,
    });

    console.log('Found product:', foundProduct);
  } finally {
    await app.close();
  }
}

void run();