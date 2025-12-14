import React, { useState } from 'react';
import { MenuItem } from '../types/menu';
import { formatPriceInPHP } from '../utils/formatters';
import FlavorSelector from './FlavorSelector';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  isAdmin?: boolean;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  onUpdateStock?: (id: string, stockCount: number) => void;
  storeOpen?: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({
  item,
  onAddToCart,
  isAdmin = false,
  onEdit,
  onDelete,
  onUpdateStock,
  storeOpen = true,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFlavorSelectorOpen, setIsFlavorSelectorOpen] = useState(false);
  const [pendingFlavorItem, setPendingFlavorItem] = useState<MenuItem | null>(null);
  const [stockInput, setStockInput] = useState<string>((item.stockCount ?? 0).toString());

  // Check if item is available (stock > 0)
  const isAvailable = (item.stockCount ?? 0) > 0;

  const handleAddToCart = (itemToAdd: MenuItem) => {
    if (itemToAdd.flavors && itemToAdd.flavors.length > 0) {
      setPendingFlavorItem(itemToAdd);
      setIsFlavorSelectorOpen(true);
    } else {
      onAddToCart?.(itemToAdd);
    }
  };

  const handleFlavorSelected = (selectedFlavor?: string) => {
    if (pendingFlavorItem) {
      const itemToAdd = {
        ...pendingFlavorItem,
        _selectedFlavor: selectedFlavor,
      };
      onAddToCart?.(itemToAdd as MenuItem);
      setIsFlavorSelectorOpen(false);
      setPendingFlavorItem(null);
      setIsDetailOpen(false);
    }
  };

  return (
    <>
      {/* Main Card */}
      <div 
        onClick={() => !isAdmin && setIsDetailOpen(true)}
        className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-cyan-200 hover:-translate-y-1 ${!isAdmin ? 'cursor-pointer' : ''}`}
      >
        {item.imageUrl && (
        <div className="w-full h-56 overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.name}</h3>
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
            {formatPriceInPHP(item.price)}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{item.description}</p>
        <p className="text-xs text-cyan-600 font-medium mb-4">
          Category: {item.category}
        </p>
        <div className="mb-4 text-sm">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700">Stock:</label>
              <input
                type="number"
                min="0"
                value={stockInput}
                onChange={(e) => setStockInput(e.target.value)}
                onBlur={() => {
                  const newStock = parseInt(stockInput) || 0;
                  if (newStock !== (item.stockCount ?? 0) && onUpdateStock) {
                    onUpdateStock(item.id, newStock);
                  }
                }}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
              />
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                (item.stockCount ?? 0) > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {(item.stockCount ?? 0) > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          ) : (
            <div className={`text-sm font-medium ${
              isAvailable ? 'text-green-600' : 'text-red-600'
            }`}>
              {isAvailable ? `${item.stockCount ?? 0} Available` : 'Out of Stock'}
            </div>
          )}
        </div>
          {!isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
              disabled={!isAvailable || !storeOpen}
              className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                isAvailable && storeOpen
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:from-cyan-700 hover:to-blue-700 active:scale-95'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {!storeOpen ? 'Store Closed' : isAvailable ? 'Add to Cart' : 'Out of Stock'}
            </button>
          )}
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(item);
                }}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(item.id);
                }}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn mt-16"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(90vh-4rem)] overflow-y-auto animate-slideUp hide-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="sticky top-0 bg-white border-b border-slate-200 flex justify-between items-center p-6">
              <h2 className="text-2xl font-bold text-slate-900">Product Details</h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              {item.imageUrl && (
                <div className="w-full rounded-xl overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 h-80">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{item.name}</h1>
                    <p className="text-lg text-cyan-600 font-semibold mb-4">
                      Category: {item.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      {formatPriceInPHP(item.price)}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      isAvailable
                        ? 'bg-cyan-100 text-cyan-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isAvailable ? `${item.stockCount ?? 0} In Stock` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Full Description */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>


              </div>

              {/* Action Buttons */}
              {!isAdmin && (
                <button
                  onClick={() => {
                    handleAddToCart(item);
                    setIsDetailOpen(false);
                  }}
                  disabled={!isAvailable}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isAvailable
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:from-cyan-700 hover:to-blue-700 active:scale-95'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flavor Selector Modal */}
      {isFlavorSelectorOpen && pendingFlavorItem && (
        <FlavorSelector
          item={pendingFlavorItem}
          onConfirm={handleFlavorSelected}
          onCancel={() => {
            setIsFlavorSelectorOpen(false);
            setPendingFlavorItem(null);
          }}
        />
      )}
    </>
  );
};

export default MenuCard;