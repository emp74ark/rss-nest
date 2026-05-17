import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { FeedParserService } from '../src/shared/feed-parser.service';
import { ArticleService } from '../src/article/article.service';
import * as argon from 'argon2';
import {
  MockModel,
  mockModelFactory,
  mockQueryFactory,
} from '../src/test-utils/mongoose-mock-factory';

jest.mock('argon2');

describe('Feed (e2e)', () => {
  let app: NestFastifyApplication;
  let feedModel: MockModel;
  let userModel: MockModel;
  let articleService: ArticleService;
  let feedParserService: FeedParserService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken('User'))
      .useValue(mockModelFactory())
      .overrideProvider(getModelToken('Feed'))
      .useValue(mockModelFactory())
      .overrideProvider(getModelToken('Article'))
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

    feedModel = moduleFixture.get(getModelToken('Feed'));
    userModel = moduleFixture.get(getModelToken('User'));
    articleService = moduleFixture.get(ArticleService);
    feedParserService = moduleFixture.get(FeedParserService);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a feed when authenticated', async () => {
    // Mock user for session
    const mockUser = {
      _id: 'user123',
      login: 'test',
      role: 'user',
      toObject: () => ({ _id: 'user123', login: 'test', role: 'user' }),
    };

    const query = mockQueryFactory();
    query.exec.mockResolvedValue(mockUser);

    userModel.findOne!.mockReturnValue(query);
    (argon.verify as jest.Mock).mockResolvedValue(true);
    userModel.findByIdAndUpdate!.mockResolvedValue(mockUser);

    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/auth/login')
      .send({ login: 'test', password: 'password' })
      .expect(200);

    // Mock feed creation logic
    jest.spyOn(feedParserService, 'getNewArticles').mockResolvedValue([]);
    jest.spyOn(articleService, 'addMany').mockResolvedValue([] as any);
    feedModel.create!.mockResolvedValue({
      _id: 'feed1',
      link: 'http://test.com',
    });

    await agent
      .post('/feed')
      .send({ link: 'http://test.com', name: 'Test Feed' })
      .expect(201)
      .expect((res) => {
        expect(res.body['link']).toBe('http://test.com');
      });
  });

  it('should list articles for a feed', async () => {
    // 1. Mock user and login
    const mockUser = {
      _id: 'user123',
      login: 'test',
      role: 'user',
      toObject: () => ({ _id: 'user123', login: 'test', role: 'user' }),
    };
    const query = mockQueryFactory();
    query.exec.mockResolvedValue(mockUser);

    userModel.findOne!.mockReturnValue(query);
    userModel.findByIdAndUpdate!.mockResolvedValue(mockUser);
    (argon.verify as jest.Mock).mockResolvedValue(true);

    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/auth/login')
      .send({ login: 'test', password: 'p' })
      .expect(200);

    // 2. Mock articles listing
    const mockArticles = {
      total: 1,
      result: [{ title: 'Article 1', feed: 'feed1' }],
    };
    const articleModel = app.get<MockModel>(getModelToken('Article'));
    articleModel.aggregate!.mockResolvedValue([mockArticles]);

    await agent
      .get('/article?feed=feed1')
      .expect(200)
      .expect((res) => {
        expect(res.body['total']).toBe(1);
        expect(res.body['result'][0]['title']).toBe('Article 1');
      });
  });
});
