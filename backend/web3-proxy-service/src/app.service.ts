import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to WEB3-PROXY-SERVICE node! 🚀';
  }
}
