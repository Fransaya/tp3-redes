import axios from "axios";
import { configDotenv } from "dotenv";

configDotenv();

let dataAuth = null;

export function setDataAuth(data) {
  dataAuth = data;
}

export function getDataAuth() {
  return dataAuth;
}

export async function loginMicroService() {
  try {
    const response = await axios.post(
      `${process.env.URL_AUTH_MICRO}/auth/login`,
      {
        username: process.env.AUTH_USER,
        password: process.env.AUTH_PASS,
      }
    );

    console.log("data", response.data);

    const data = response.data;

    if (data.success == "success") {
      setDataAuth(data);
    }
  } catch (error) {
    return { status: false, message: "error al iniciar session" };
  }
}
