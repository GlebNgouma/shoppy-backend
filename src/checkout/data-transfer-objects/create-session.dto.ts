import { IsNumber } from 'class-validator';

export class CreateSessionDTO {
  @IsNumber()
  productId: number;
}
