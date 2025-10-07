import {
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ProductsGateway {
  constructor(private readonly authService: AuthService) {}

  @WebSocketServer()
  private readonly server: Server;

  handleProductUpdate() {
    //va emettre un evenement et les clients interesses vont s'abonner
    this.server.emit('productUpdated');
  }

  handleConnnection(client: Socket) {
    try {
      this.authService.verifyToken(client.handshake.auth.Authentication.value);
    } catch (error) {
      throw new WsException('Unauthorized.');
    }
  }
}
