import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { AuthService } from '@/auth/auth.service';
import { defaultUser } from '@/database/seeders/1-user';
import { randomUUID } from 'crypto';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let productId: string;

  const name = `Product ${randomUUID()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    const authService = app.get(AuthService);

    accessToken = (await authService.signIn(defaultUser)).accessToken;

    await app.init();
  });

  describe('POST /products/create', () => {
    it('should create a product', async () => {
      return request(app.getHttpServer())
        .post('/products/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name,
          description: 'New product description',
          price: '19.99',
          category: 'Electronics',
        })
        .expect(201)
        .then((res) => {
          productId = res.body.id;
        });
    });

    it('should fail to create a product with the same name', async () => {
      return request(app.getHttpServer())
        .post('/products/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name,
          description: 'Another new product description',
          price: '19.99',
          category: 'Electronics',
        })
        .expect(400);
    });

    it('should fail if product name is missing', async () => {
      return request(app.getHttpServer())
        .post('/products/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          description: 'Product without a name',
          price: '10.00',
          category: 'Electronics',
        })
        .expect(400);
    });

    it('should fail if product name exceeds maximum length', async () => {
      const longName = 'a'.repeat(101);
      return request(app.getHttpServer())
        .post('/products/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: longName,
          description: 'Product with too long name',
          price: '10.00',
          category: 'Electronics',
        })
        .expect(400);
    });

    it('should fail if product name is only whitespace', async () => {
      return request(app.getHttpServer())
        .post('/products/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '   ',
          description: 'Whitespace name',
          price: '20.00',
          category: 'Home Goods',
        })
        .expect(400);
    });

    it('should fail if product category is missing', async () => {
      return request(app.getHttpServer())
        .post('/products/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Product without category',
          description: 'Valid description',
          price: '15.99',
        })
        .expect(400);
    });

    it('should fail if product category is only whitespace', async () => {
      return request(app.getHttpServer())
        .post('/products/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Valid Name',
          description: 'Valid Description',
          price: '99.99',
          category: '   ',
        })
        .expect(400);
    });

    it('should fail if price is not a valid decimal', async () => {
      return request(app.getHttpServer())
        .post('/products/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Valid Product',
          description: 'Valid Description',
          price: 'ninety-nine',
          category: 'Books',
        })
        .expect(400);
    });

    it('should fail if description is provided but is only whitespace', async () => {
      return request(app.getHttpServer())
        .post('/products/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Another Valid Product',
          description: '   ',
          price: '50.00',
          category: 'Gadgets',
        })
        .expect(400);
    });

    it('should trim input before validation', async () => {
      return request(app.getHttpServer())
        .post('/products/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `  ${name} 2  `,
          description: '  New Product Description  ',
          price: '9.99',
          category: '  Electronics  ',
        })
        .expect(201)
        .then((response) => {
          expect(response.body.name).toBe(`${name} 2`);
          expect(response.body.description).toBe('New Product Description');
          expect(response.body.price).toBe('9.99');
          expect(response.body.category).toBe('Electronics');
        });
    });

    it('should fail if authorization was not provided', async () => {
      return request(app.getHttpServer())
        .post('/products/create')
        .send({
          name: `New Product ${randomUUID()}`,
          description: 'New Product Description',
          price: '19.99',
          category: 'Electronics',
        })
        .expect(401);
    });
  });

  describe('GET /products', () => {
    it('should retrieve all products', async () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((response) => {
          expect(response.body.records).toBeInstanceOf(Array);
        });
    });

    it('should return 401 if authorization was not provided', async () => {
      return request(app.getHttpServer()).get('/products').expect(401);
    });
  });

  describe('GET /products/:id', () => {
    it('should retrieve a specific product by id', async () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should faild if product is not found', async () => {
      return request(app.getHttpServer())
        .get(`/products/${randomUUID()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it(`should fail if id is not valid`, async () => {
      const productId = 'not-valid-uuid';
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it(`should fail if authorization was not provided`, async () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(401);
    });
  });

  describe('PATCH /products/update/:id', () => {
    it('should update a product', async () => {
      return request(app.getHttpServer())
        .patch(`/products/update/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Updated ${name}`,
          description: 'Updated description',
          price: '29.99',
          category: 'Electronics',
        })
        .expect(200);
    });

    it('should fail if product does not exist', async () => {
      return request(app.getHttpServer())
        .patch(`/products/update/${randomUUID()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Non-existent Product',
          description: 'This product does not exist',
          price: '100.00',
          category: 'Fiction',
        })
        .expect(404);
    });

    it('should fail if price is not a valid decimal', async () => {
      return request(app.getHttpServer())
        .patch(`/products/update/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Valid Name',
          description: 'Valid Description',
          price: 'incorrect',
          category: 'Toys',
        })
        .expect(400);
    });

    it('should fail if the name exceeds maximum length', async () => {
      const longName = 'a'.repeat(101); // 101 characters
      return request(app.getHttpServer())
        .patch(`/products/update/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: longName,
          description: 'Valid Description',
          price: '99.99',
          category: 'Electronics',
        })
        .expect(400);
    });

    it('should fail if unauthorized', async () => {
      return request(app.getHttpServer())
        .patch(`/products/update/${productId}`)
        .send({
          name: 'Unauthorized Update',
          description: 'Trying to update without auth',
          price: '59.99',
          category: 'Games',
        })
        .expect(401);
    });
  });

  describe('DELETE /products/delete/:id', () => {
    it('should fail if unauthorized', async () => {
      return request(app.getHttpServer())
        .delete(`/products/delete/${productId}`)
        .expect(401);
    });

    it('should fail if id is not valid', async () => {
      const productId = 'not-valid-uuid';
      return request(app.getHttpServer())
        .delete(`/products/delete/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should delete a product', async () => {
      return request(app.getHttpServer())
        .delete(`/products/delete/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should fail if the product to delete is not found', async () => {
      return request(app.getHttpServer())
        .delete(`/products/delete/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
