"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const app_service_1 = require("./app.service");
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const events_1 = require("events");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const AVAILABLE_SERVICES = ['audit-trail-service', 'dao-service', 'user-management-service', 'web3-proxy-service'];
const SERVICE_URLS = {
    'audit-trail-service': 'http://localhost:3003',
    'dao-service': 'http://localhost:3002',
    'user-management-service': 'http://localhost:3001',
    'web3-proxy-service': 'http://localhost:3004',
};
let AppController = class AppController {
    constructor(appService, httpService) {
        this.appService = appService;
        this.httpService = httpService;
        this.services = {};
        this.channel = new events_1.EventEmitter();
    }
    onModuleInit() {
        for (const serviceName of AVAILABLE_SERVICES) {
            this.services[serviceName] = SERVICE_URLS[serviceName];
        }
    }
    getData(req, { serviceName }) {
        if (!AVAILABLE_SERVICES.includes(serviceName)) {
            throw new common_1.HttpException('Service doesnt exist', 404);
        }
        const serviceUrl = this.services[serviceName];
        const requestUrl = `${serviceUrl}${req.url.replace(`/${serviceName}/`, '/')}`;
        const headersArray = Object.entries(req.headers);
        const headers = Object.fromEntries(headersArray);
        return this.httpService.get(requestUrl, { headers }).pipe((0, operators_1.catchError)((error) => (0, rxjs_1.throwError)(() => error)));
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(':serviceName/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], AppController.prototype, "getData", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService, axios_1.HttpService])
], AppController);
//# sourceMappingURL=app.controller.js.map