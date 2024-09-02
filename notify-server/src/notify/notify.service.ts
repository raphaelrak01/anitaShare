import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SocketGateway } from '../socket/socket.gateway';
import { MapSocketIdAndFcmTokenDto } from './dtos/map-socket-id-and-fcm-token.dto';
import { RedisService } from 'src/redis/redis.service';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
// import { PushNotificationDto } from './dtos/push-notification.dto';
import { NotificationDto } from './dtos/notification.dto';


// @Injectable() est un décorateur qui permet de déclarer une classe comme un service
// une service est une classe qui contient la logique métier de l'application
// une logique métier est une logique qui permet de traiter les données de l'application
@Injectable()
// Déclaration de la classe NotifyService
export class NotifyService {
  // Le logger est un outil qui permet de journaliser les événements et les messages
  // journaliser veut dire enregistrer les événements et les messages dans un fichier ou une base de données
  private readonly logger = new Logger(NotifyService.name);
  constructor(
    private readonly redisService: RedisService, // Injection du service RedisService
    private readonly socketGateway: SocketGateway, // Injection du service SocketGateway
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin, // Injection du service FirebaseAdmin
  ) {}

  // La méthode mapSocketIdAndFcmToken() permet de mapper le socket_id et le fcm_token
  // mapSocketIdAndFcmToken() prend en paramètre un objet de type MapSocketIdAndFcmTokenDto
  async mapSocketIdAndFcmToken(
    mapSocketIdAndCfmTokenDto: MapSocketIdAndFcmTokenDto,
  ) {
    // Récupération des données de l'objet mapSocketIdAndCfmTokenDto
    const { user_id, socket_id, fcm_token } = mapSocketIdAndCfmTokenDto;
    // Verification de la presence du user dans redis et recupération des données de redis
    const existingData = await this.redisService.get(user_id);

    if (user_id && (socket_id || fcm_token)) { // Si l'identifiant de l'utilisateur et le socket_id ou le fcm_token sont présents
      await this.redisService.set(user_id, { // Enregistrement des données dans redis
        socket_id: socket_id ?? existingData?.socket_id, // Si le socket_id est null, on prend le socket_id existant
        fcm_token: fcm_token ?? existingData?.fcm_token, // Si le fcm_token est null, on prend le fcm_token existant
      });
    }

    return this.redisService.get(user_id); // Retourne les données de l'utilisateur
  }

  // La méthode testPushNotification() permet de tester l'envoi de notification push
  async testPushNotification(token: string) {
    if (!token) throw new InternalServerErrorException('No token provided');

    const message = {
      notification: {
        title: 'Push notification sending test',
        body: 'Push notification sending test',
      },
      android: {
        notification: {
          title: 'Push notification sending test',
          body: 'Push notification sending test',
        },
      },

      token,
    };

    try {
      const response = await this.firebase.messaging.send(message);
      return response;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // La méthode sendNotification() permet d'envoyer une notification
  public async sendNotification(notificationDto: NotificationDto) {
    // Récupération des données de l'objet notificationDto
    const { users_ids, is_push, is_socket_event } = notificationDto;

    if (!users_ids || !users_ids.length) { // si les identifiants des utilisateurs ne sont pas présents
      throw new InternalServerErrorException('No users_ids provided');
    }

    let push_responses; // Initialisation de la variable push_responses
    let socket_events_responses; // Initialisation de la variable socket_events_responses

    if (is_push) { // Si c'est une notification push
      push_responses = await this.sendPush(notificationDto); // Envoi de la notification push
    }
    if (is_socket_event) { // Si c'est un événement socket
      socket_events_responses = await this.sendSocketEvent(notificationDto); // Envoi de l'événement socket
    }

    return { push_responses, socket_events_responses }; // Retourne les réponses des notifications push et des événements socket
  }

  private async sendSocketEvent(sendSocketEventDto: NotificationDto) { // La méthode sendSocketEvent() permet d'envoyer un événement socket
    const { users_ids, type, data, body, title, deep_link, is_socket_event } =
      sendSocketEventDto;
    // Afficher les informations
    this.logger.log(`Users IDs: ${users_ids}`);
    this.logger.log(`Type: ${type}`);
    this.logger.log(`Data: ${data}`);
    this.logger.log(`Body: ${body}`);
    this.logger.log(`Title: ${title}`);
    this.logger.log(`Deep Link: ${deep_link}`);
    this.logger.log(`Is Socket Event: ${is_socket_event}`);
    if (!is_socket_event)
      throw new InternalServerErrorException('is_socket_event is not true');

    const success: Array<{ // Initialisation de la variable success
      user_id: string;
      socket_id: string;
    }> = [];
    const errors: Array<{ user_id: string; socket_id: string; error: Error }> =
      [];

    const responses = await Promise.all( 
      // Promise.all() permet d'exécuter plusieurs promesses en parallèle
      users_ids.map(async (user_id) => {  // Pour chaque identifiant d'utilisateur, ici map permet de parcourir le tableau users_ids
        const { socket_id } = await this.redisService.get(user_id); // Récupération du socket_id de l'utilisateur
        try {
          if (!socket_id) { // Si le socket_id n'est pas présent
            this.logger.error(`No socket_id for user_id: ${user_id}`);
            throw new Error(`No socket_id for user_id: ${user_id}`);
          }

          const response = await this.socketGateway.sendSocketEvent({ // Envoi de l'événement socket
            client_socket_id: socket_id, // Identifiant du socket client
            event_name: type, //  Nom de l'événement
            data: { title, body, type, data, deep_link }, // Données de l'événement
          });

          success.push({ user_id, socket_id }); // Ajout de l'utilisateur et du socket_id dans la variable success
          return response; // Retourne la réponse
        } catch (error: any) {
          this.logger.error(error); // Enregistrement de l'erreur
          errors.push({ user_id, socket_id, error }); // Ajout de l'utilisateur, du socket_id et de l'erreur dans la variable errors
        }
      }),
    );

    return { total_sent: responses.length, success, errors }; // Retourne le nombre total d'événements envoyés, les événements envoyés avec succès et les erreurs
  }

  private async sendPush(params: NotificationDto) { // La méthode sendPush() permet d'envoyer une notification push
    const { users_ids, title, type, body: content, data, deep_link } = params;

    if (!users_ids || !users_ids.length) // Si les identifiants des utilisateurs ne sont pas présents
      throw new InternalServerErrorException('No users provided');

    const success: Array<{ // Initialisation de la variable success
      user_id: string;
      fcm_token: string;
      response: string;
    }> = [];
    const errors: Array<{ user_id: string; fcm_token: string; error: Error }> =
      [];

    const responses = await Promise.all( // Promise.all() permet d'exécuter plusieurs promesses en parallèle
      users_ids.map(async (user_id) => {
        const { fcm_token } = await this.redisService.get(user_id); // Récupération du fcm_token de l'utilisateur
        // Envoi de la notification push

        
        try {
          const message = {
            notification: {
              title: title,
              body: content,
            },
            data: {
              type,
              data,
              deep_link,
            },
            android: {
              notification: {
                title: title,
                body: content,
              },
            },
            token: fcm_token,
          };
          const response = await this.firebase.messaging.send(message);
          success.push({ user_id, fcm_token, response });
          return response;
        } catch (error: any) {
          this.logger.error(error);
          errors.push({ user_id, fcm_token, error });
        }
      }),
    );

    return { total_sent: responses.length, success, errors };
  }
}
