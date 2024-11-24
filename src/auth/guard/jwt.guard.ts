import { AuthGuard } from '@nestjs/passport';

export class AdminJwt extends AuthGuard('adminjwt') {
  constructor() {
    super();
  }
}
