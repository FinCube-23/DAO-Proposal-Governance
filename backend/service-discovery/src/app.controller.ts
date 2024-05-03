import { AppService } from './app.service';
import {
  Controller,
  Get,
  HttpException,
  OnModuleInit,
  Param,
  Req
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { EventEmitter } from 'events';
import { Observable, throwError, zip } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

const AVAILABLE_SERVICES = ['audit-trail-service', 'dao-service', 'user-management-service', 'web3-proxy-service'];
const SERVICE_URLS = {
  'audit-trail-service': 'http://localhost:3003',
  'dao-service': 'http://localhost:3002',
  'user-management-service': 'http://localhost:3001',
  'web3-proxy-service': 'http://localhost:3004',
};
@Controller()
export class AppController {
  services: { [serviceName: string]: string } = {};
  channel = new EventEmitter();

  constructor(private readonly appService: AppService, private readonly httpService: HttpService) { }
  onModuleInit() {
    for (const serviceName of AVAILABLE_SERVICES) {
      this.services[serviceName] = SERVICE_URLS[serviceName];
    }
  }

  @Get(':serviceName/*')
  getData(
    @Req() req: Request,
    @Param() { serviceName }: { serviceName: string },
  ): Observable<AxiosResponse<any>> {
    if (!AVAILABLE_SERVICES.includes(serviceName)) {
      throw new HttpException('Service doesnt exist', 404);
    }

    const serviceUrl = this.services[serviceName];
    const requestUrl = `${serviceUrl}${req.url.replace(`/${serviceName}/`, '/')}`;
    const headersArray = Object.entries(req.headers);
    const headers = Object.fromEntries(headersArray);

    return this.httpService.get(requestUrl, { headers }).pipe(
      catchError((error) => throwError(() => error)),
    );
  }
}
