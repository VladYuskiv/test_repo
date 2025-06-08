import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/sequelize';
import Product from './models/product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UUID } from 'crypto';
import { Sequelize } from 'sequelize-typescript';

jest.mock('./models/product.model');

const mockProduct = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Product',
  description: 'Test Description',
  price: '19.99',
  category: 'Test Category',
  update: jest.fn(),
  destroy: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductModel = {
    paginate: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    exists: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
        {
          provide: Sequelize,
          useValue: {
            model: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const pagination: PaginationDto = { limit: 10, offset: 0 };
      const mockRows = [mockProduct];
      const mockCount = 1;
      const mockPagination = {
        total: mockCount,
        totalPages: 1,
        currentPage: 1,
        nextPageExists: false,
        previousPageExists: false,
      };
      jest.spyOn(Product, 'paginate').mockResolvedValue({
        records: mockRows,
        pagination: mockPagination,
      } as any);
      const result = await service.findAll(pagination);
      expect(result).toEqual({
        records: mockRows,
        pagination: expect.objectContaining({
          total: mockCount,
          totalPages: expect.any(Number),
          currentPage: expect.any(Number),
          nextPageExists: expect.any(Boolean),
          previousPageExists: expect.any(Boolean),
        }),
      });
    });
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000' as UUID;
      jest.spyOn(Product, 'findByPk').mockResolvedValue(mockProduct as any);
      const result = await service.findById(id);
      expect(result).toEqual(mockProduct);
    });
    it('should return null if product not found', async () => {
      const id = 'not-found-id' as UUID;
      jest.spyOn(Product, 'findByPk').mockResolvedValue(null as any);
      const result = await service.findById(id);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: '29.99',
        category: 'New Category',
      };
      jest.spyOn(Product, 'exists').mockResolvedValue(false as any);
      jest.spyOn(Product, 'create').mockResolvedValue(mockProduct as any);
      const result = await service.create(createProductDto);
      expect(result).toEqual(mockProduct);
    });
    it('should throw BadRequestException if product with same name exists', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Existing Product',
        description: 'Description',
        price: '39.99',
        category: 'Category',
      };
      jest.spyOn(Product, 'exists').mockResolvedValue(true as any);
      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000' as UUID;
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: '49.99',
      };
      const updatedProduct = { ...mockProduct, ...updateProductDto };
      const updateMock = jest.fn().mockResolvedValue(updatedProduct);
      jest
        .spyOn(Product, 'findByPk')
        .mockResolvedValue({ ...mockProduct, update: updateMock } as any);
      jest.spyOn(Product, 'exists').mockResolvedValue(false as any);
      const result = await service.update(id, updateProductDto);
      expect(result).toEqual(updatedProduct);
      expect(updateMock).toHaveBeenCalledWith(updateProductDto);
    });
    it('should throw NotFoundException if product not found', async () => {
      const id = 'not-found-id' as UUID;
      const updateProductDto: UpdateProductDto = { name: 'Updated Product' };
      jest.spyOn(Product, 'findByPk').mockResolvedValue(null as any);
      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should throw BadRequestException if product with same name exists', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000' as UUID;
      const updateProductDto: UpdateProductDto = { name: 'Existing Product' };
      jest.spyOn(Product, 'findByPk').mockResolvedValue(mockProduct as any);
      jest.spyOn(Product, 'exists').mockResolvedValue(true as any);
      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000' as UUID;
      const destroyMock = jest.fn().mockResolvedValue(true);
      jest
        .spyOn(Product, 'findByPk')
        .mockResolvedValue({ ...mockProduct, destroy: destroyMock } as any);
      const result = await service.delete(id);
      expect(result).toBe(true);
      expect(destroyMock).toHaveBeenCalled();
    });
    it('should throw NotFoundException if product not found', async () => {
      const id = 'not-found-id' as UUID;
      jest.spyOn(Product, 'findByPk').mockResolvedValue(null as any);
      await expect(service.delete(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCategory', () => {
    it('should return paginated products by category', async () => {
      const category = 'Test Category';
      const pagination: PaginationDto = { limit: 10, offset: 0 };
      const mockRows = [mockProduct];
      const mockCount = 1;
      const mockPagination = {
        total: mockCount,
        totalPages: 1,
        currentPage: 1,
        nextPageExists: false,
        previousPageExists: false,
      };
      jest.spyOn(Product, 'paginate').mockResolvedValue({
        records: mockRows,
        pagination: mockPagination,
      } as any);
      const result = await service.findByCategory(category, pagination);
      expect(result).toEqual({
        records: mockRows,
        pagination: expect.objectContaining({
          total: mockCount,
          totalPages: expect.any(Number),
          currentPage: expect.any(Number),
          nextPageExists: expect.any(Boolean),
          previousPageExists: expect.any(Boolean),
        }),
      });
      expect(Product.paginate).toHaveBeenCalledWith({
        attributes: undefined,
        where: { category },
        ...pagination,
      });
    });
  });

  describe('getTotalCount', () => {
    it('should return total count of products', async () => {
      const mockCount = 42;
      jest.spyOn(Product, 'count').mockResolvedValue(mockCount);
      const result = await service.getTotalCount();
      expect(result).toBe(mockCount);
      expect(Product.count).toHaveBeenCalledWith();
    });
    it('should return count of products for a category', async () => {
      const mockCount = 10;
      const category = 'Test Category';
      jest.spyOn(Product, 'count').mockResolvedValue(mockCount);
      const result = await service.getTotalCount(category);
      expect(result).toBe(mockCount);
      expect(Product.count).toHaveBeenCalledWith({ where: { category } });
    });
  });
});
