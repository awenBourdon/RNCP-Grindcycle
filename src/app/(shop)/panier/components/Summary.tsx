import Link from 'next/link';
import { useCart } from '@/app/contexts/CartContext';

export const Summary = () => {
  const { getCartTotal, getShippingCost, clearCart } = useCart();
  const subtotal = getCartTotal();
  const shipping = getShippingCost();
  const total = subtotal + shipping;

  return (
    <div className="p-6 rounded-lg bg-[#f8f7f4] max-h-[26.5rem]">
      <h2 className="text-xl font-medium mb-6">Récapitulatif</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Sous-total</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Livraison</span>
          <span>
            {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} €`}
          </span>
        </div>
        {shipping > 0 && (
          <div className="text-sm text-gray-500 italic">
            Livraison gratuite à partir de 100€ d&apos;achat
          </div>
        )}
        <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>

      <div className="space-y-4">
        <Link href="panier/redirect">
          <button className="w-full py-3 mb-2 bg-[#0a3d3f] text-white rounded-full hover:bg-[#0a4d4f] transition-colors">
            Passer la commande
          </button>
        </Link>
        <Link
          href="/catalogue"
          className="block w-full py-3 text-center border border-[#0a3d3f] text-[#0a3d3f] rounded-full hover:bg-[#0a3d3f] hover:text-white transition-colors"
        >
          Continuer mes achats
        </Link>
        <button
          onClick={clearCart}
          className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
        >
          Vider mon panier
        </button>
      </div>
    </div>
  );
};
