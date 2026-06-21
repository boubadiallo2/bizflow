import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

async function main() {
  console.log("Suppression du schéma public...");
  try {
    await db.execute(sql`DROP SCHEMA public CASCADE;`);
    await db.execute(sql`CREATE SCHEMA public;`);
    console.log("Schéma supprimé et recréé avec succès.");
  } catch (err) {
    console.error("Erreur lors de la suppression du schéma:", err);
  }
  process.exit(0);
}

main();
