export enum EOrderEventName {
  CONFIRM_PAYMENT = 'confirm_payment', // by stripe
  AWAITING_START = 'awaiting_start', // by Pg Cron, 2 hours before start date
  FLIIINKER_ON_THE_WAY = 'fliiinker_on_the_way', // by fliiinker
  FLIIINKER_START_SERVICE = 'fliiinker_start_service', // by fliiinker
  CUSTOMER_CONFIRM_START_SERVICE = 'customer_confirm_start_service', // by customer
  CUSTOMER_COMPLETE_SERVICE_BEFORE_DUE_DATE = 'customer_complete_service_before_due_date', //by customer
  FLIIINKER_COMPLETE_SERVICE = 'fliiinker_complete_service', // by fliiinker
  CUSTOMER_CANCEL = 'customer_cancel', // by customer
}
