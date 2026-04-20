import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsNumber, Min, MaxLength, IsUUID } from 'class-validator';

// ✅ GraphQL Input Type avec validation
@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @MaxLength(200)
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  stock: number;

  @Field()
  @IsUUID()
  categoryId: string;
}