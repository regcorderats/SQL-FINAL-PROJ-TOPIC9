import { Module } from '@nestjs/common';
import { AccountLifecycleService } from './account-lifecycle.service';

@Module({
  providers: [AccountLifecycleService]
})
export class AccountLifecycleModule {}
