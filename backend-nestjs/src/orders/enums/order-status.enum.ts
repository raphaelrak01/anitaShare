export enum EOrderStatus {
  CREATED = 'created', // on creation
  PAYMENT_CONFIRMED = 'payment_confirmed', // by stripe
  AWAITING_START = 'awaiting_start', // by Pg Cron, 2 hours before start date
  FLIIINKER_ON_THE_WAY = 'fliiinker_on_the_way', // by fliiinker
  SERVICE_STARTED = 'service_started', // by fliiinker
  SERVICE_START_CONFIRMED = 'service_start_confirmed', // by customer
  SERVICE_COMPLETED_BEFORE_DUE_DATE = 'service_completed_before_due_date', //by customer
  SERVICE_COMPLETED = 'service_completed', // by fliiinker
  CANCELLED = 'cancelled', // by customer
}
