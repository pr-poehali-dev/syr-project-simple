export type Product = {
  id: number;
  name: string;
  price: number;
  weight: string;
  image: string;
  category: string;
  stock: number;
};

export type CartItem = Product & { quantity: number };

export const products: Product[] = [
  {
    id: 1,
    name: 'Сыр сливочный',
    price: 450,
    weight: '300г',
    image: 'https://cdn.poehali.dev/projects/6f77beb1-2d46-492f-bf0f-c1c433a807c6/files/67d26890-f3fe-41d7-acc6-4aa0b7b4ca29.jpg',
    category: 'cheese',
    stock: 15
  },
  {
    id: 2,
    name: 'Творог деревенский',
    price: 280,
    weight: '500г',
    image: 'https://cdn.poehali.dev/projects/6f77beb1-2d46-492f-bf0f-c1c433a807c6/files/c5fdc7b4-f346-4879-9d35-59dc679dae4b.jpg',
    category: 'dairy',
    stock: 25
  },
  {
    id: 3,
    name: 'Молоко фермерское',
    price: 120,
    weight: '1л',
    image: 'https://cdn.poehali.dev/projects/6f77beb1-2d46-492f-bf0f-c1c433a807c6/files/681659b5-15bd-4ac8-be2f-c74bf064cd5d.jpg',
    category: 'dairy',
    stock: 40
  },
  {
    id: 4,
    name: 'Сыр с голубой плесенью',
    price: 780,
    weight: '250г',
    image: 'https://cdn.poehali.dev/projects/6f77beb1-2d46-492f-bf0f-c1c433a807c6/files/67d26890-f3fe-41d7-acc6-4aa0b7b4ca29.jpg',
    category: 'cheese',
    stock: 8
  },
  {
    id: 5,
    name: 'Сметана',
    price: 180,
    weight: '400г',
    image: 'https://cdn.poehali.dev/projects/6f77beb1-2d46-492f-bf0f-c1c433a807c6/files/c5fdc7b4-f346-4879-9d35-59dc679dae4b.jpg',
    category: 'dairy',
    stock: 30
  },
  {
    id: 6,
    name: 'Сыр Пармезан',
    price: 650,
    weight: '300г',
    image: 'https://cdn.poehali.dev/projects/6f77beb1-2d46-492f-bf0f-c1c433a807c6/files/67d26890-f3fe-41d7-acc6-4aa0b7b4ca29.jpg',
    category: 'cheese',
    stock: 12
  }
];