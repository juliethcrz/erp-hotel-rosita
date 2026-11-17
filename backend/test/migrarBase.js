import { execSync } from 'node:child_process';

// Aplica las migraciones en la base de pruebas de .env.test. Se corre una vez
// (y de nuevo cuando haya migraciones nuevas) con: npm run test:preparar
const nombreBase = new URL(process.env.DATABASE_URL).pathname.slice(1);
if (!nombreBase.endsWith('_test')) {
  throw new Error(`Solo se migra una base *_test (se recibió "${nombreBase}")`);
}
execSync('npx prisma migrate deploy', { env: process.env, stdio: 'inherit' });
