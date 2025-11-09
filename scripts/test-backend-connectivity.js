// Test de connectivité backend
const API_BASE = 'http://localhost:4750';

async function testBackend() {
  console.log('🔍 Test de connectivité backend...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Test health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   OK: ${healthResponse.ok ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
  
  try {
    // Test 2: Endpoint public
    console.log('\n2. Test endpoint public...');
    const publicResponse = await fetch(`${API_BASE}/public/campaigns?page=1&limit=5`);
    console.log(`   Status: ${publicResponse.status}`);
    console.log(`   OK: ${publicResponse.ok ? '✅' : '❌'}`);
    
    if (publicResponse.ok) {
      const data = await publicResponse.json();
      console.log(`   Données reçues: ${data.data ? data.data.length : 0} campagnes`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
  
  try {
    // Test 3: Endpoint protégé sans token
    console.log('\n3. Test endpoint protégé sans token...');
    const protectedResponse = await fetch(`${API_BASE}/campaigns?page=1&limit=5`);
    console.log(`   Status: ${protectedResponse.status}`);
    console.log(`   OK: ${protectedResponse.ok ? '✅' : '❌'}`);
    
    if (!protectedResponse.ok) {
      const errorText = await protectedResponse.text();
      console.log(`   Message d'erreur: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
  
  console.log('\n💡 Solutions:');
  console.log('1. Démarrez le backend: npm run start:dev');
  console.log('2. Vérifiez que le port 4750 est libre');
  console.log('3. Testez avec la page /debug-auth');
}

testBackend();



