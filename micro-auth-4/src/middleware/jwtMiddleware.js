import jwt from "jsonwebtoken";

export async function jwtMiddleware(req, res, next) {
  const authHeader = req.headers["refresh-token"];
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader;

  if (!token) {
    return res.status(401).json({ error: "Malformed token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Agrego la información del usuario al request
    req.refreshToken = token; // Agrego el token al request
    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
