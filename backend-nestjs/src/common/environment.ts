import { join } from 'path';

export const environment = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  bull: {
    queues: {
      test_notification_queue: 'test-notification-queue',
      linking_created_event_notification_queue:
        'linking-created-event-notification-queue',
      linking_event_notification_queue: 'linking-event-notification-queue',
      payment_event_notification_queue: 'payment-event-notification-queue',
      chat_message_notification_queue: 'chat-message-notification-queue',
      stripe_event_queue: 'stripe_event_queue',
      order_event_notification_queue: 'order-event-notification-queue',
    },
    processors: {
      test_notification_processor: 'test-notification-processor',
      linking_created_event_notification_processor:
        'linking-created-event-notification-processor',
      linking_event_notification_processor:
        'linking-event-notification-processor',
      payment_event_notification_processor:
        'payment-event-notification-processor',
      chat_message_notification_processor:
        'chat-message-notification-processor',
      stripe_event_processor: 'stripe_event_processor',
      order_event_notification_processor: 'order-event-notification-processor',
    },
  },
  supabase: {
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    databaseUrl: process.env.SUPABASE_DB_URL,
  },
  stripe: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookSecretKey: process.env.STRIPE_WEBHOOK_SECRET_KEY,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    senderEmail: process.env.SENDGRID_SENDER_EMAIL,
    senderName: process.env.SENDGRID_SENDER_NAME,
    cc: process.env.SENDGRID_CC,
    cci: process.env.SENDGRID_CCI,
  },
  notify: {
    url: process.env.NOTIFY_SERVER_URL,
    templates:
      process.env.NOTIFICATION_TEMPLATES ||
      join(process.cwd(), 'notification-templates/'),
  },
});
