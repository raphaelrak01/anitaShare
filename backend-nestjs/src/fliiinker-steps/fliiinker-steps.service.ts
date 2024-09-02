import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { isEmptyObject } from 'src/common/helpers/validation.helpers';
import { Supabase } from 'src/supabase/supabase';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '@supabase/supabase-js';

@Injectable()
export class FliinkerStepsService {
  private readonly logger = new Logger(FliinkerStepsService.name);
  constructor(private readonly supabase: Supabase) {}

  async getFliiinkerInProgressSteps(currentUser: AuthUser) {
    const { data, error } = await this.supabase
      .getClient()
      .from('public_profile')
      .select(
        `id, email, email_confirmed_at, phone , phone_confirmed_at, last_name, first_name,
        fliiinker_services: fliiinker_service_mtm (*),
        fliiinker_profile (id, description, spoken_languages,is_validated,
        administrative_data ( country,social_security_number, ssn_is_valid,iban ,fliiinker_profile_id)),
        fliiinker_address: address!public_address_user_id_fkey (*)`,
      )
      .eq('id', currentUser.id)
      .single();

    const fliiinkerStatus = {
      fliiinker_id: data.id,
      fliiinker_is_validated: data?.fliiinker_profile['is_validated'] ?? null,
      contact_status: this.checkContactStatus(data),
      administrative_data_status: this.checkAdministrativeDataStatus(
        data?.fliiinker_profile,
      ),
      first_service_status: this.checkFirstServiceStatus(data),
      account_status: this.checkPublicProfileDataStatus(data),
    };

    if (error && !isEmptyObject(error)) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
    return fliiinkerStatus;
  }

  private checkFirstServiceStatus(data: any) {
    if (
      data?.fliiinker_services?.length == 0 ||
      !data?.fliiinker_services?.length
    ) {
      return 0;
    } else return 1;
  }

  private checkPublicProfileDataStatus(data: any) {
    const requiredFirstAdress = data?.fliiinker_address?.length ?? 0;
    const requiredFieldsForPublic = [
      data?.fliiinker_profile?.description,
      data?.fliiinker_profile?.spoken_languages,
    ];

    if (requiredFirstAdress == 0) {
      return 0;
    }
    for (const field of requiredFieldsForPublic) {
      if (!field) {
        return 0;
      }
    }
    return 1;
  }
  private checkAdministrativeDataStatus(data: any) {
    const requiredFieldsForAdministrative = [
      data?.administrative_data?.country,
      data?.administrative_data?.social_security_number,
      data?.administrative_data?.iban,
    ];
    for (const field of requiredFieldsForAdministrative) {
      if (!field) {
        return 0;
      }
    }
    return 1;
  }
  private checkContactStatus(data: any) {
    const requiredFieldsForContact = [
      data?.email,
      data?.email_confirmed_at,
      data?.phone,
      data?.phone_confirmed_at,
      data?.last_name,
      data?.first_name,
    ];

    for (const field of requiredFieldsForContact) {
      if (!field) {
        return 0;
      }
    }
    return 1;
  }
}
