import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-4xl font-heading font-bold mb-8">О нас</h2>
      <div className="space-y-6 text-lg leading-relaxed">
        <p>
          Мы рады предложить вам широкий ассортимент свежих и вкусных продуктов, произведённых из
          молока нашего собственного фермерского хозяйства. Каждая партия создаётся с вниманием к
          качеству и без использования искусственных добавок и консервантов — только чистая природа
          и традиционные рецепты.
        </p>
        <div>
          <h4 className="text-xl font-heading font-semibold mb-4">В нашем ассортименте вы найдёте:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🧀</span>
              <span>Разнообразные сыры — от нежных мягких до насыщенных твёрдых и выдержанных</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🥛</span>
              <span>Свежее молоко — натуральное и полезное</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🍶</span>
              <span>Творог, сметана, ацидофилин, кефир — идеальные продукты для здорового и сбалансированного питания</span>
            </li>
          </ul>
        </div>
        <div className="bg-secondary/50 rounded-2xl p-8 my-8">
          <p className="text-lg">
            Выбирая Сыроварню SOBKO, вы выбираете качество, натуральность и заботу о себе и своих близких. 
            Попробуйте наши продукты и убедитесь сами — вкус настоящего фермерского молока не сравнить ни с чем!
          </p>
        </div>
      </div>
    </div>
  );
}

export function FarmPage({ farmPhotos = [] }: { farmPhotos?: string[] }) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-4xl font-heading font-bold mb-8">О нашей ферме</h2>
      <div className="space-y-8 text-lg leading-relaxed">
        <div className="bg-secondary/30 rounded-2xl p-8">
          <h3 className="text-3xl font-heading font-bold mb-4 text-primary">От фермы — к вашему столу</h3>
          <p>
            Наша ферма — это живое сердце сыроварни SOBKO. Здесь, в экологически чистом уголке 
            Пермского края, рождается самое главное — безупречное сырье для наших продуктов.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-heading font-bold mb-6">Наши буренки — основа вкуса</h3>
          <p className="mb-6">
            Мы гордимся стадом из молочных пород, известных своим идеальным молоком:
          </p>

          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6">
              <h4 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🐄</span> Джерсейская
              </h4>
              <p>
                Дает нежнейшее молоко с высоким содержанием белка и кальция. Оно сливочное и 
                ароматное — основа для наших сыров премиум-класса.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h4 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🐄</span> Айрширская
              </h4>
              <p>
                Ее молоко сбалансированное и особенно полезное, идеально для творога, кефира и 
                классических сыров.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h4 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🐄</span> Суксунская (красная горбатовская)
              </h4>
              <p>
                Наша местная гордость! Порода, адаптированная к уральскому климату, даёт целебное, 
                богатое витаминами молоко.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-lg font-medium">
            Все наши коровы питаются отборными травами и зерном. Мы знаем каждую по имени.
          </p>
        </div>

        {farmPhotos.length > 0 && (
          <div>
            <h3 className="text-2xl font-heading font-bold mb-6 text-center">Наша ферма</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmPhotos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Ферма ${idx + 1}`}
                  className="w-full h-64 object-cover rounded-xl"
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-primary/10 rounded-2xl p-8 border-2 border-primary/20">
          <p className="text-lg">
            <strong>Мы не используем стимуляторы роста или антибиотики.</strong> Наша философия — 
            гармония с природой. Только так можно получить по-настоящему качественные, безопасные 
            и вкусные продукты от здоровых и счастливых животных.
          </p>
          <p className="mt-4 text-lg font-semibold text-primary">
            Это и есть наш секрет — любовь к земле и ответственность за тех, кого приручили.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-4xl font-heading font-bold mb-8">Доставка и оплата</h2>
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Способы получения заказа</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Icon name="Truck" size={24} className="text-primary mt-1" />
                <div>
                  <p className="font-semibold">Доставка по городу</p>
                  <p className="text-muted-foreground">
                    Минимальная сумма заказа: 2500 ₽<br />
                    Доставка осуществляется 1-2 раза в неделю
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="Package" size={24} className="text-primary mt-1" />
                <div>
                  <p className="font-semibold">Доставка по России</p>
                  <p className="text-muted-foreground">
                    Осуществляем доставку по России ТК СДЭК, ОЗОН
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="Store" size={24} className="text-primary mt-1" />
                <div>
                  <p className="font-semibold">Самовывоз</p>
                  <p className="text-muted-foreground">
                    Любая сумма заказа<br />
                    Забрать можно в часы работы магазина
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Способы оплаты</h3>
            <div className="space-y-3">
              <p className="font-medium">При доставке:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>QR-код</li>
                <li>Наличные при получении</li>
              </ul>
              <p className="font-medium mt-4">При самовывозе:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Картой</li>
                <li>QR-кодом</li>
                <li>Наличными</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <p className="font-semibold mb-2">⚠️ Важно</p>
            <p className="text-sm">
              Обращаем ваше внимание, что сумма заказа, отображаемая в корзине, является
              предварительной. Окончательная стоимость может незначительно отличаться. Мы обязательно
              свяжемся с вами, чтобы сообщить точную сумму заказа перед тем, как он отправится к вам.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ContactsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-4xl font-heading font-bold mb-8">Контакты</h2>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <Icon name="MapPin" className="text-primary" />
              Адрес магазина
            </h3>
            <p className="text-lg mb-2">
              Краснокамск, ул. Геофизиков, 6<br />
              ТЦ "Добрыня", павильонный ряд
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <Icon name="Clock" className="text-primary" />
              Режим работы
            </h3>
            <p className="text-lg">
              Пн-Пт: 10:30 - 19:00<br />
              Сб-Вс: 10:30 - 18:00
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <Icon name="Phone" className="text-primary" />
              Телефоны для связи
            </h3>
            <div className="space-y-2 text-lg">
              <p>
                <a href="tel:+79523224585" className="hover:text-primary transition-colors">
                  +7 (952) 322-45-85
                </a>{' '}
                — Ольга
              </p>
              <p>
                <a href="tel:+79026353303" className="hover:text-primary transition-colors">
                  +7 (902) 635-33-03
                </a>{' '}
                — Владимир
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Мы принимаем заказы только через сообщения сообщества. Если вам пишет менеджер с личного
              аккаунта и просит предоплату - это мошенники.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}