import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway {
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  readonly server: Server;

  handleConnection(client: Socket) {
    this.logger.log('Client connected : ' + client.id);
  }

  handleDisconnection(client: Socket) {
    this.logger.log('Client disconnected : ' + client.id);
  }

  sendSocketEvent({ client_socket_id, event_name, data }) {
    return this.server.to(client_socket_id).emit(event_name, data);
  }
}
