import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MenuItem, MenuItemFormData, Category } from '../types/menu';
import { menuService } from '../services/menuService';
import ImageUpload from './ImageUpload';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be positive')
    .typeError('Price must be a number'),
  category: yup.string().required('Category is required'),
  imageUrl: yup.string().optional().typeError('Image URL must be a string'),
  available: yup.boolean().required('Availability is required'),
  featured: yup.boolean().optional().typeError('Featured must be a boolean'),
  flavors: yup.array().optional(),
});

interface MenuItemFormProps {
  item?: MenuItem;
  onSubmit: (data: MenuItemFormData) => Promise<void>;
  onCancel: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  item,
  onSubmit,
  onCancel,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [flavors, setFlavors] = useState<string[]>(item?.flavors || []);
  const [newFlavor, setNewFlavor] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<MenuItemFormData>({
    resolver: yupResolver(schema),
    defaultValues: item || {
      available: true,
      flavors: [],
    },
  });

  const handleAddFlavor = () => {
    if (!newFlavor.trim()) return;
    setFlavors([...flavors, newFlavor.trim()]);
    setNewFlavor('');
  };

  const handleRemoveFlavor = (index: number) => {
    setFlavors(flavors.filter((_, i) => i !== index));
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await menuService.addCategory({ name: newCategoryName.trim() });
      setValue('category', newCategoryName.trim());
      setNewCategoryName('');
      const cats = await menuService.getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await menuService.getAllCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleFormSubmit = async (data: MenuItemFormData) => {
    setLoading(true);
    try {
      let dataToSubmit: any = { ...data };
      if (flavors.length > 0) {
        dataToSubmit.flavors = flavors;
      } else {
        delete dataToSubmit.flavors;
      }
      
      console.log('Submitting form data:', dataToSubmit);
      await onSubmit(dataToSubmit);
      console.log('Form submitted successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving menu item: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          step="0.01"
          {...register('price')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <div className="mt-1 flex space-x-2">
          <div className="flex-1">
            <select
              {...register('category')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              <option value="__new__">+ Add new category</option>
            </select>
          </div>
          {watch('category') === '__new__' && (
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                Add
              </button>
            </div>
          )}
        </div>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Flavor Options (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-3">Add flavor options for this item. Leave empty if not applicable.</p>
        
        {/* Flavor Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newFlavor}
            onChange={(e) => setNewFlavor(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFlavor();
              }
            }}
            placeholder="e.g., Spicy, Mild, Hot"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddFlavor}
            disabled={!newFlavor.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            Add Flavor
          </button>
        </div>

        {/* Flavor List */}
        {flavors.length > 0 && (
          <div className="space-y-2">
            {flavors.map((flavor, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-indigo-50 p-3 rounded-md border border-indigo-200"
              >
                <span className="text-sm text-gray-700">{flavor}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFlavor(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {flavors.length === 0 && (
          <p className="text-sm text-gray-500 italic">No flavors added yet</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Menu Item Image
        </label>
        <ImageUpload
          currentImageUrl={item?.imageUrl}
          onImageUploaded={(url) => {
            setValue('imageUrl', url);
          }}
          className="mb-4"
        />
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('available')}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label className="ml-2 block text-sm text-gray-700">Available</label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('featured')}
          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
        />
        <label className="ml-2 block text-sm text-gray-700">Featured on Landing Page</label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;