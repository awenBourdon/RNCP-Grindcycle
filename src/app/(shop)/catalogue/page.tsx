import { Catalog } from './components/Catalog';
import { ToTop } from '../../../components/ui/ToTop';

export default async function CatalogPage() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  let products = [];

  try {
    const response = await fetch(`${baseUrl}/api/products?available=true`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      products = data.success ? data.data : [];
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      <div className="pt-40 pb-16 px-6 text-center bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-normal text-[#010101]">
            Catalogue
          </h1>
        </div>
      </div>
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <Catalog products={products} />
      </div>
      <ToTop />
    </div>
  );
}
