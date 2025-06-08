import { Test, TestingModule } from '@nestjs/testing';

// Мок для Sequelize
jest.mock('@nestjs/sequelize', () => ({
  SequelizeModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class MockSequelizeModule {},
      providers: [],
      exports: [],
    }),
  },
}));

// Мок для ConfigModule
jest.mock('@nestjs/config', () => ({
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class MockConfigModule {},
      providers: [],
      exports: [],
    }),
  },
}));

export const createTestingModule = async (imports: any[] = []) => {
  const module: TestingModule = await Test.createTestingModule({
    imports,
  }).compile();

  return module;
};
