import {
  Body,
  Controller,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import { SupabaseResourceGuard } from 'src/common/guards/supabase-resource.guard';
import {
  GetSupabaseResources,
  IGetSupabaseResourceDecoratorParams,
} from 'src/common/decorators/get-supabase-resource.decorator';
import { Order } from './models/order.model';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUser } from '@supabase/supabase-js';
import { SupabaseResource } from 'src/common/decorators/supabase-resource.decorator';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Patch(':id')
  @ApiOperation({
    summary: 'Update order status',
    description: `Update order status according to actions taken by customer or fliiinker, then notify other party of changes <br><br> 
    - Actions allowed for customer :  [ ${Object.values(Order.CUSTOMER_ALLOWED_ACTIONS).map((e) => ` <strong>${e}</strong> `)} ].<br> 
    - Actions allowed for a fliiinker : [ ${Object.values(Order.FLIIINKER_ALLOWED_ACTIONS).map((e) => ` <strong>${e}</strong> `)} ]`,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The order id',
    required: true,
  })
  @SupabaseGuard()
  @UseGuards(SupabaseResourceGuard)
  @GetSupabaseResources({
    resourceId: 'id',
    resourceClass: Order,
  } as IGetSupabaseResourceDecoratorParams) // TODO créer les interfaces qui extends de celle ci
  @Serialize()
  async updateOrder(
    @CurrentUser() user: AuthUser,
    @Body() updateOrderDto: UpdateOrderDto,
    @SupabaseResource('id')
    order: Order,
  ) {
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.ordersService.updateOrder(user, order, updateOrderDto);
  }
}
