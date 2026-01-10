import { Product } from '@/components/types';

type UseProductHandlersProps = {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning') => void;
};

export function useProductHandlers({ products, setProducts, addNotification }: UseProductHandlersProps) {
  
  const handleProductAdd = async (product: Omit<Product, 'id'>) => {
    try {
      const response = await fetch('https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (response.ok) {
        const newProduct = await response.json();
        return newProduct;
      }
    } catch (error) {
      console.error('Ошибка добавления товара:', error);
      alert('Ошибка добавления товара');
    }
  };

  const handleProductUpdate = async (id: number, updates: any, products: any[]) => {
    try {
      const updatedProduct = products.find((p: any) => p.id === id);
      if (!updatedProduct) return;
      
      const response = await fetch('https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedProduct, ...updates })
      });
      if (response.ok) {
        return { ...updatedProduct, ...updates };
      }
    } catch (error) {
      console.error('Ошибка обновления товара:', error);
    }
    return null;
  };

  const handleProductDelete = async (id: number, addNotification: any) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100?id=${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        addNotification('Товар удалён', 'info');
        return true;
      }
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
    }
    return false;
  };

  return { handleProductAdd, handleProductUpdate, handleProductDelete };
}
