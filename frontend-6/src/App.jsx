import './App.css';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './Router';

/**
 * Componente principal de la aplicación
 * Envuelve toda la aplicación con el proveedor de autenticación
 * y el enrutador principal
 */
const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
