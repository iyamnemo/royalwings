import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MenuItem, Category, CategoryFormData } from '../types/menu';
import { menuService } from '../services/menuService';
import MenuItemForm from '../components/MenuItemForm';
import CategoryForm from '../components/CategoryForm';
import MenuGrid from '../components/MenuGrid';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AdminPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ type: 'item' | 'category', id: string } | null>(null);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [storeOpen, setStoreOpen] = useState(true);

  const fetchData = async () => {
    try {
      const [cats, items] = await Promise.all([
        menuService.getAllCategories(),
        menuService.getAllMenuItems(),
      ]);
      setCategories(cats);
      setAllMenuItems(items);
    } catch (err) {
      setError('Failed to load data');
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
      console.error('Failed to load store status:', err);
      setStoreOpen(true);
    }
  };

  const handleToggleStore = async () => {
    try {
      const newStatus = !storeOpen;
      await setDoc(doc(db, 'storeStatus', 'settings'), { isOpen: newStatus }, { merge: true });
      setStoreOpen(newStatus);
      toast.success(`Store is now ${newStatus ? 'open' : 'closed'}!`);
    } catch (err) {
      toast.error('Failed to update store status');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStoreStatus();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      if (selectedItem) {
        await menuService.updateMenuItem(selectedItem.id, data);
        toast.success('Menu item updated successfully!');
      } else {
        await menuService.addMenuItem(data);
        toast.success('Menu item added successfully!');
      }
      setIsFormOpen(false);
      setSelectedItem(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error('Failed to save menu item');
      console.error(err);
    }
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    try {
      if (selectedCategory) {
        await menuService.updateCategory(selectedCategory.id, data);
        toast.success('Category updated successfully!');
      } else {
        await menuService.addCategory(data);
        toast.success('Category added successfully!');
      }
      setIsCategoryFormOpen(false);
      setSelectedCategory(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save category');
      console.error(err);
    }
  };

  const handleDeleteCategory = (id: string) => {
    setDeleteModal({ type: 'category', id });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteModal || deleteModal.type !== 'category') return;
    
    const categoryToDelete = categories.find(cat => cat.id === deleteModal.id);
    const itemsInCategory = allMenuItems.filter(item => item.category === categoryToDelete?.name);
    if (itemsInCategory.length > 0) {
      toast.error('Cannot delete category with existing items. Please reassign or delete items first.');
      return;
    }
    
    try {
      await menuService.deleteCategory(deleteModal.id);
      toast.success('Category deleted successfully!');
      setDeleteModal(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete category');
      console.error(err);
    }
  };

  const handleDeleteItem = (id: string) => {
    setDeleteModal({ type: 'item', id });
  };

  const confirmDeleteItem = async () => {
    if (!deleteModal || deleteModal.type !== 'item') return;
    
    try {
      await menuService.deleteMenuItem(deleteModal.id);
      toast.success('Menu item deleted successfully!');
      setDeleteModal(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error('Failed to delete menu item');
      console.error(err);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleToggleAvailability = async (id: string, available: boolean) => {
    try {
      await menuService.toggleMenuItemAvailability(id, available);
      toast.success(`Item ${available ? 'marked available' : 'marked unavailable'}!`);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error('Failed to update item availability');
      console.error(err);
    }
  };

  const handleUpdateStock = async (id: string, stockCount: number) => {
    try {
      await menuService.updateMenuItemStock(id, stockCount);
      toast.success('Stock updated successfully!');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error('Failed to update stock');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Menu Administration</h1>
            <div className="flex items-center gap-4">
              {/* Store Status Toggle */}
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-sm border-2 border-gray-200">
                <span className="font-medium text-gray-700">
                  Store: <span className={storeOpen ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {storeOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </span>
                <button
                  onClick={handleToggleStore}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    storeOpen
                      ? 'bg-gradient-to-r from-green-400 to-green-500'
                      : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      storeOpen ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setIsFormOpen(true);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:bg-indigo-700"
                >
                  Add New Item
                </button>
                <button
                  onClick={() => setShowCategoryManagement(!showCategoryManagement)}
                  className="px-4 py-2 border border-gradient-to-r from-cyan-600 to-blue-600 rounded-md shadow-sm text-sm font-medium text-cyan-600 hover:bg-indigo-50"
                >
                  {showCategoryManagement ? 'Hide' : 'Manage'} Categories
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {/* Categories Section */}
          {showCategoryManagement && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setIsCategoryFormOpen(true);
                  }}
                  className="px-4 py-2 border border-gradient-to-r from-cyan-600 to-blue-600 rounded-md shadow-sm text-sm font-medium text-cyan-600 hover:bg-indigo-50"
                >
                  + Add Category
                </button>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <li key={category.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsCategoryFormOpen(true);
                          }}
                          className="flex-1 px-3 py-2 text-xs font-semibold bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 px-3 py-2 text-xs font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Menu Items Grid */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu Items</h2>
            <MenuGrid
              isAdmin={true}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onToggleAvailability={handleToggleAvailability}
              onUpdateStock={handleUpdateStock}
              refreshTrigger={refreshTrigger}
            />
          </div>

          {/* Category Form Modal */}
          {isCategoryFormOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <CategoryForm
                  category={selectedCategory || undefined}
                  onSubmit={handleCategorySubmit}
                  onCancel={() => {
                    setIsCategoryFormOpen(false);
                    setSelectedCategory(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Menu Item Form Modal */}
          {isFormOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-screen overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </h2>
                <MenuItemForm
                  item={selectedItem || undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setSelectedItem(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Delete Item Modal */}
          {deleteModal?.type === 'item' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 animate-slideUp">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Item</h3>
                <p className="text-slate-600 mb-6">Are you sure you want to delete this menu item? This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteItem}
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:shadow-md transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Category Modal */}
          {deleteModal?.type === 'category' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 animate-slideUp">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Category</h3>
                {(() => {
                  const categoryToDelete = categories.find(cat => cat.id === deleteModal.id);
                  const itemsInCategory = allMenuItems.filter(item => item.category === categoryToDelete?.name);
                  return itemsInCategory.length > 0 ? (
                    <>
                      <p className="text-slate-600 mb-4">This category contains {itemsInCategory.length} item(s). You cannot delete it while items are assigned to this category:</p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
                        <ul className="space-y-2">
                          {itemsInCategory.map(item => (
                            <li key={item.id} className="text-sm text-red-700">• {item.name}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-sm text-slate-600 mb-6">Please reassign or delete these items first.</p>
                      <button
                        onClick={() => {
                          setDeleteModal(null);
                        }}
                        className="w-full px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-600 mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setDeleteModal(null)}
                          className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDeleteCategory}
                          className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:shadow-md transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;