import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Web3ProxyModule } from './web3-dao-proxy/web3-proxy.module';
import { ConfigModule } from "@nestjs/config";
@Module({
  imports: [Web3ProxyModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local'
    })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
