import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import MenuGrid from '../components/MenuGrid';
import MenuCarousel from '../components/MenuCarousel';
import CartPopup from '../components/CartPopup';
import { MenuItem } from '../types/menu';
import { menuService } from '../services/menuService';

const MenuPage: React.FC = () => {
  const { addToCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await menuService.getAllMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    const selectedFlavor = (item as any)._selectedFlavor;
    addToCart(item, 1, '', selectedFlavor);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <CartPopup />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Menu</h1>
            <p className="text-gray-600 text-lg">Discover our delicious selection of premium dishes</p>
          </div>

          {/* Carousel */}
          {!loading && menuItems.length > 0 && (
            <MenuCarousel items={menuItems} />
          )}

          {/* Menu Grid */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Items</h2>
            <MenuGrid onAddToCart={handleAddToCart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;