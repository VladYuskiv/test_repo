import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { UUID } from 'crypto';
import {
  ApiPaginatedResponse,
  PaginatedResponseDto,
} from '@common/dto/paginated-response.dto';
import { ProductDto } from '@/products/dto/product.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import Product from '@/products/models/product.model';

@UseGuards(AuthGuard)
@Controller('products')
@ApiTags('Products')
@ApiBearerAuth()
export class ProductsController {
  private readonly productsAttributes?: (keyof Product)[] = [
    'id',
    'name',
    'description',
    'price',
    'category',
  ];

  constructor(private readonly productsService: ProductsService) {}

  /**
   * Retrieves all products.
   * Pagination params can be passed in the query params.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiPaginatedResponse(ProductDto)
  public async findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<ProductDto>> {
    return (await this.productsService.findAll(
      pagination,
      this.productsAttributes,
    )) as PaginatedResponseDto<ProductDto>;
  }

  /**
   * Retrieves a single product by its id.
   * If the product doesn't exist, a 404 Not Found response is returned.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiNotFoundResponse({ description: `Product doesn't exist` })
  public async findOne(
    @Param('id', ParseUUIDPipe) id: UUID,
  ): Promise<ProductDto> {
    const product = await this.productsService.findById(
      id,
      this.productsAttributes,
    );

    if (!product)
      throw new NotFoundException(`Product with the id "${id}" wasn't found`);

    return product as ProductDto;
  }

  /**
   * Creates a new product.
   * If a product with the same name already exists, a 400 Bad Request response is returned.
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiBadRequestResponse({
    description: `Product with the same name already exists`,
  })
  public async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductDto> {
    return (await this.productsService.create(
      createProductDto,
      this.productsAttributes,
    )) as ProductDto;
  }

  /**
   * Updates a product by its id.
   * If the product doesn't exist, a 404 Not Found response is returned.
   * If a product with the same name already exists, a 400 Bad Request response is returned.
   */
  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiNotFoundResponse({ description: `Product doesn't exist` })
  @ApiBadRequestResponse({
    description: `Product with the same name already exists`,
  })
  public async update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductDto> {
    return (await this.productsService.update(
      id,
      updateProductDto,
      this.productsAttributes,
    )) as ProductDto;
  }

  /**
   * Deletes a product by its id.
   * If the product doesn't exist, a 404 Not Found response is returned.
   */
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiNotFoundResponse({ description: `Product doesn't exist` })
  public async remove(@Param('id', ParseUUIDPipe) id: UUID): Promise<void> {
    await this.productsService.delete(id);
  }

  /**
   * Retrieves products by category.
   * Pagination params can be passed in the query params.
   */
  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  @ApiPaginatedResponse(ProductDto)
  public async findByCategory(
    @Param('category') category: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<ProductDto>> {
    return (await this.productsService.findByCategory(
      category,
      pagination,
      this.productsAttributes,
    )) as PaginatedResponseDto<ProductDto>;
  }

  /**
   * Retrieves total count of products.
   */
  @Get('count')
  @HttpCode(HttpStatus.OK)
  public async getTotalCount(): Promise<{ count: number }> {
    const count = await this.productsService.getTotalCount();
    return { count };
  }
}
