import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Product, ProductVariant } from '@/components/types';

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
};

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0) {
      setIsDialogOpen(true);
    } else {
      onAddToCart(product);
    }
  };

  const handleConfirmVariant = () => {
    onAddToCart(product, selectedVariant);
    setIsDialogOpen(false);
  };

  const displayPrice = product.variants && product.variants.length > 0 
    ? `от ${Math.min(...product.variants.map(v => v.price))} ₽`
    : `${product.price} ₽`;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
        <div className="aspect-square relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            <h4 className="font-heading font-semibold text-lg mb-1">{product.name}</h4>
            <Badge variant="secondary" className="text-xs">{product.weight}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            В наличии: {product.stock} шт
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">{displayPrice}</span>
            <Button onClick={handleAddToCart} size="sm">
              <Icon name="ShoppingCart" size={14} className="mr-1" />
              В корзину
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">{product.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Выберите вариант:</label>
              <Select
                value={selectedVariant?.name}
                onValueChange={(value) => {
                  const variant = product.variants?.find(v => v.name === value);
                  setSelectedVariant(variant);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите вариант" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants?.map((variant, idx) => (
                    <SelectItem key={idx} value={variant.name}>
                      {variant.name} — {variant.price} ₽ ({variant.weight})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedVariant && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedVariant.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedVariant.weight}</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">{selectedVariant.price} ₽</p>
                </div>
              </div>
            )}
            <Button 
              onClick={handleConfirmVariant} 
              className="w-full" 
              size="lg"
              disabled={!selectedVariant}
            >
              <Icon name="ShoppingCart" size={16} className="mr-2" />
              Добавить в корзину
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
