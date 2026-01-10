import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { ProductVariant } from './types';

type ProductVariantsManagerProps = {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
};

export default function ProductVariantsManager({ variants, onChange }: ProductVariantsManagerProps) {
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    name: '',
    price: 0,
    weight: ''
  });

  const addVariant = () => {
    if (newVariant.name && newVariant.price > 0 && newVariant.weight) {
      onChange([...variants, newVariant]);
      setNewVariant({ name: '', price: 0, weight: '' });
    }
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label>Варианты товара (вкусы, размеры)</Label>
      <div className="space-y-2">
        {variants.map((variant, idx) => (
          <Card key={idx}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{variant.name}</p>
                <p className="text-sm text-muted-foreground">
                  {variant.price} ₽ • {variant.weight}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(idx)}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <p className="text-sm font-medium">Добавить вариант</p>
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="Название (Малина)"
            value={newVariant.name}
            onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Цена (₽)"
            value={newVariant.price || ''}
            onChange={(e) => setNewVariant({ ...newVariant, price: Number(e.target.value) })}
          />
          <Input
            placeholder="Вес (300г)"
            value={newVariant.weight}
            onChange={(e) => setNewVariant({ ...newVariant, weight: e.target.value })}
          />
        </div>
        <Button onClick={addVariant} size="sm" className="w-full">
          <Icon name="Plus" size={14} className="mr-2" />
          Добавить вариант
        </Button>
      </div>
    </div>
  );
}
