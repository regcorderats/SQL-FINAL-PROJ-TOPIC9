import { Test, TestingModule } from '@nestjs/testing';
import { AccountLifecycleService } from './account-lifecycle.service';

describe('AccountLifecycleService', () => {
  let service: AccountLifecycleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountLifecycleService],
    }).compile();

    service = module.get<AccountLifecycleService>(AccountLifecycleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
