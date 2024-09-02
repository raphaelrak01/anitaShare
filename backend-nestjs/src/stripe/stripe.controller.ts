import { Controller, Post, RawBodyRequest, Req, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}
  @Post('webhook')
  @ApiOperation({
    summary: 'Stripe webhook',
    description:
      'Webhook used by Stripe to return payment events (e.g. successful payment, failed payment, payment requiring 3DS etc.)',
  })
  webhook(@Headers() headers, @Req() req: RawBodyRequest<Request>) {
    const signature = headers['stripe-signature'];
    console.log(headers);
    console.log(req.rawBody);
    return this.stripeService.webhook(signature, req.rawBody);
  }
}
