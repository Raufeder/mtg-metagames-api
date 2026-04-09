import { jwtVerify, importJWK } from "jose";
import { type Request, type Response, type NextFunction } from "express";

const ValidateJWTMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  } else if (req.headers.authorization) {
    try {
      const { authorization } = req.headers;
      const token = authorization.split(" ")[1];
      if (!token) {
        res.status(401).send({ error: "No token provided." });
        return;
      }
      const jwk = JSON.parse(process.env.SUPABASE_JWT_PUBLIC_KEY as string);
      const publicKey = await importJWK(jwk, "ES256");
      const { payload } = await jwtVerify(token, publicKey);
      if ((payload as any).app_metadata?.role !== "admin") {
        res.status(403).send({ error: "Forbidden." });
        return;
      }
      next();
    } catch (err) {
      res.status(401).send({ error: "Invalid token." });
      return;
    }
  } else {
    res.status(401).send({ error: "No authorization header provided." });
    return;
  }
};

export default ValidateJWTMiddleware;