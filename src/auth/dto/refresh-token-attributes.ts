export class RefreshTokenAttributesDto {
    userId: string;
    token: string;
    expiresAt: Date
    is_active: boolean;
}