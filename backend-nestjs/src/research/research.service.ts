import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import { CreateResearchDto } from './dtos/create-research.dto';
import { Supabase } from 'src/supabase/supabase';
import { Profile } from 'src/common/decorators/profile.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ResearchService {
  private readonly logger: Logger = new Logger(ResearchService.name);
  constructor(
    private readonly supabase: Supabase,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  @Profile()
  async createResearchWithLinkings(
    user: AuthUser,
    createResearchDto: CreateResearchDto,
  ): Promise<any> {
    const {
      service_id,
      customer_latitude,
      customer_longitude,
      customer_city,
      service_start,
      service_end,
      service_duration,
      search_details,
      customer_selected_address_id,
    } = createResearchDto;
    console.log('rpc research ------- user vvvvvvvv');
    console.log(user);
    const rpcResult = await this.callSearchFliiinkersRPC({
      service_id,
      service_duration,
      search_details,
      customer_id: user.id,
      service_start,
      service_end,
      customer_selected_address_id,
      customer_longitude,
      customer_latitude,
      customer_city,
    });
    console.log(rpcResult);
    this.eventEmitter.emit('search-created', rpcResult);

    const { fliiinkers_ids, ...rest } = rpcResult;

    return rest;
  }

  @Profile()
  async callSearchFliiinkersRPC(params: {
    service_id: number;
    service_duration: number;
    search_details: any;
    customer_id: string;
    service_start: string;
    service_end: string;
    customer_longitude: string;
    customer_latitude: string;
    customer_city: string;
    customer_selected_address_id: number;
  }) {
    const { data, error } = await this.supabase
      .getClient()
      .rpc('search_fliiinkers', {
        service_id_param: params.service_id,
        service_duration_param: params.service_duration,
        search_details_param: params.search_details,
        customer_id_param: params.customer_id,
        service_start_param: params.service_start,
        service_end_param: params.service_end,
        customer_selected_address_id_param: params.customer_selected_address_id,
        long_param: params.customer_longitude,
        lat_param: params.customer_latitude,
        city_param: params.customer_city,
      });
    console.log(data);
    if (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    return data;
  }
}
