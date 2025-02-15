import { ApiProperty } from '@nestjs/swagger';

export class TokenInfoDto {
  @ApiProperty({ description: 'Refresh token' })
  refresh_token: string;

  @ApiProperty({ description: 'Access token' })
  access_token: string;

  @ApiProperty({ description: 'Token expiration time' })
  expires_in: string;
}
