import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import dotenv from 'dotenv';
import path from 'path';

// Charge les variables d'environnement depuis le fichier .env à la racine
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Avertissement : DATABASE_URL n'est pas défini dans le fichier .env");
  console.error("Le serveur backend va démarrer, mais la connexion à la base de données échouera.");
}

// Initialise le client Neon HTTP
// On utilise une valeur par défaut factice si l'URL est manquante pour ne pas crasher immédiatement au lancement,
// l'erreur sera levée uniquement lors d'une vraie requête.
const sql = neon(connectionString || 'postgres://user:pass@localhost/db');

// Initialise Drizzle ORM avec notre schéma
export const db = drizzle(sql, { schema });
