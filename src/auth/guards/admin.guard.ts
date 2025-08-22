import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account, Role } from 'src/entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    interface RequestWithUser extends Request {
      user?: { id?: string };
    }
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;
    if (!user || !user.id) {
      return false;
    }

    const account = await this.accountRepository.findOne({
      where: { userId: user.id },
    });

    if (!account || account.role !== Role.ADMIN) {
      return false;
    }

    return true;
  }
}
