import { Model, Query } from 'mongoose';

export type MockModel<T = any> = Partial<Record<keyof Model<T>, jest.Mock>> &
  jest.Mock & {
    save?: jest.Mock;
    exec?: jest.Mock;
  };

export const mockModelFactory = <T>() => {
  const mock = jest.fn().mockImplementation(() => ({
    save: jest.fn(),
    toObject: jest.fn(),
  })) as any;

  mock.find = jest.fn();
  mock.findOne = jest.fn();
  mock.findById = jest.fn();
  mock.findByIdAndUpdate = jest.fn();
  mock.findOneAndUpdate = jest.fn();
  mock.findByIdAndDelete = jest.fn();
  mock.findOneAndDelete = jest.fn();
  mock.create = jest.fn();
  mock.save = jest.fn();
  mock.exec = jest.fn();
  mock.aggregate = jest.fn();
  mock.countDocuments = jest.fn();
  mock.updateOne = jest.fn();
  mock.updateMany = jest.fn();
  mock.deleteMany = jest.fn();
  mock.distinct = jest.fn();
  mock.insertMany = jest.fn();
  mock.deleteOne = jest.fn();

  return mock as MockModel<T>;
};

export type MockQuery = Partial<Record<keyof Query<any, any>, jest.Mock>> & {
  then: jest.Mock;
  exec: jest.Mock;
  select: jest.Mock;
  populate: jest.Mock;
  sort: jest.Mock;
  limit: jest.Mock;
  skip: jest.Mock;
  lean: jest.Mock;
};

export const mockQueryFactory = () => {
  const query = {
    exec: jest.fn(),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
  } as any;

  query.then = jest.fn().mockImplementation((onfulfilled, onrejected) => {
    return (query.exec() as Promise<any>).then(onfulfilled, onrejected);
  });

  return query as MockQuery;
};
