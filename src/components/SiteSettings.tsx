import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type SiteSettingsProps = {
  settings: {
    logo: string;
    theme: string;
    minDeliveryAmount: number;
    siteDescription: string;
    telegramBotToken: string;
    telegramChatId: string;
  };
  onSave: (settings: any) => void;
};

export default function SiteSettings({ settings, onSave }: SiteSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const themes = [
    { value: 'default', label: 'По умолчанию' },
    { value: 'winter', label: 'Зимний ❄️' },
    { value: 'spring', label: 'Весенний 🌸' },
    { value: 'summer', label: 'Летний ☀️' },
    { value: 'autumn', label: 'Осенний 🍂' },
    { value: 'holiday', label: 'Праздничный 🎉' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Внешний вид</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo">Логотип сайта</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setLocalSettings({ ...localSettings, logo: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {localSettings.logo && (
              <img src={localSettings.logo} alt="Логотип" className="w-20 h-20 object-contain rounded-md mt-2" />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Тема оформления</Label>
            <Select
              value={localSettings.theme}
              onValueChange={(value) => setLocalSettings({ ...localSettings, theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map(theme => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Настройки доставки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minDelivery">Минимальная сумма доставки (₽)</Label>
            <Input
              id="minDelivery"
              type="number"
              value={localSettings.minDeliveryAmount}
              onChange={(e) => setLocalSettings({ ...localSettings, minDeliveryAmount: Number(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Описание сайта</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Главное описание на сайте</Label>
            <Textarea
              id="description"
              rows={4}
              value={localSettings.siteDescription}
              onChange={(e) => setLocalSettings({ ...localSettings, siteDescription: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Telegram уведомления</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="botToken">Токен бота</Label>
            <Input
              id="botToken"
              value={localSettings.telegramBotToken}
              onChange={(e) => setLocalSettings({ ...localSettings, telegramBotToken: e.target.value })}
              placeholder="8530330128:AAH7zYq7jWo-TdGIZStP3AMDL5s_-Jzbkcg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chatId">Chat ID</Label>
            <Input
              id="chatId"
              value={localSettings.telegramChatId}
              onChange={(e) => setLocalSettings({ ...localSettings, telegramChatId: e.target.value })}
              placeholder="6368037525"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => onSave(localSettings)} size="lg" className="w-full">
        Сохранить настройки
      </Button>
    </div>
  );
}
