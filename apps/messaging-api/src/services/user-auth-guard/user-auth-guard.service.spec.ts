import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthGuardService } from './user-auth-guard.service';

describe('UserAuthGuardService', () => {
  let service: UserAuthGuardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAuthGuardService],
    }).compile();

    service = module.get<UserAuthGuardService>(UserAuthGuardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
