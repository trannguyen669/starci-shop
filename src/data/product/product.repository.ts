import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Product } from './product.entity';

export interface CreateProductData {
  name: string;
  priceCents: number;
}

@Injectable()
export class ProductRepository {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async create(
    data: CreateProductData,
  ): Promise<Product> {
    const repository =
      this.dataSource.getRepository(Product);

    const product =
      repository.create(data);

    return repository.save(product);
  }
}