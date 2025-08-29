// Verificar si el token es válido
export const isTokenValid = (token) => {
  if (!token) return false;

  try {
    // Aquí puedes implementar validación JWT real
    // const decoded = jwt.decode(token);
    // return decoded.exp > Date.now() / 1000;

    // Por ahora, simulación simple
    return token.startsWith("fake-jwt-token-");
  } catch (error) {
    return false;
  }
};

// Obtener datos del usuario desde localStorage
export const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

// Limpiar datos de autenticación
export const clearAuthData = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
};
