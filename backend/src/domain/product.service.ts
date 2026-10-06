import { Injectable } from '@nestjs/common';

import {
  ProductRepository,
  type CreateProductData,
} from '../data/product/product.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository:
      ProductRepository,
  ) {}

  create(
    data: CreateProductData,
  ) {
    return this.productRepository.create(data);
  }
}