import { db } from '../server/db/index.js';
import { users, tenants } from '../server/db/schema.js';
import { eq } from 'drizzle-orm';

async function run() {
  const userList = await db.select().from(users);
  const targetUser = userList.find(u => u.email.includes('teststarted'));
  
  if (targetUser) {
    console.log(`Utilisateur trouvé : ${targetUser.email} (Tenant ID: ${targetUser.tenantId})`);
    await db.delete(users).where(eq(users.id, targetUser.id));
    if (targetUser.tenantId) {
       await db.delete(tenants).where(eq(tenants.id, targetUser.tenantId));
    }
    console.log('✅ Utilisateur et locataire (tenant) associés supprimés avec succès.');
  } else {
    console.log('⚠️ Aucun utilisateur contenant "teststarted" n\'a été trouvé.');
  }
  process.exit(0);
}

run().catch(console.error);
