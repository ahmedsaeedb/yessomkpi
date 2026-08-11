import bcrypt from 'bcrypt';
import { db } from '../db/db.js';
import type { UserRow } from '../types/index.js';

const [username, newPassword] = process.argv.slice(2);

if (!username || !newPassword) {
  console.log('الاستخدام: npm run reset-password -- <اسم المستخدم> <كلمة المرور الجديدة>');
  console.log('مثال: npm run reset-password -- admin NewPass@12345');
  process.exit(1);
}

const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined;

if (!user) {
  const all = db.prepare('SELECT username, role FROM users').all() as Array<{ username: string; role: string }>;
  console.log(`✘ ما فيه مستخدم باسم "${username}".`);
  console.log('الحسابات الموجودة حاليًا:');
  all.forEach((u) => console.log(`  - ${u.username} (${u.role})`));
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(newPassword, 10);
db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(passwordHash, user.id);

console.log(`✔ تم تحديث كلمة المرور للمستخدم "${username}" بنجاح.`);
