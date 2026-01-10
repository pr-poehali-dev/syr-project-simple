type Customer = {
  email: string;
  password: string;
  name: string;
};

type UseAuthHandlersProps = {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  setCurrentCustomer: (customer: Customer | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
  setShowAdminPanel: (show: boolean) => void;
  setShowCustomerAccount: (show: boolean) => void;
  setRegisterData: (data: any) => void;
  setIsRegisterMode: (mode: boolean) => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning') => void;
};

export function useAuthHandlers({
  customers,
  setCustomers,
  setCurrentCustomer,
  setIsAdmin,
  setIsAuthOpen,
  setShowAdminPanel,
  setShowCustomerAccount,
  setRegisterData,
  setIsRegisterMode,
  addNotification
}: UseAuthHandlersProps) {
  
  const handleLogin = (loginData: { login: string; password: string }) => {
    if (loginData.login === 'admmisSOBKO' && loginData.password === 'Sobko220!') {
      setIsAdmin(true);
      setIsAuthOpen(false);
      setShowAdminPanel(true);
    } else {
      const customer = customers.find(c => c.email === loginData.login && c.password === loginData.password);
      if (customer) {
        setCurrentCustomer(customer);
        sessionStorage.setItem('currentCustomer', JSON.stringify(customer));
        setIsAuthOpen(false);
        setShowCustomerAccount(true);
        sessionStorage.setItem('showCustomerAccount', 'true');
      } else {
        alert('Неверный логин или пароль');
      }
    }
  };

  const handleRegister = async (registerData: { email: string; password: string; name: string }) => {
    if (!registerData.email || !registerData.password || !registerData.name) {
      alert('Заполните все поля');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      alert('Введите корректный email адрес');
      return;
    }
    
    const exists = customers.find(c => c.email === registerData.email);
    if (exists) {
      alert('Пользователь с таким email уже существует');
      return;
    }
    
    try {
      const generateResponse = await fetch('https://functions.poehali.dev/45dfd3b7-0e4e-4c7f-bd98-9e778dd19ff3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', email: registerData.email })
      });
      
      if (!generateResponse.ok) {
        alert('Ошибка отправки кода подтверждения');
        return;
      }
      
      const { code, message } = await generateResponse.json();
      
      const userCode = window.prompt(
        `${message}\n\n` +
        `⚠️ В реальной системе код придёт на ваш email.\n` +
        `Для демонстрации код отображается здесь: ${code}\n\n` +
        `Введите код подтверждения:`
      );
      
      if (!userCode) {
        return;
      }
      
      const verifyResponse = await fetch('https://functions.poehali.dev/45dfd3b7-0e4e-4c7f-bd98-9e778dd19ff3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email: registerData.email, code: userCode })
      });
      
      const verifyResult = await verifyResponse.json();
      
      if (!verifyResult.success) {
        alert(verifyResult.error || 'Неверный код подтверждения');
        return;
      }
      
      const newCustomer: Customer = { ...registerData };
      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      setCurrentCustomer(newCustomer);
      sessionStorage.setItem('currentCustomer', JSON.stringify(newCustomer));
      setIsAuthOpen(false);
      setShowCustomerAccount(true);
      sessionStorage.setItem('showCustomerAccount', 'true');
      setRegisterData({ email: '', password: '', name: '' });
      setIsRegisterMode(false);
      addNotification('Email подтверждён! Регистрация успешна!', 'success');
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      alert('Ошибка при регистрации. Попробуйте позже.');
    }
  };

  return { handleLogin, handleRegister };
}
