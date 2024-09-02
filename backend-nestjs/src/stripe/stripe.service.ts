import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { environment } from 'src/common/environment';
import { Stripe } from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe = new Stripe(environment().stripe.apiKey);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async createStripeCustomer(
    public_profile_id: string,
    email: string,
  ): Promise<Stripe.Response<Stripe.Customer>> {
    try {
      const stripeCustomer = await this.stripe.customers.create({
        email: email,
        metadata: {
          public_profile_id: public_profile_id,
        },
      });

      return stripeCustomer;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
  async createStripePaymentMethod(
    token: string,
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    try {
      const creditCard = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          token,
        },
      });

      return creditCard;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async attachPaymentMethod(
    stripeCardId: string,
    stripeCustomerId: string,
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    try {
      const attach = await this.stripe.paymentMethods.attach(stripeCardId, {
        customer: stripeCustomerId,
      });

      return attach;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteStripePaymentMethod(
    stripeCardId: string,
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    try {
      const detach = await this.stripe.paymentMethods.detach(stripeCardId);

      return detach;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async createPaymentIntent(
    amount: number,
    orderId: number,
    customerId: string,
    stripeCustomerId: string,
    stripePaymentMethodId: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: this.formatAmountForStripe(amount),
        currency: 'eur',
        customer: stripeCustomerId,
        payment_method: stripePaymentMethodId,
        confirm: true,
        return_url: 'https://fliiin.payment-success.com',
        metadata: {
          order_id: orderId,
          customer_id: customerId,
          environment: process.env.NODE_ENV,
        },
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async webhook(signature: string, rawBody: Buffer) {
    const webhookSecretKey = environment().stripe.webhookSecretKey;

    const stripeEvent: Stripe.Event =
      await this.stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecretKey,
      );
    console.log(stripeEvent);
    const eventData = stripeEvent.data.object as Stripe.Subscription;
    const metadata = eventData.metadata;

    if (metadata?.environment !== process.env.NODE_ENV) {
      return;
    }
    // const data = {
    //   customer_id: metadata.customer_id,
    //   order_id: metadata.order_id,
    //   status: eventData.status,
    //   stripe_event: stripeEvent, // Inclure l'objet Stripe complet
    // };
    console.log('__________________ stripe service service');
    console.log(stripeEvent);
    switch (stripeEvent.type) {
      case 'payment_intent.created':
      case 'payment_intent.payment_failed':
      case 'payment_intent.requires_action':
        this.eventEmitter.emit('payment-event', stripeEvent);
        break;

      case 'charge.succeeded':
        this.eventEmitter.emit('payment-event', stripeEvent);
        break;
      case 'payment_intent.succeeded':
        this.eventEmitter.emit('payment-event.succeeded', stripeEvent);
        this.eventEmitter.emit('payment-event', stripeEvent);
        break;
      default:
        this.logger.error(`Unhandled event type ${stripeEvent.type}`);
        return;
    }
  }

  private formatAmountForStripe(amount: number) {
    const formattedAmount = Math.floor(amount * 100);
    return formattedAmount;
  }
}
