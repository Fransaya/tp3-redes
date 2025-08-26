import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateJWT = (payload, expiresIn) => {
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: expiresIn };

  if (!secret) {
    throw new Error("JWT secret no esta definido en las variables de entorno");
  }

  return jwt.sign(payload, secret, options);
};
