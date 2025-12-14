import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/CartItem';
import { formatPriceInPHP } from '../utils/formatters';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, updateNotes, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/order-confirmation');
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate('/menu')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:bg-white"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8"> Cart</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onUpdateNotes={updateNotes}
              />
            ))}

            <div className="mt-8 border-t pt-8">
              {/* Out of stock warning */}
              {cart.items.some(item => (item.menuItem.stockCount ?? 0) === 0) && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                  <p className="font-bold">⚠️ Out of Stock Items</p>
                  <p className="text-sm mt-1">Some items in your cart are out of stock. Please remove them before checkout.</p>
                </div>
              )}

              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>{formatPriceInPHP(cart.subtotal)}</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-500 mt-2">
                <p>Tax</p>
                <p>{formatPriceInPHP(cart.tax)}</p>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 mt-2">
                <p>Total</p>
                <p>{formatPriceInPHP(cart.total)}</p>
              </div>

              <div className="mt-6 space-x-4">
                <button
                  onClick={handleCheckout}
                  disabled={cart.items.some(item => (item.menuItem.stockCount ?? 0) === 0)}
                  className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                    cart.items.some(item => (item.menuItem.stockCount ?? 0) === 0)
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:bg-indigo-700'
                  }`}
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;