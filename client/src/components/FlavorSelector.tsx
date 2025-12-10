import React, { useState } from 'react';
import { MenuItem } from '../types/menu';
import { formatPriceInPHP } from '../utils/formatters';

interface FlavorSelectorProps {
  item: MenuItem;
  onConfirm: (selectedFlavor?: string) => void;
  onCancel: () => void;
}

const FlavorSelector: React.FC<FlavorSelectorProps> = ({
  item,
  onConfirm,
  onCancel,
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(undefined);
  const hasFlavors = item.flavors && item.flavors.length > 0;

  const handleConfirm = () => {
    if (hasFlavors && !selectedFlavor) {
      alert('Please select a flavor before adding to cart');
      return;
    }
    onConfirm(selectedFlavor);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">Add to Cart</h2>
          <p className="text-slate-600 mt-1">{item.name}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Price</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {formatPriceInPHP(item.price)}
            </p>
          </div>

          {/* Flavor Selection */}
          {hasFlavors && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Choose Flavor <span className="text-red-600 font-normal">*</span>
              </label>
              <div className="space-y-2">
                {item.flavors!.map((flavor) => (
                  <label key={flavor} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="flavor"
                      value={flavor}
                      checked={selectedFlavor === flavor}
                      onChange={(e) => setSelectedFlavor(e.target.value)}
                      className="h-4 w-4 text-cyan-600 border-slate-300 focus:ring-cyan-500"
                    />
                    <span className="ml-3 text-slate-700 font-medium">{flavor}</span>
                  </label>
                ))}
                {selectedFlavor && (
                  <button
                    type="button"
                    onClick={() => setSelectedFlavor(undefined)}
                    className="w-full text-sm text-slate-600 hover:text-slate-800 py-2 mt-2 transition-colors"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          )}

          {!hasFlavors && (
            <p className="text-sm text-slate-600 italic">This item has no flavor options available</p>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-slate-200 p-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={hasFlavors && !selectedFlavor}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
              hasFlavors && !selectedFlavor
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:from-cyan-700 hover:to-blue-700 active:scale-95'
            }`}
          >
            {hasFlavors && !selectedFlavor ? 'Select a Flavor First' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlavorSelector;
