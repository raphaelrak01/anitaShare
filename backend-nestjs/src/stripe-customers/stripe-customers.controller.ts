import {
  Body,
  // Body,
  Controller,
  Post,
  // UseGuards
} from '@nestjs/common';
import { StripeCustomersService } from './stripe-customers.service';
import {
  // ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
// import { SupabaseGuard } from 'src/supabase/supabase.guard';
// import { CreateStripeUserDto } from './dtos/create-stripe-user.dto';

@ApiTags('Stripe Customers')
@Controller('stripe-customers')
export class StripeCustomersController {
  constructor(private readonly stripeCustomerService: StripeCustomersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new Stripe Customer',
    description:
      'Create a customer in Stripe, and then, if the creation was successful, add an entry in supabase, in the stripe_customer table, to link a user to their stripe information',
  })
  // @ApiBearerAuth('JWT')
  // @UseGuards(SupabaseGuard)
  // createStripeCustomer(@Body() createStripeUserDto: CreateStripeUserDto) {
  createStripeCustomer(@Body('record') record: any) {
    //TODO: typer le record

    const { id: public_profile_id, email } = record;
    return this.stripeCustomerService.createStripeCustomer({
      public_profile_id,
      email,
    });
  }
}
