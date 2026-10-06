import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {

@ApiProperty({
    description: 'Mug',
    example: 'Product name',
  })

  @IsString()
  @Length(1, 120)
  name!: string;

  @IsInt()
  @Min(0)
  priceCents!: number;
}