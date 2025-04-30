import { ApiProperty } from '@nestjs/swagger';

export class ValidateAuthorizationDto {
  @ApiProperty({
    description:
      'Access JWT token provided by User Management Service will be passed through this DTO to verify the user Authorization for that role.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYW50b25pbi5pc2xhbUBicmFpbnN0YXRpb24tMjMuY29tIiwiaWF0IjoxNzQxMTY4MDUyLCJleHAiOjE3NDEyNTQ0NTJ9.SNFTZSlfifDHOdV-qg-qPtTMyENPuF9WDG3nSUHtzCU',
    required: true,
  })
  access_token: string;
  @ApiProperty({
    description: "User's assigned roles to access specific functionality.",
    example: ['Admin', 'MFS'],
    required: true,
  })
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
