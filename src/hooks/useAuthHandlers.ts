const AUTH_API = 'https://functions.poehali.dev/e8fbfc39-3ec6-4e53-b8c1-ba6b9c81e100';

type User = {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_admin: boolean;
};

type UseAuthHandlersProps = {
  setCurrentCustomer: (customer: any) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
  setShowAdminPanel: (show: boolean) => void;
  setShowCustomerAccount: (show: boolean) => void;
  setRegisterData: (data: any) => void;
  setIsRegisterMode: (mode: boolean) => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning') => void;
};

export function useAuthHandlers({
  setCurrentCustomer,
  setIsAdmin,
  setIsAuthOpen,
  setShowAdminPanel,
  setShowCustomerAccount,
  setRegisterData,
  setIsRegisterMode,
  addNotification
}: UseAuthHandlersProps) {
  
  const handleLogin = async (loginData: { login: string; password: string }) => {
    try {
      const response = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        addNotification(data.error || 'Ошибка входа', 'warning');
        return;
      }
      
      const { user, token } = data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      setCurrentCustomer(user);
      setIsAuthOpen(false);
      
      if (user.is_admin) {
        setIsAdmin(true);
        setShowAdminPanel(true);
      } else {
        setShowCustomerAccount(true);
      }
      
      addNotification('Успешный вход!', 'success');
    } catch (error) {
      console.error('Ошибка входа:', error);
      addNotification('Ошибка при входе. Попробуйте позже.', 'warning');
    }
  };

  const handleRegister = async (registerData: { email: string; password: string; name: string; phone?: string }) => {
    if (!registerData.email || !registerData.password || !registerData.name) {
      addNotification('Заполните все поля', 'warning');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      addNotification('Введите корректный email', 'warning');
      return;
    }
    
    try {
      const response = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        addNotification(data.error || 'Ошибка регистрации', 'warning');
        return;
      }
      
      const { user, token } = data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      setCurrentCustomer(user);
      setIsAuthOpen(false);
      setShowCustomerAccount(true);
      setRegisterData({ email: '', password: '', name: '', phone: '' });
      setIsRegisterMode(false);
      
      addNotification('Регистрация успешна!', 'success');
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      addNotification('Ошибка при регистрации. Попробуйте позже.', 'warning');
    }
  };

  return { handleLogin, handleRegister };
}