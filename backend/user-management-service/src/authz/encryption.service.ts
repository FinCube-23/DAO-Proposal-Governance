import { Injectable } from "@nestjs/common";
const crypto = require("crypto");
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

@Injectable()
export class EncryptionService {
    constructor() { }

    decryptMessage(encryptedMessage): String {
        const decryptedMessage = crypto.privateDecrypt(
            {
                key: `${process.env.PRIVATE_KEY}`,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(encryptedMessage, 'base64')
        );
        return decryptedMessage.toString('utf8');
    }

    match(encryptedMessage): boolean {
        const decryptedMessage = this.decryptMessage(encryptedMessage);
        if (decryptedMessage === process.env.SECRET_MESSAGE) {
            return true;
        }
    }
}