import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductVariant } from '@/components/types';
import ProductCard from './ProductCard';

type HomePageProps = {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  filteredProducts: Product[];
  addToCart: (product: Product, variant?: ProductVariant) => void;
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </section>
    </div>
  );
}