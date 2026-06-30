import { db } from '../server/db/index.js';
import { users } from '../server/db/schema.js';

async function run() {
  const userList = await db.select().from(users);
  console.log("Liste des utilisateurs dans la base :");
  userList.forEach(u => {
    console.log(`- ${u.email} (Tenant ID: ${u.tenantId})`);
  });
  process.exit(0);
}

run().catch(console.error);
