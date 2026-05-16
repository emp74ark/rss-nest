jest.mock('@nestjs/mongoose', () => {
  const original = jest.requireActual('@nestjs/mongoose');
  const { mockModelFactory: factory } = jest.requireActual(
    '../src/test-utils/mongoose-mock-factory',
  );
  return {
    ...original,
    MongooseModule: {
      forRoot: jest.fn().mockReturnValue({
        module: class MockRootModule {},
        providers: [{ provide: original.getConnectionToken(), useValue: {} }],
      }),
      forFeature: jest
        .fn()
        .mockImplementation((models: { name: string }[]) => ({
          module: class MockFeatureModule {},
          providers: models.map((model) => ({
            provide: original.getModelToken(model.name),
            useValue: factory(),
          })),
          exports: models.map((model) => original.getModelToken(model.name)),
        })),
    },
  };
});
