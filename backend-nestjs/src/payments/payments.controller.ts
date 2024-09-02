import {
  Body,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { EnrichCurrentUser } from 'src/common/interceptors/enriched-current-user.interceptor';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IEnrichedAuthUser } from 'src/common/interfaces/encriched-auth-user.interface';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import {
  GetSupabaseResources,
  IGetSupabaseResourceDecoratorParams,
} from 'src/common/decorators/get-supabase-resource.decorator';
import { Order } from 'src/orders/models/order.model';
import { SupabaseResource } from 'src/common/decorators/supabase-resource.decorator';
import { SupabaseResourceGuard } from 'src/common/guards/supabase-resource.guard';
import { EOrderStatus } from 'src/orders/enums/order-status.enum';
import { CreditCard } from 'src/credit-cards/models/credit-card.model';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create payment',
    description: 'Create payment in Stripe',
  })
  @SupabaseGuard()
  @EnrichCurrentUser()
  @UseGuards(SupabaseResourceGuard)
  @GetSupabaseResources(
    {
      resourceId: 'order_id',
      resourceClass: Order,
    } as IGetSupabaseResourceDecoratorParams,
    {
      resourceId: 'selected_card_id',
      resourceClass: CreditCard,
    } as IGetSupabaseResourceDecoratorParams,
  )
  // @GetSupabaseResources()
  createPayment(
    @CurrentUser() user: IEnrichedAuthUser,
    @Body() createPaymentDto: CreatePaymentDto,
    @SupabaseResource('order_id') order: Order,
    @SupabaseResource('selected_card_id') selectedCreditCard: CreditCard,
  ) {
    if (!order.isOwner(user)) {
      throw new ForbiddenException(
        `User ${user.id} is not authorized to access the order  ${order.id}`,
      );
    }
    if (!selectedCreditCard.isOwner(user)) {
      throw new ForbiddenException(
        `User ${user.id} is not the owner oh the card ${selectedCreditCard.id}`,
      );
    }
    if (order.status !== EOrderStatus.CREATED)
      throw new InternalServerErrorException('Order already processed');
    return this.paymentsService.createPayment(user, order, selectedCreditCard);
  }
}
