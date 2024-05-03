/// <reference types="node" />
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { EventEmitter } from 'events';
import { Observable } from 'rxjs';
export declare class AppController {
    private readonly appService;
    private readonly httpService;
    services: {
        [serviceName: string]: string;
    };
    channel: EventEmitter<[never]>;
    constructor(appService: AppService, httpService: HttpService);
    onModuleInit(): void;
    getData(req: Request, { serviceName }: {
        serviceName: string;
    }): Observable<AxiosResponse<any>>;
}
