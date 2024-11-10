import { AuthGuard } from "@nestjs/passport";

export class ClientJwt extends AuthGuard('clientJwt') {
    constructor() {
        super();
      }
    
} 