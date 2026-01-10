import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Product } from '../types';

type AdminProductsTabProps = {
  products: Product[];
  onAddClick: () => void;
  onEditClick: (product: Product) => void;
  onDeleteClick: (id: number) => void;
};

export default function AdminProductsTab({ products, onAddClick, onEditClick, onDeleteClick }: AdminProductsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-bold">Управление товарами</h2>
        <Button onClick={onAddClick}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить товар
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
              <h3 className="font-semibold mb-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {product.price} ₽ • {product.weight} • В наличии: {product.stock}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditClick(product)}
                  className="flex-1"
                >
                  <Icon name="Edit" size={14} className="mr-1" />
                  Изменить
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteClick(product.id)}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
