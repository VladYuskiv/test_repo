import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { randomUUID } from 'crypto';

describe('AuthController (e2e)', () => {
	let app: INestApplication;

	const email = `${randomUUID()}@gmail.com`;
	const password = '12345Ab67';
	const fullName = 'Test User';

	let accessToken: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		app.useGlobalPipes(new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
			transformOptions: {
				enableImplicitConversion: true
			}
		}));

		await app.init();
	});

	it('/auth/sign-up (POST) - fail (not an email)', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-up')
			.send({
				email: 'test',
				password,
				fullName
			})
			.expect(400);
	});

	it('/auth/sign-up (POST) - fail (empty full name)', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-up')
			.send({
				email,
				password,
				fullName: '      '
			})
			.expect(400);
	});

	it('/auth/sign-up (POST) - fail (password too short)', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-up')
			.send({
				email: 'test-with-short-password@example.com',
				password: '123',
				fullName
			})
			.expect(400);
	});

	it('/auth/sign-up (POST) - fail (password too long)', async () => {
		const longPassword = 'a'.repeat(256) + 'A1';
		return request(app.getHttpServer())
			.post('/auth/sign-up')
			.send({
				email: 'test-with-long-password@example.com',
				password: longPassword,
				fullName
			})
			.expect(400);
	});

	it('/auth/sign-up (POST) - fail (password without uppercase)', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-up')
			.send({
				email: 'test-without-uppercase-password@example.com',
				password: 'alllowercase1!',
				fullName
			})
			.expect(400);
	});

	it('/auth/sign-up (POST) - fail (password without lowercase)', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-up')
			.send({
				email: 'test-without-lowercase-password@example.com',
				password: 'ALLUPPERCASE1!',
				fullName
			})
			.expect(400);
	});

	it('/auth/sign-up (POST) - fail (password without digits or special characters)', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-up')
			.send({
				email: 'test-without-digits-or-specials-password@example.com',
				password: 'NoDigitsOrSpecials',
				fullName
			})
			.expect(400);
	});

	it('/auth/sign-up (POST) - success', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-up')
			.send({
				email,
				password,
				fullName
			})
			.expect(201)
	});

	it('/auth/sign-up (POST) - fail (email already exists)', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-up')
			.send({
				email,
				password: 'AnotherPassword123',
				fullName: 'Test User 2'
			})
			.expect(400);
	});

	it('/auth/sign-in (POST) - fail (wrong credentials)', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-in')
			.send({
				email: 'test@example.com',
				password: 'wrongpassword'
			})
			.expect(401);
	});

	it('/auth/sign-in (POST) - fail (wrong email)', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-in')
			.send({
				email: 'test@example.com',
				password
			})
			.expect(401);
	});

	it('/auth/sign-in (POST) - fail (wrong password)', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-in')
			.send({
				email,
				password: 'completelywrong'
			})
			.expect(401);
	});

	it('/auth/sign-in (POST) - success', async () => {
		return request(app.getHttpServer())
			.post('/auth/sign-in')
			.send({
				email: 'test@example.com',
				password: 'password123'
			})
			.expect(200)
			.expect(res => {
				expect(res.body.accessToken).not.toBeUndefined();
				accessToken = res.body.accessToken;
			});
	});

	it('/auth/me (GET) - success', async () => {
		return request(app.getHttpServer())
			.get('/auth/me')
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);
	});

	it('/auth/me (GET) - fail (authorization was not provided)', async () => {
		return request(app.getHttpServer())
			.get('/auth/me')
			.expect(401);
	});

	afterAll(async () => {
		await app.close();
	});
});
