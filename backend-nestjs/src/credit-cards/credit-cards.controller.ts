import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import { AuthUser } from '@supabase/supabase-js';
import { CreateCreditCardDto } from './dtos/create-credit-card.dto';
import { EnrichCurrentUser } from 'src/common/interceptors/enriched-current-user.interceptor';
import { IEnrichedAuthUser } from 'src/common/interfaces/encriched-auth-user.interface';

@ApiTags('Credit Cards')
@Controller('credit-cards')
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user credit cards',
    description: 'Returns the credit cards of the logged in user',
  })
  @SupabaseGuard()
  async getCreditCards(@CurrentUser() currentUser: AuthUser) {
    return this.creditCardsService.getUserCreditCards(currentUser.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new credit card',
    description:
      'Creates a payment method in Stripe for the logged in user, links it to the Stripe client associated with the user, then adds an entry to the stripe_card table',
  })
  @ApiResponse({
    status: 201,
    description: 'The credit card has been successfully created.',
  })
  @SupabaseGuard()
  @EnrichCurrentUser()
  async createCreditCards(
    @CurrentUser() currentUser: IEnrichedAuthUser,
    @Body() createCreditCardDto: CreateCreditCardDto,
  ) {
    return this.creditCardsService.createCreditCard(
      currentUser.id,
      createCreditCardDto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user credit cards',
    description:
      'Detach and delete the credit card on Stripe, and then delete credit card in Supabase',
  })
  @SupabaseGuard()
  @EnrichCurrentUser()
  async deleteCreditCard(
    @CurrentUser() user: IEnrichedAuthUser,
    @Param('id') cardId: number,
  ) {
    return this.creditCardsService.deleteCreditCard(user, cardId);
  }
}
