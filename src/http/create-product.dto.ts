import {
  IsInt,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(1, 120)
  name!: string;

  @IsInt()
  @Min(0)
  priceCents!: number;
}