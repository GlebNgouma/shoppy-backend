import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PRODUCT_IMAGES } from './product-image';
import { Prisma } from '@prisma/client';
import { ProductsGateway } from './products.gateway';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productsGateway: ProductsGateway,
  ) {}

  async createProduct(data: CreateProductDto, userId: number) {
    const product = await this.prismaService.product.create({
      data: { ...data, userId },
    });
    //une fois le produit cree, on informe nos clients
    await this.productsGateway.handleProductUpdate();
    return product;
  }

  async getProducts(status?: string) {
    const args: Prisma.ProductFindManyArgs = {};
    if (status === 'availible') {
      args.where = { sold: false };
    }

    const products = await this.prismaService.product.findMany(args);
    return Promise.all(
      products.map(async (product) => ({
        ...product,
        imageExists: await this.imageExists(product.id),
      })),
    );
  }

  async getProduct(productId: number) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      throw new NotFoundException(`Produit non trouvé avec id #${productId}`);

    return {
      ...product,
      imageExists: await this.imageExists(+productId),
    };
  }

  async updateProduct(productId: number, data: Prisma.ProductUpdateInput) {
    await this.prismaService.product.update({ where: { id: productId }, data });
    this.productsGateway.handleProductUpdate();
  }

  //verifie si il existe une image pour un produit
  private async imageExists(productId: number) {
    try {
      await fs.access(
        join(`${PRODUCT_IMAGES}/${productId}.jpg`),
        fs.constants.F_OK,
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
