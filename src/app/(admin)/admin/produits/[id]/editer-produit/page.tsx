import { notFound } from 'next/navigation';
import { ProductService } from '@/lib/server/products/products.service';
import { UsedBoardService } from '@/lib/server/used-boards/used-boards.service';
import { EditProductForm } from '../../../components/EditProductForm';

const productService = new ProductService();
const usedBoardService = new UsedBoardService();

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const product = await productService.getProductById(id);

    const usedBoards = (await usedBoardService.getAllUsedBoards()) as any;

    if (!product) {
      notFound();
    }

    return <EditProductForm product={product as any} usedBoards={usedBoards} />;
  } catch (error) {
    notFound();
  }
}
