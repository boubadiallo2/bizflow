

async function main() {
  try {
    const loginRes = await fetch('https://bizflow-psi.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@nexora.sn', password: 'Passer@12345' })
    });
    
    if (!loginRes.ok) {
      console.log('Login failed:', loginRes.status, await loginRes.text());
      return;
    }
    
    const { token } = await loginRes.json();
    console.log('Got token');
    
    const statsRes = await fetch('https://bizflow-psi.vercel.app/api/admin/dashboard-stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Stats status:', statsRes.status);
    console.log('Stats body:', await statsRes.text());
  } catch (err) {
    console.error(err);
  }
}
main();
