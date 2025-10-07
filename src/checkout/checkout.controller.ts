import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateSessionDTO } from './data-transfer-objects/create-session.dto';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('session')
  @UseGuards(JwtAuthGuard)
  async createSession(@Body() createSessionDto: CreateSessionDTO) {
    return this.checkoutService.createSession(createSessionDto.productId);
  }

  @Post('webhook')
  async handleCheckoutWebhooks(@Body() event: any) {
    return this.checkoutService.handleCheckoutWebhook(event);
  }
}
