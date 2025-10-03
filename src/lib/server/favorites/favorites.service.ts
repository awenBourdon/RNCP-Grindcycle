import { normalizePaginationParams, PaginatedResponse, PaginationParams } from "@/lib/utils/pagination";
import { InterfaceProductRepository } from "../products/repository/interface-products.repository";
import { ProductRepository } from "../products/repository/products.repository";
import { FavoriteRepository } from "./repository/favorites.repository";
import { FavoriteWithProduct, InterfaceFavoriteRepository } from "./repository/interface-favorites.repository";


export class FavoriteService {
  constructor(
    private favoriteRepository: InterfaceFavoriteRepository = new FavoriteRepository(),
    private productRepository: InterfaceProductRepository = new ProductRepository()
  ) {}

    async getUserFavorites(
    userId: string, 
    params: PaginationParams
  ): Promise<PaginatedResponse<FavoriteWithProduct>> {
    const { page, limit } = normalizePaginationParams(params);
    return await this.favoriteRepository.findByUserId(userId, page, limit);
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    return await this.favoriteRepository.exists(userId, productId);
  }

  async toggleFavorite(userId: string, productId: string): Promise<{ action: 'added' | 'removed'; message: string }> {
    const product = await this.productRepository.findById(productId);
    
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    const existingFavorite = await this.favoriteRepository.exists(userId, productId);

    if (existingFavorite) {
      await this.favoriteRepository.delete(userId, productId);
      return { action: 'removed', message: 'Retiré des favoris' };
    } else {
      await this.favoriteRepository.create(userId, productId);
      return { action: 'added', message: 'Ajouté aux favoris' };
    }
  }
}