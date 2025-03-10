import { User } from "src/users/entities/user.entity";

export class ValidateAuthorizationDto {
  access_token: string;
  options: {
    roles: string[];
  };
}

export class MessageResponse {
  status: string;
  message_id: string;
  timestamp: string;
  data: {
    db_record_id: number;
    current_status: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}