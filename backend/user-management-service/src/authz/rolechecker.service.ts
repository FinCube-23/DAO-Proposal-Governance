import { Injectable } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";

@Injectable()
export class RoleChecker {

    constructor(public readonly authenticationService: AuthenticationService) { }
    async findOne(sub: string): Promise<string> {
        return await this.authenticationService.findOne(sub);
    }
}