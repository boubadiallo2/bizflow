import { db } from '../server/db/index.js';
import { tenants } from '../server/db/schema.js';
import { eq } from 'drizzle-orm';

async function fix() {
  const allTenants = await db.select().from(tenants).where(eq(tenants.subscription, 'Business'));
  for (const t of allTenants) {
    if (t.subscriptionCycle !== 'annual') {
      await db.update(tenants).set({ subscriptionCycle: 'annual' }).where(eq(tenants.id, t.id));
      console.log(`Updated tenant ${t.id} to annual cycle.`);
    }
  }
  console.log('Done fixing subscriptions.');
}

fix().catch(console.error).finally(() => process.exit(0));
