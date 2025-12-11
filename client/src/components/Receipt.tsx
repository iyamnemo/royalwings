import React from 'react';
import { Order } from '../types/order';
import { formatPriceInPHP } from '../utils/formatters';
import { Dialog } from '@headlessui/react';

interface ReceiptProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ order, isOpen, onClose }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date);
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm bg-white rounded-lg shadow-xl p-6 min-h-[24rem]">
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold">Royal Wings</h2>
            <p className="text-gray-600 text-sm">Official E-Receipt</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order #:</span>
              <span className="font-medium">{order.id}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pickup Code:</span>
              <span className="font-bold text-indigo-600">{order.pickupCode}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.quantity}x</span>{' '}
                        {item.menuItem.name}
                      </div>
                      <div>{formatPriceInPHP(item.menuItem.price * item.quantity)}</div>
                    </div>
                    {item.selectedFlavor && (
                      <div className="text-xs text-gray-500 pl-4">
                        Flavor: <span className="font-medium">{item.selectedFlavor}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPriceInPHP(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatPriceInPHP(order.tax)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span>{formatPriceInPHP(order.total)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-1">Notes:</h3>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default Receipt;