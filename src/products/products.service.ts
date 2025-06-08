import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import Product from '@/products/models/product.model';
import { UUID } from 'crypto';
import { Op } from 'sequelize';
import { PaginatedResponseDto } from '@common/dto/paginated-response.dto';
import { pick } from '@core/utils/pick';

@Injectable()
export class ProductsService {
  public async findAll(
    pagination: PaginationDto,
    attributes?: (keyof Product)[],
  ): Promise<PaginatedResponseDto<Product>> {
    return await Product.paginate({ attributes, ...pagination });
  }

  public async findById(
    id: UUID,
    attributes?: string[],
  ): Promise<Product | null> {
    return await Product.findByPk(id, { attributes });
  }

  public async create(
    data: CreateProductDto,
    attributes?: (keyof Product)[],
  ): Promise<Product> {
    const { name } = data;

    if (await Product.exists({ name }))
      throw new BadRequestException(
        `Product with the name "${name}" already exists.`,
      );

    const product = await Product.create(data);
    return pick(product, attributes);
  }

  public async update(
    id: UUID,
    data: UpdateProductDto,
    attributes?: (keyof Product)[],
  ): Promise<Product> {
    const { name } = data;

    const product = await Product.findByPk(id, { attributes });

    if (!product)
      throw new NotFoundException(`Product with the id "${id}" wasn't found.`);

    if (name && (await Product.exists({ name, id: { [Op.ne]: id } }, null)))
      throw new BadRequestException(
        `Product with the name "${name}" already exists.`,
      );

    return await product.update(data);
  }

  public async delete(id: UUID): Promise<boolean> {
    const product = await Product.findByPk(id);

    if (!product)
      throw new NotFoundException(`Product with the id "${id}" wasn't found.`);

    return Boolean(await product.destroy());
  }

  public async findByCategory(
    category: string,
    pagination: PaginationDto,
    attributes?: (keyof Product)[],
  ): Promise<PaginatedResponseDto<Product>> {
    return await Product.paginate({
      attributes,
      where: { category } as any,
      ...pagination,
    });
  }

  public async getTotalCount(category?: string): Promise<number> {
    if (category) {
      return await Product.count({ where: { category } });
    }
    return await Product.count();
  }
}
