export const environnement = () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  // Ici on définit les propriétés de l'objet redis
  // redis est un système de gestion de base de données clé-valeur open-source
  redis: {
    host: process.env.REDIS_HOST || 'localhost', // Hôte de la base de données Redis
    // convertit la valeur de la variable d'environnement REDIS_PORT en un entier en utilisant la base 10.
    port: parseInt(process.env.REDIS_PORT, 10) || 6379, // port de la base de données Redis qui est 6379 par défaut
  },

  // Ici on définit les propriétés de l'objet bull
  // bull est une bibliothèque de gestion de files d'attente basée sur Redis
  bull: {
    // Ici on définit les propriétés de l'objet redis_queues
    // redis_queues est un objet qui contient les propriétés host et port de la base de données Redis
    redis_queues: {
      host: process.env.REDIS_QUEUES_HOST || 'localhost',
      port: parseInt(process.env.REDIS_QUEUES_PORT, 10) || 6379,
    },
    // Ici on définit les propriétés de l'objet queues
    // queues est un objet qui contient les noms des files d'attente
    queues: { // Définition des files d'attente avec leur nom respectif
      test_notification_queue: 'test-notification-queue',
      linking_created_event_notification_queue:
        'linking-created-event-notification-queue',
      linking_event_notification_queue: 'linking-event-notification-queue',
      payment_event_notification_queue: 'payment-event-notification-queue',
      chat_message_notification_queue: 'chat-message-notification-queue',
      order_event_notification_queue: 'order-event-notification-queue',
    },
    // Ici on définit les propriétés de l'objet processors
    // processors est un objet qui contient les noms des processeurs de notification
    // Un processeur de notification est un composant qui traite les notifications
    processors: { // Définition des processeurs de notification avec leur nom respectif
      test_notification_processor: 'test-notification-processor',
      linking_created_event_notification_processor:
        'linking-created-event-notification-processor',
      linking_event_notification_processor:
        'linking-event-notification-processor',
      payment_event_notification_processor:
        'payment-event-notification-processor',
      chat_message_notification_processor:
        'chat-message-notification-processor',
      order_event_notification_processor: 'order-event-notification-processor',
    },
  },
  // Ici on définit les propriétés de l'objet fcm
  // fcm est un service de messagerie cloud fourni par Google
  // Il permet d'envoyer des notifications push à des appareils Android et iOS
  // notifications push sont des messages qui sont envoyés à des appareils mobiles pour les informer d'un événement
  // comme un nouveau message, une mise à jour d'application, etc.
  fcm: {
    configPath: process.env.FCM_CONFIG_PATH || 'fcm-config.json',
  },
});
