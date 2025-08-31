import axios from "axios";

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.AUTH_MICRO_URL,
      timeout: 10000,
    });
  }

  async login(credentials) {
    try {
      const response = await this.api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      console.error("❌ Error en el login:", error.message);
      throw new Error("Error en el login");
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const response = await this.api.post("/refresh-token", { refreshToken });
      return response.data;
    } catch (error) {
      throw new Error("Error al renovar token");
    }
  }
}

export default AuthService;
