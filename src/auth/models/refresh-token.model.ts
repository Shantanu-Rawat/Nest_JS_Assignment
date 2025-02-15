import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { RefreshTokenAttributesDto } from '../dto/refresh-token-attributes';

@Table({
    tableName: 'refresh_tokens',
    timestamps: true, // Automatically adds createdAt and updatedAt columns
})
export class RefreshToken extends Model<RefreshTokenAttributesDto, Omit<RefreshTokenAttributesDto, 'id'>> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    token: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    expiresAt: Date;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    is_active: boolean;
}
