export const EnvironmentModule = {
  register: jest.fn().mockReturnValue({
    module: class MockEnvironmentModule {},
    providers: [],
    exports: [],
  }),
};
export const Environment = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};
