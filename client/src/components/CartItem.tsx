import React from 'react';
import { CartItem as ICartItem } from '../types/cart';
import { formatPriceInPHP } from '../utils/formatters';

interface CartItemProps {
  item: ICartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onUpdateNotes,
}) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = parseInt(e.target.value);
    onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <div className="flex items-center py-4 border-b">
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">{item.menuItem.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{item.menuItem.description}</p>
        
        {/* Display selected flavor (read-only) */}
        {item.selectedFlavor && (
          <div className="mt-1 text-xs text-gray-600">
            Flavor: <span className="font-medium">{item.selectedFlavor}</span>
          </div>
        )}

        <textarea
          value={item.notes || ''}
          onChange={(e) => onUpdateNotes(item.id, e.target.value)}
          placeholder="Add special instructions..."
          className="mt-2 w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={1}
        />
      </div>
      <div className="flex items-center ml-4 space-x-4">
        <select
          value={item.quantity}
          onChange={handleQuantityChange}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        <span className="text-lg font-medium text-gray-900">
          {formatPriceInPHP(item.menuItem.price * item.quantity)}
        </span>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;