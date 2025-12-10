import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import CartItem from './CartItem';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const CartPopup: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, updateNotes } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [storeOpen, setStoreOpen] = useState(true);

  useEffect(() => {
    const fetchStoreStatus = async () => {
      try {
        const storeStatusDoc = await getDoc(doc(db, 'storeStatus', 'settings'));
        if (storeStatusDoc.exists()) {
          setStoreOpen(storeStatusDoc.data().isOpen ?? true);
        } else {
          setStoreOpen(true);
        }
      } catch (err) {
        console.error('Failed to fetch store status:', err);
        setStoreOpen(true);
      }
    };

    const interval = setInterval(fetchStoreStatus, 5000); // Check every 5 seconds
    fetchStoreStatus();
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
      >
        <div className="relative">
          <svg
            className="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>

          {/* Badge with item count */}
          {cart.items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cart.items.length}
            </span>
          )}
        </div>
      </button>

      {/* Cart Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-96 bg-white rounded-xl shadow-lg border border-slate-200 max-h-[80vh] flex flex-col animate-slide-up">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="font-bold text-cyan-100 text-lg">Your Cart</h3>
              <p className="text-sm text-cyan-100">{cart.items.length} items</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-primary-700 rounded-lg p-2 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cart.items.length === 0 ? (
              <div className="text-center py-12 px-4">
                <svg
                  className="w-16 h-16 mx-auto text-neutral-300 mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                <p className="text-neutral-500 font-medium">Your cart is empty</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    onUpdateNotes={updateNotes}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t border-neutral-200 p-4 bg-neutral-50 space-y-3 flex-shrink-0">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal:</span>
                  <span className="font-semibold">₱{cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax:</span>
                  <span className="font-semibold">₱{cart.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-neutral-200 pt-2 mt-2">
                  <span>Total:</span>
                  <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                    ₱{cart.total.toFixed(2)}
                  </span>
                </div>
              </div>
              {storeOpen ? (
                <button
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={() => {
                    navigate('/cart');
                    setIsOpen(false);
                  }}
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div className="w-full bg-red-100 text-red-700 py-3 rounded-lg font-semibold text-center">
                  Store is currently closed
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CartPopup;
