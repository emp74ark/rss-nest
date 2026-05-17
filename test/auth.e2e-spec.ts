import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import {
  MockModel,
  mockModelFactory,
  mockQueryFactory,
} from './../src/test-utils/mongoose-mock-factory';
import * as argon from 'argon2';
import { AuthResponseMessage } from './../src/auth/auth.enums';

jest.mock('argon2');

describe('Auth (e2e)', () => {
  let app: NestFastifyApplication;
  let userModel: MockModel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken('User'))
      .useValue(mockModelFactory())
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.register(fastifyCookie);
    await app.register(fastifySession, {
      secret: 'test-secret-that-is-at-least-32-characters-long',
      saveUninitialized: false,
      cookie: { secure: false },
    });

    userModel = moduleFixture.get(getModelToken('User'));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should signup a new user', () => {
      userModel.findOne!.mockResolvedValue(null);
      const mockUser = {
        login: 'generated_user',
        toObject: jest
          .fn()
          .mockReturnValue({ login: 'generated_user', role: 'user' }),
      };
      userModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockUser),
      }));

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ password: 'password123' })
        .expect(201)
        .expect((res) => {
          expect(res.body['login']).toBe('generated_user');
          expect(res.header['set-cookie']).toBeDefined();
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login an existing user', () => {
      const mockUser = {
        _id: '123',
        login: 'testuser',
        password: 'hashedpassword',
        toObject: jest
          .fn()
          .mockReturnValue({ login: 'testuser', role: 'user' }),
      };

      const query = mockQueryFactory();
      query.exec.mockResolvedValue(mockUser);

      userModel.findOne!.mockReturnValue(query);
      (argon.verify as jest.Mock).mockResolvedValue(true);
      userModel.findByIdAndUpdate!.mockResolvedValue(mockUser);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ login: 'testuser', password: 'password123' })
        .expect(200)
        .expect((res) => {
          expect(res.body['login']).toBe('testuser');
          expect(res.header['set-cookie']).toBeDefined();
        });
    });

    it('should access profile after login', async () => {
      const mockUser = {
        _id: '123',
        login: 'testuser',
        toObject: jest
          .fn()
          .mockReturnValue({ login: 'testuser', role: 'user' }),
      };

      const query = mockQueryFactory();
      query.exec.mockResolvedValue(mockUser);

      userModel.findOne!.mockReturnValue(query);
      userModel.findByIdAndUpdate!.mockResolvedValue(mockUser);
      userModel.findById!.mockReturnValue(query);
      (argon.verify as jest.Mock).mockResolvedValue(true);

      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/auth/login')
        .send({ login: 'testuser', password: 'password123' })
        .expect(200);

      await agent
        .get('/user/self')
        .expect(200)
        .expect((res) => {
          expect(res.body['login']).toBe('testuser');
        });
    });

    it('should logout successfully', async () => {
      const mockUser = {
        _id: '123',
        login: 'testuser',
        toObject: jest
          .fn()
          .mockReturnValue({ login: 'testuser', role: 'user' }),
      };

      const query = mockQueryFactory();
      query.exec.mockResolvedValue(mockUser);

      userModel.findOne!.mockReturnValue(query);
      userModel.findByIdAndUpdate!.mockResolvedValue(mockUser);
      userModel.findById!.mockReturnValue(query);
      (argon.verify as jest.Mock).mockResolvedValue(true);

      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/auth/login')
        .send({ login: 'testuser', password: 'password123' })
        .expect(200);

      await agent
        .get('/auth/logout')
        .expect(200)
        .expect((res) => {
          expect(res.body['message']).toBe(AuthResponseMessage.LOGGED_OUT);
        });

      await agent.get('/user/self').expect(403); // Assuming SessionGuard throws Forbidden or similar when session is gone
    });
  });
});
