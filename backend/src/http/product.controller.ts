import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { ProductService } from '../domain/product.service';

import { CreateProductDto } from './create-product.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService:
      ProductService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    description: 'The product has been successfully created.',
  })
  create(
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.create(dto);
  }
}