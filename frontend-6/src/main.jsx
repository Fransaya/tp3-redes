/**
 * Punto de entrada principal de la aplicación React
 * Configura el renderizado de la aplicación en el elemento con id 'root'
 */

import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import './index.css';
import App from './App';

// Elemento raíz donde se montará la aplicación
const container = document.getElementById('root');

// Verificar si el elemento raíz existe
if (!container) {
  throw new Error("No se encontró el elemento con id 'root' en el DOM");
}

// Crear la raíz de React
const root = createRoot(container);

// Renderizar la aplicación
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Opcional: Manejar errores no capturados
window.addEventListener('error', (error) => {
  console.error('Error no capturado:', error);
  // Aquí podrías enviar el error a un servicio de monitoreo
});
