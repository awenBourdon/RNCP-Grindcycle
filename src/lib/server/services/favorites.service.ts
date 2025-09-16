import {
  InterfaceFavoriteRepository,
  FavoriteWithProduct
} from '../repositories/interfaces/interfaceFavoriteRepository';
import { FavoriteRepository } from '../repositories/favoriteRepository';
import { InterfaceProductRepository } from '../repositories/interfaces/interfaceProductRepository';
import { ProductRepository } from '../repositories/productRepository';

export class FavoriteService {
  constructor(
    private favoriteRepository: InterfaceFavoriteRepository = new FavoriteRepository(),
    private productRepository: InterfaceProductRepository = new ProductRepository()
  ) {}

  async getUserFavorites(userId: string): Promise<FavoriteWithProduct[]> {
    return await this.favoriteRepository.findByUserId(userId);
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