import axios from "axios";
import { configDotenv } from "dotenv";
configDotenv();

class DataService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.DB_MICRO_URL,
      timeout: 10000,
    });
  }

  async sendData(data, token) {
    try {
      const response = await this.api.post("/store/capture", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
      throw new Error(
        "Error sending data to DB microservice: " + error.message
      );
    }
  }
}

export default DataService;
