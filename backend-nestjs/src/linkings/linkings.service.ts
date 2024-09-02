import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UpdateLinkingDto } from './dtos/update-linking.dto';
import { ELinkingEventName } from './enums/linking-event-name.enum';
import { AuthUser } from '@supabase/supabase-js';
import { Linking } from './models/linking.model';
import { Research } from 'src/research/models/research.model';
import { Profile } from 'src/common/decorators/profile.decorator';
import { Supabase } from 'src/supabase/supabase';

@Injectable()
export class LinkingsService {
  private readonly logger: Logger = new Logger(LinkingsService.name);

  constructor(private readonly supabase: Supabase) {}

  @Profile()
  async updateLinking(
    currentUser: AuthUser,
    currentResearch: Research,
    updateLinkingDto: UpdateLinkingDto,
  ) {
    if (!currentResearch.is_active) {
      throw new InternalServerErrorException('Research is already closed');
    }
    const currentLinking = currentResearch.linkings[0];
    currentLinking.performer_id = currentUser.id;
    const userRole = this.getCurrentUserRole(currentUser, currentLinking); // TODO: deplacer dans le model

    if (!currentLinking.userCanDoAction(userRole, updateLinkingDto.action)) {
      this.logger.error(
        'User not allowed to do this action or event already inserted',
      );
      throw new InternalServerErrorException(
        'User not allowed to do this action or event already inserted',
      );
    }

    switch (updateLinkingDto.action) {
      case ELinkingEventName.CUSTOMER_LIKE:
        if (
          currentLinking.lastEvent.name === ELinkingEventName.FLIIINKER_REFUSE
        ) {
          currentLinking.addEvent(ELinkingEventName.CUSTOMER_LIKE);
          currentLinking.addEvent(ELinkingEventName.FLIIINKER_RELAUNCH);
        }

        if (
          currentLinking.lastEvent.name === ELinkingEventName.FLIIINKER_ACCEPT
        ) {
          currentLinking.addEvent(ELinkingEventName.CUSTOMER_LIKE);
          currentLinking.addEvent(ELinkingEventName.IS_PRE_FLIIINK);
        }
        if (currentLinking.events.length === 1) {
          currentLinking.addEvent(ELinkingEventName.CUSTOMER_LIKE);
        }
        break;
      case ELinkingEventName.FLIIINKER_ACCEPT:
        if (currentLinking.lastEvent.name === ELinkingEventName.CUSTOMER_LIKE) {
          currentLinking.addEvent(ELinkingEventName.FLIIINKER_ACCEPT);
          currentLinking.addEvent(ELinkingEventName.IS_PRE_FLIIINK);
        }
        if (currentLinking.events.length === 1) {
          currentLinking.addEvent(ELinkingEventName.FLIIINKER_ACCEPT);
        }
        break;

      case ELinkingEventName.FLIIINKER_REFUSE:
        if (currentLinking.lastEvent.name === ELinkingEventName.CUSTOMER_LIKE) {
          currentLinking.addEvent(ELinkingEventName.FLIIINKER_REFUSE);
          currentLinking.addEvent(ELinkingEventName.FLIIINKER_ABORT);
        }
        if (currentLinking.events.length === 1) {
          currentLinking.addEvent(ELinkingEventName.FLIIINKER_REFUSE);
        }
        break;
      case ELinkingEventName.CUSTOMER_CONFIRM:
        if (
          currentLinking.lastEvent.name !== ELinkingEventName.IS_PRE_FLIIINK
        ) {
          throw new InternalServerErrorException(
            'Linking must be pre fliiink to confirm',
          );
        }
        currentLinking.addEvent(ELinkingEventName.CUSTOMER_CONFIRM);
        currentLinking.addEvent(ELinkingEventName.IS_FLIIINK);
    }

    await currentLinking.save();

    return currentLinking;
  }

  private getCurrentUserRole(
    currentUser: AuthUser,
    currentLinking: Linking,
  ): 'customer' | 'fliiinker' {
    if (currentUser.id === currentLinking.fliiinker.id) {
      return 'fliiinker';
    }
    if (currentUser.id === currentLinking.customer.id) {
      return 'customer';
    }

    throw new InternalServerErrorException(
      'Current user id not found in linking',
    );
  }
}
