export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stockCount: number;
  featured?: boolean;
  flavors?: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export type MenuItemFormData = Omit<MenuItem, 'id'>;
export type CategoryFormData = Omit<Category, 'id'>;