import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) { }

  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    const token = authHeader.split(' ')[1];

    return this.authClient.send({ cmd: 'token.verify' }, { token }).pipe(
      map((user) => {
        request['user'] = user;
        return true;
      }),
      catchError((error) => {
        console.error('Token verification failed:', error);
        return throwError(() => new UnauthorizedException('Token verification failed'));
      }),
    );
  }
}
