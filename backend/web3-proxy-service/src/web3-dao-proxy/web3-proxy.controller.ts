import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Web3ProxyService } from './web3-proxy.service';


@Controller('web3-dao-proxy')
export class Web3ProxyController {
  constructor(private readonly web3ProxyService: Web3ProxyService) { }

  @Post()
  getBalance(@Body('address') address: string) {
    return this.web3ProxyService.getBalance(address);
  }

}
