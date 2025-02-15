import { Table, Column, Model, DataType, Unique, BeforeSave, BeforeUpdate, BeforeCreate, HasMany } from 'sequelize-typescript';
import { eRole } from '../dto/role.enum';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from '../../auth/models/refresh-token.model';
import { UserAttributesDto } from '../dto/user-attributes.interface';

@Table({ tableName: 'users' })
export class User extends Model<UserAttributesDto, Omit<UserAttributesDto, 'id'>> {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4, // Automatically generate a UUIDv4
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Unique // Ensure email is unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEmail: true, // Optional: Validate proper email format
    },
  })
  email: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ENUM(...Object.values(eRole) as string[]), // Use ENUM with all Role values
    allowNull: false,
    defaultValue: eRole.VIEWER, // Default role if not provided
  })
  role: eRole;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active: boolean;

  @HasMany(() => RefreshToken)
  refreshTokens: RefreshToken[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
