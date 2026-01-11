import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_admin: boolean;
  created_at: string;
};

const AUTH_API = 'https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100';

export default function AdminCustomersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const { toast } = useToast();

  const loadUsers = async (search?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = search 
        ? `${AUTH_API}/users?search=${encodeURIComponent(search)}`
        : `${AUTH_API}/users`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить список пользователей',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      toast({
        title: 'Ошибка',
        description: 'Ошибка подключения к серверу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = () => {
    loadUsers(searchQuery);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      password: ''
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('authToken');
      const updateData: any = {
        id: editingUser.id,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      };

      if (editForm.password) {
        updateData.password = editForm.password;
      }

      const response = await fetch(`${AUTH_API}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Данные пользователя обновлены'
        });
        setEditingUser(null);
        loadUsers(searchQuery);
      } else {
        const data = await response.json();
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить данные',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      toast({
        title: 'Ошибка',
        description: 'Ошибка подключения к серверу',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление клиентами</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Поиск по ФИО..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Icon name="Search" size={16} className="mr-2" />
              Найти
            </Button>
            <Button variant="outline" onClick={() => { setSearchQuery(''); loadUsers(); }}>
              <Icon name="X" size={16} className="mr-2" />
              Сбросить
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Загрузка...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Клиенты не найдены
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                          {user.full_name}
                          {user.is_admin && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Админ
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Icon name="Mail" size={14} className="inline mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-muted-foreground">
                            <Icon name="Phone" size={14} className="inline mr-1" />
                            {user.phone}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Регистрация: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(user)}
                      >
                        <Icon name="Edit" size={16} className="mr-2" />
                        Редактировать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование клиента</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">ФИО</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="example@mail.ru"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Номер телефона</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+7 999 123-45-67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Новый пароль (оставьте пустым, если не нужно менять)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Введите новый пароль"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateUser}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
