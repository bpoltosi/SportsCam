import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export interface AuthUser { memberId:string; organizationId:string; email:string; role:string; }
const hashPassword=(password:string,salt:string)=>scryptSync(password,salt,64).toString("hex");
export class AuthService {
  constructor(private readonly db: DatabaseSync) {
    db.exec(`CREATE TABLE IF NOT EXISTS auth_credentials (member_id TEXT PRIMARY KEY, password_hash TEXT NOT NULL, salt TEXT NOT NULL, FOREIGN KEY(member_id) REFERENCES members(id));
CREATE TABLE IF NOT EXISTS auth_sessions (token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(member_id) REFERENCES members(id));
`);
  }
  setPassword(memberId:string,password:string){if(password.length<12) throw new Error("PASSWORD_TOO_SHORT"); const salt=randomBytes(16).toString("hex"); this.db.prepare("INSERT OR REPLACE INTO auth_credentials VALUES (?,?,?)").run(memberId,hashPassword(password,salt),salt);}
  verifyPassword(memberId:string,password:string){const r=this.db.prepare("SELECT password_hash,salt FROM auth_credentials WHERE member_id=?").get(memberId) as {password_hash:string,salt:string}|undefined; if(!r)return false; const a=Buffer.from(r.password_hash,"hex"),b=Buffer.from(hashPassword(password,r.salt),"hex"); return a.length===b.length&&timingSafeEqual(a,b);}
  createSession(memberId:string,days=7){const token=randomBytes(32).toString("base64url"),expires=new Date(Date.now()+days*86400000).toISOString(); const hash=scryptSync(token,"sportscam-session",32).toString("hex"); this.db.prepare("INSERT INTO auth_sessions VALUES (?,?,?,?)").run(hash,memberId,expires,new Date().toISOString()); return {token,expiresAt:expires};}
  authenticate(token:string):AuthUser|null{const hash=scryptSync(token,"sportscam-session",32).toString("hex"); const r=this.db.prepare("SELECT m.id,m.organization_id,m.email,m.role,s.expires_at FROM auth_sessions s JOIN members m ON m.id=s.member_id WHERE s.token_hash=?").get(hash) as {id:string,organization_id:string,email:string,role:string,expires_at:string}|undefined; if(!r||r.expires_at<=new Date().toISOString())return null; return {memberId:r.id,organizationId:r.organization_id,email:r.email,role:r.role};}
}
