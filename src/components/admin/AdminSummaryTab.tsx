import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product } from '../types';

type Order = {
  id: number;
  items: { product: Product; quantity: number }[];
  status: 'new' | 'preparing' | 'ready' | 'completed';
};

type AdminSummaryTabProps = {
  orders: Order[];
};

export default function AdminSummaryTab({ orders }: AdminSummaryTabProps) {
  const getTotalProductNeeds = () => {
    const totals: Record<string, { name: string; quantity: number }> = {};
    
    orders.forEach(order => {
      if (order.status === 'new' || order.status === 'preparing') {
        order.items.forEach(item => {
          if (!totals[item.product.id]) {
            totals[item.product.id] = {
              name: item.product.name,
              quantity: 0
            };
          }
          totals[item.product.id].quantity += item.quantity;
        });
      }
    });

    return Object.values(totals);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-heading font-bold">Сводная таблица производства</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Общее количество товаров для приготовления по активным заказам
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead className="text-right">Количество</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getTotalProductNeeds().map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right text-lg font-bold text-primary">
                    {item.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
