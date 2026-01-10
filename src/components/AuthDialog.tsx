import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type AuthDialogProps = {
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isRegisterMode: boolean;
  setIsRegisterMode: (mode: boolean) => void;
  loginData: { login: string; password: string };
  setLoginData: (data: { login: string; password: string }) => void;
  registerData: { email: string; password: string; name: string };
  setRegisterData: (data: { email: string; password: string; name: string }) => void;
  handleLogin: () => void;
  handleRegister: () => void;
};

export default function AuthDialog({
  isAuthOpen,
  setIsAuthOpen,
  isRegisterMode,
  setIsRegisterMode,
  loginData,
  setLoginData,
  registerData,
  setRegisterData,
  handleLogin,
  handleRegister
}: AuthDialogProps) {
  return (
    <Dialog open={isAuthOpen} onOpenChange={(open) => {
      setIsAuthOpen(open);
      if (!open) setIsRegisterMode(false);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isRegisterMode ? 'Регистрация' : 'Вход в личный кабинет'}
          </DialogTitle>
        </DialogHeader>
        {isRegisterMode ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Имя</Label>
              <Input
                id="reg-name"
                placeholder="Введите ваше имя"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="example@mail.ru"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Пароль</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Введите пароль"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleRegister}>Зарегистрироваться</Button>
            <Button variant="outline" className="w-full" onClick={() => setIsRegisterMode(false)}>
              Уже есть аккаунт? Войти
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email или логин</Label>
              <Input
                id="email"
                placeholder="example@mail.ru"
                value={loginData.login}
                onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleLogin}>Войти</Button>
            <Button variant="outline" className="w-full" onClick={() => setIsRegisterMode(true)}>
              Регистрация
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
