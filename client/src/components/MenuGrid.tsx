import React, { useEffect, useState } from 'react';
import { MenuItem, Category } from '../types/menu';
import { menuService } from '../services/menuService';
import MenuCard from './MenuCard';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface MenuGridProps {
  isAdmin?: boolean;
  onAddToCart?: (item: MenuItem) => void;
  onEditItem?: (item: MenuItem) => void;
  onDeleteItem?: (id: string) => void;
  onToggleAvailability?: (id: string, available: boolean) => void;
  refreshTrigger?: number;
}

const MenuGrid: React.FC<MenuGridProps> = ({
  isAdmin = false,
  onAddToCart,
  onEditItem,
  onDeleteItem,
  onToggleAvailability,
  refreshTrigger = 0,
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeOpen, setStoreOpen] = useState(true);

  const fetchData = async () => {
    try {
      const [items, cats] = await Promise.all([
        menuService.getAllMenuItems(),
        menuService.getAllCategories(),
      ]);
      setMenuItems(items);
      setCategories(cats);
    } catch (err) {
      setError('Failed to load menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchData();
    fetchStoreStatus();
    const interval = setInterval(fetchStoreStatus, 5000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const filteredItems = (() => {
    let items = selectedCategory === 'all'
      ? menuItems
      : menuItems.filter(item => item.category === selectedCategory);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    // Sort alphabetically by name
    items.sort((a, b) => a.name.localeCompare(b.name));
    
    return items;
  })();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, category, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category.name
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            isAdmin={isAdmin}
            onAddToCart={onAddToCart}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            onToggleAvailability={onToggleAvailability}
            storeOpen={storeOpen}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No items found in this category.
        </div>
      )}
    </div>
  );
};

export default MenuGrid;