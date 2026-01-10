import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Product } from '@/components/types';

type HomePageProps = {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  filteredProducts: Product[];
  addToCart: (product: Product) => void;
};

export default function HomePage({ activeCategory, setActiveCategory, filteredProducts, addToCart }: HomePageProps) {
  return (
    <div className="space-y-12">
      <section className="relative bg-gradient-to-br from-secondary to-accent/30 rounded-3xl overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-heading font-bold mb-6 animate-fade-in">
              Сыроварня SOBKO — натуральные продукты с любовью и заботой о вашем здоровье!
            </h2>
            <p className="text-xl mb-8 text-muted-foreground animate-fade-in">
              Мы рады предложить вам широкий ассортимент свежих и вкусных продуктов, произведённых из молока нашего собственного фермерского хозяйства.
            </p>
            <Button size="lg" className="animate-scale-in" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
              Перейти к каталогу
            </Button>
          </div>
        </div>
      </section>

      <section id="catalog" className="container mx-auto px-4">
        <h3 className="text-3xl font-heading font-bold mb-8">Наши продукты</h3>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="all">Все товары</TabsTrigger>
            <TabsTrigger value="cheese">Сыры</TabsTrigger>
            <TabsTrigger value="dairy">Молочное</TabsTrigger>
            <TabsTrigger value="meat">Мясо</TabsTrigger>
            <TabsTrigger value="desserts">Десерты</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-heading font-semibold text-lg">{product.name}</h4>
                  <Badge variant="secondary">{product.weight}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  В наличии: {product.stock} шт
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{product.price} ₽</span>
                  <Button onClick={() => addToCart(product)}>
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    В корзину
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
