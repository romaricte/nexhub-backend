import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, Version, ParseUUIDPipe,
  UploadedFiles, CacheInterceptor, CacheTTL, SerializeOptions,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes,
  ApiPaginatedResponse,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { CreateProductCommand } from './commands/create-product.command';
import { GetProductsQuery } from './queries/get-products.query';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ strategy: 'excludeAll' }) // ✅ Serialization
export class ProductsController {
  constructor(
    private commandBus: CommandBus, // ✅ CQRS
    private queryBus: QueryBus,     // ✅ CQRS
  ) {}

  @Get()
  @SkipThrottle() // ✅ Pas de rate limit sur les lectures
  @UseInterceptors(CacheInterceptor) // ✅ Cache automatique
  @CacheTTL(30)
  @ApiOperation({ summary: 'List products with filters & pagination' })
  async findAll(@Query() pagination: PaginationDto, @CurrentUser('tenantId') tenantId: string) {
    return this.queryBus.execute(
      new GetProductsQuery(
        pagination.page,
        pagination.limit,
        pagination.search,
        pagination.categoryId,
        pagination.minPrice,
        pagination.maxPrice,
        pagination.sortBy,
        pagination.sortOrder,
        tenantId,
      ),
    );
  }

  @Post()
  @Roles(UserRole.SELLER, UserRole.ADMIN) // ✅ RBAC
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 5)) // ✅ File upload
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: any,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.commandBus.execute(
      new CreateProductCommand(
        dto.name,
        dto.description,
        dto.price,
        dto.stock,
        dto.categoryId,
        user.sub,
        user.tenantId,
      ),
    );
  }
}