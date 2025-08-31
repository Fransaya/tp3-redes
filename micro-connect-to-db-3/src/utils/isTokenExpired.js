import { getSession } from "../services/token.service.js";

export const isTokenExpired = () => {
  const session = getSession();
  if (!session) return true;

  const dateNow = new Date();
  const expiresDate = session.expireIn;

  if (dateNow >= expiresDate) {
    return true;
  }

  return false;
};
