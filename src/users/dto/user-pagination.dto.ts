import { ResponsePaginationTemplateDto } from "../../dto/response/pagination-template.dto";
import { UserInfoDto } from "./user-info.dto";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";

export class UserPaginationDto extends ResponsePaginationTemplateDto{
    @ApiProperty({
        description: 'User list',
        required: false,
        allOf: [{$ref: getSchemaPath(UserInfoDto)}]
      })
    users: UserInfoDto[];
}