import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ExtractJwt } from 'passport-jwt';
import { environment } from 'src/common/environment';
import { Profile } from 'src/common/decorators/profile.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AbstractSupabaseResource,
  SupabaseUserType,
} from './abstract-supabase-resource.model';

@Injectable({ scope: Scope.REQUEST })
export class Supabase {
  private readonly logger = new Logger(Supabase.name);
  protected clientInstance: SupabaseClient;
  private systemClientInstance: SupabaseClient;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Profile()
  public getClient(user: SupabaseUserType = 'owner') {
    switch (user) {
      case 'owner':
        return this.getClientForOwner();

      case 'stripe':
        return this.getClientForStripe();
      default:
        return this.getClientForOwner();
    }
  }
  private getClientForOwner() {
    this.logger.log('Getting supabase client...');
    if (this.clientInstance) {
      this.logger.log('Client exists - returning for current Scope.REQUEST');
      return this.clientInstance;
    }

    this.logger.log('Initializing new supabase client for new Scope.REQUEST');

    this.clientInstance = createClient(
      environment().supabase.url,
      environment().supabase.anonKey,
      {
        auth: { autoRefreshToken: false, detectSessionInUrl: true },
      },
    );

    //TODO : handle le changement de session en cas de refresh
    // this.clientInstance.auth.onAuthStateChange((event, session) => {});

    this.clientInstance.auth.setSession({
      access_token: ExtractJwt.fromAuthHeaderAsBearerToken()(this.request),
      refresh_token: ' ',
    });
    this.logger.log('Auth has been set!');

    return this.clientInstance;
  }

  private getClientForStripe() {
    this.logger.log('Getting supabase system client...');
    if (this.systemClientInstance) {
      this.logger.log(
        'System client exists - returning for current Scope.REQUEST',
      );
      return this.systemClientInstance;
    }

    this.logger.log(
      'Initializing new supabase system client for new Scope.REQUEST',
    );

    this.systemClientInstance = createClient(
      environment().supabase.url,
      environment().supabase.anonKey,
    );
    //TODO : ajouter une connexion à un user system ayant des droits RLS plus élevés

    this.logger.log('Warning - No Auth set!');

    return this.systemClientInstance;
  }

  @Profile()
  getSupabaseResource<T extends AbstractSupabaseResource>(
    type: new (supabase: Supabase, eventEmitter: EventEmitter2) => T,
  ): T {
    return new type(this, this.eventEmitter);
  }
}
