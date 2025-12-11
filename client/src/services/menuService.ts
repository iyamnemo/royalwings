import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MenuItem, MenuItemFormData, Category, CategoryFormData } from '../types/menu';

const MENU_ITEMS_COLLECTION = 'menuItems';
const CATEGORIES_COLLECTION = 'categories';

export const menuService = {
  // Menu Items
  async getAllMenuItems(): Promise<MenuItem[]> {
    const querySnapshot = await getDocs(collection(db, MENU_ITEMS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MenuItem[];
  },

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    const q = query(
      collection(db, MENU_ITEMS_COLLECTION),
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MenuItem[];
  },

  async addMenuItem(item: MenuItemFormData): Promise<string> {
    try {
      console.log('Adding menu item:', item);
      const docRef = await addDoc(collection(db, MENU_ITEMS_COLLECTION), item);
      console.log('Menu item added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  },

  async updateMenuItem(id: string, item: Partial<MenuItemFormData>): Promise<void> {
    try {
      console.log('Updating menu item:', id, item);
      await updateDoc(doc(db, MENU_ITEMS_COLLECTION, id), item);
      console.log('Menu item updated successfully');
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  async deleteMenuItem(id: string): Promise<void> {
    try {
      console.log('Deleting menu item:', id);
      await deleteDoc(doc(db, MENU_ITEMS_COLLECTION, id));
      console.log('Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },

  async toggleMenuItemAvailability(id: string, available: boolean): Promise<void> {
    try {
      console.log('Toggling availability for menu item:', id, 'to', available);
      await updateDoc(doc(db, MENU_ITEMS_COLLECTION, id), { available });
      console.log('Menu item availability updated successfully');
    } catch (error) {
      console.error('Error updating menu item availability:', error);
      throw error;
    }
  },

  // Categories
  async getAllCategories(): Promise<Category[]> {
    try {
      console.log('Fetching categories...');
      const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      console.log('Categories fetched:', categories);
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async addCategory(category: CategoryFormData): Promise<string> {
    try {
      console.log('Adding category:', category);
      const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), category);
      console.log('Category added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, category: Partial<CategoryFormData>): Promise<void> {
    await updateDoc(doc(db, CATEGORIES_COLLECTION, id), category);
  },

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
  }
};