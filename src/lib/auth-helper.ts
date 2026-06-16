import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "storyverse-secret-key-12345-67890";

// Simple PBKDF2 password hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === testHash;
}

// Simple JSON Web Token (JWT) sign and verify using native crypto HMAC
export function signToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 })).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${claims}`)
    .digest("base64url");

  return `${header}.${claims}.${signature}`;
}

export function verifyToken(token: string): any {
  try {
    const [header, claims, signature] = token.split(".");
    if (!header || !claims || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${claims}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const decodedClaims = JSON.parse(Buffer.from(claims, "base64url").toString("utf-8"));
    
    // Check expiration
    if (decodedClaims.exp && decodedClaims.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedClaims;
  } catch (error) {
    return null;
  }
}
