export class ValidateAuthorizationDto {
  access_token: string;
  options: {
    roles: string[];
  };
}

export class MessageResponse {
  status: string;
  timestamp: string;
  data: {
    user_id: number;
    current_status: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
