import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';

export class PaginatedResponseData {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  nextPageExists: boolean;

  @ApiProperty()
  previousPageExists: boolean;
}

export class PaginatedResponseDto<T extends NonNullable<unknown>> {
  @ApiProperty({ isArray: true })
  records: T[];

  @ApiProperty({ type: () => PaginatedResponseData })
  pagination: PaginatedResponseData;
}

export const ApiPaginatedResponse = <TModel extends Type>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto),
    ApiOkResponse({
      description: 'Successfully received models list',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              records: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
