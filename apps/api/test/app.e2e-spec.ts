import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/auth', () => {
    const registerBody = {
      name: 'E2E Admin',
      email: 'e2e@test.com',
      password: 'password123',
      restaurantName: 'E2E Restaurant',
    };

    it('POST /auth/register creates user and returns token', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerBody)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.accessToken).toBeDefined();
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toMatchObject({
            email: 'e2e@test.com',
            name: 'E2E Admin',
            role: 'admin',
          });
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('restaurantId');
        });
    });

    it('POST /auth/login returns token for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'e2e@test.com', password: 'password123' })
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('e2e@test.com');
        });
    });

    it('POST /auth/login returns 401 for wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'e2e@test.com', password: 'wrongpassword' })
        .expect(401)
        .then((res) => {
          expect(res.body.message).toBe('Wrong password');
        });
    });

    it('POST /auth/register returns 409 when email already registered', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerBody)
        .expect(409)
        .then((res) => {
          expect(res.body.message).toBe('Email already registered');
        });
    });
  });
});
