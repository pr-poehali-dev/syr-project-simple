import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

export default function DomainSetup() {
  const [customDomain, setCustomDomain] = useState('');
  const currentUrl = window.location.hostname;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Icon name="Globe" size={24} />
            Настройка домена
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Ваш текущий адрес:</p>
            <code className="text-sm bg-white px-3 py-2 rounded border block">
              https://{currentUrl}
            </code>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Как настроить свой домен:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Купите домен (например, на reg.ru или nic.ru)</li>
                <li>В настройках домена добавьте CNAME запись:
                  <div className="bg-gray-50 p-3 rounded mt-2 font-mono text-xs">
                    <div>Имя: @ (или ваш поддомен)</div>
                    <div>Тип: CNAME</div>
                    <div>Значение: {currentUrl}</div>
                  </div>
                </li>
                <li>Нажмите кнопку "Опубликовать" в poehali.dev</li>
                <li>Выберите "Привязать свой домен"</li>
                <li>Введите ваш домен и следуйте инструкциям</li>
              </ol>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Введите желаемый домен для проверки:
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="mysite.ru"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                />
                <Button 
                  onClick={() => {
                    if (customDomain) {
                      alert(
                        `Для подключения домена ${customDomain}:\n\n` +
                        `1. Войдите в панель управления доменом\n` +
                        `2. Добавьте CNAME запись: ${currentUrl}\n` +
                        `3. Вернитесь в редактор poehali.dev\n` +
                        `4. Нажмите "Опубликовать" → "Привязать домен"\n` +
                        `5. Введите ${customDomain} и следуйте инструкциям`
                      );
                    }
                  }}
                  disabled={!customDomain}
                >
                  Проверить
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Icon name="AlertTriangle" size={16} />
              Важно:
            </p>
            <p className="text-sm text-muted-foreground">
              Настройка домена происходит через интерфейс poehali.dev в разделе "Опубликовать".
              После привязки домена SSL-сертификат будет выпущен автоматически.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => {
                const url = 'https://docs.poehali.dev/deploy/publish';
                window.open(url, '_blank');
              }}
            >
              <Icon name="ExternalLink" size={16} className="mr-2" />
              Открыть документацию
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Примеры красивых доменов:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="font-mono text-green-700">sirovarnya-sobko.ru</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="font-mono text-green-700">sobko-cheese.ru</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="font-mono text-green-700">sobko.shop</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="font-mono text-green-700">сыроварня-собко.рф</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
