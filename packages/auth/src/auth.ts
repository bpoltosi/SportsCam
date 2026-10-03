import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export interface AuthUser {
  memberId: string;
  organizationId: string;
  email: string;
  role: string;
}

const hashPassword = (password: string, salt: string) => scryptSync(password, salt, 64).toString("hex");
const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");

export class AuthService {
  constructor(private readonly db: DatabaseSync) {}

  setPassword(memberId: string, password: string) {
    if (password.length < 12) throw new Error("PASSWORD_TOO_SHORT");
    const salt = randomBytes(16).toString("hex");
    this.db.prepare("INSERT OR REPLACE INTO auth_credentials(member_id,password_hash,salt) VALUES (?,?,?)")
      .run(memberId, hashPassword(password, salt), salt);
  }

  verifyPassword(memberId: string, password: string) {
    const r = this.db.prepare("SELECT password_hash,salt FROM auth_credentials WHERE member_id=?")
      .get(memberId) as { password_hash: string; salt: string } | undefined;
    if (!r) return false;
    const expected = Buffer.from(r.password_hash, "hex");
    const actual = Buffer.from(hashPassword(password, r.salt), "hex");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  createSession(memberId: string, days = 7) {
    if (!Number.isInteger(days) || days <= 0 || days > 30) throw new Error("INVALID_SESSION_DURATION");
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
    this.db.prepare("INSERT INTO auth_sessions(token_hash,member_id,expires_at,created_at) VALUES (?,?,?,?)")
      .run(hashSessionToken(token), memberId, expiresAt, new Date().toISOString());
    return { token, expiresAt };
  }

  authenticate(token: string): AuthUser | null {
    if (!token) return null;
    const r = this.db.prepare(
      "SELECT m.id,m.organization_id,m.email,m.role,s.expires_at FROM auth_sessions s JOIN members m ON m.id=s.member_id WHERE s.token_hash=?",
    ).get(hashSessionToken(token)) as {
      id: string; organization_id: string; email: string; role: string; expires_at: string;
    } | undefined;
    if (!r || r.expires_at <= new Date().toISOString()) return null;
    return { memberId: r.id, organizationId: r.organization_id, email: r.email, role: r.role };
  }

  revokeSession(token: string): void {
    this.db.prepare("DELETE FROM auth_sessions WHERE token_hash=?").run(hashSessionToken(token));
  }

  purgeExpiredSessions(): number {
    return Number(this.db.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").run(new Date().toISOString()).changes);
  }
}
