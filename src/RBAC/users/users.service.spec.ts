import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import * as crypto from 'crypto';
import { CrudService } from 'src/utils/crud/crud.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        CrudService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should validate password correctly', () => {
    // 模拟生成的盐和加密密码
    const salt = crypto.randomBytes(4).toString('hex'); // 生成 8 位盐
    const plainPassword = 'ggbound';
    const hashedPassword = crypto
      .pbkdf2Sync(plainPassword, salt, 1000, 32, 'sha512')
      .toString('hex');

    // 调用 validatePassword 方法
    const isValid = service.validatePassword(
      plainPassword,
      hashedPassword,
      salt,
    );

    // 验证结果
    expect(isValid).toBe(true);
  });

  it('should return false for incorrect password', () => {
    // 模拟生成的盐和加密密码
    const salt = crypto.randomBytes(4).toString('hex'); // 生成 8 位盐
    const plainPassword = 'ggbound';
    const wrongPassword = 'bbbound';
    const hashedPassword = crypto
      .pbkdf2Sync(plainPassword, salt, 1000, 32, 'sha512')
      .toString('hex');

    // 调用 validatePassword 方法
    const isValid = service.validatePassword(
      wrongPassword,
      hashedPassword,
      salt,
    );

    // 验证结果
    expect(isValid).toBe(false);
  });
});
