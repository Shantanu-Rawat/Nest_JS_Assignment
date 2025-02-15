import { eRole } from "./role.enum";

export class UserAttributesDto {
    id?: number;
    name: string;
    email: string;
    password: string;
    role: eRole;
    is_active: boolean
  }