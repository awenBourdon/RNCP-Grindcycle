import { headers } from 'next/headers';
import { AddProductForm } from '../components/AddProductForm';

export default async function AjouterProduitPage() {
  const headersList = await headers();

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  try {
    const response = await fetch(
      `${baseUrl}/api/usedboards?available=true&admin=true`,
      {
        headers: {
          ...Object.fromEntries(headersList.entries()),
        },
        cache: 'default',
      }
    );

    const data = await response.json();
    const usedBoards = data.success ? data.data : [];

    return <AddProductForm usedBoards={usedBoards} />;
  } catch {
    return <AddProductForm usedBoards={[]} />;
  }
}
