import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class UnitOfWork {
  constructor(private readonly sequelize: Sequelize) {}

  async startTransaction(): Promise<Transaction> {
    return this.sequelize.transaction();
  }
}
