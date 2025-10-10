const fetch = require('node-fetch');

async function testForgotPasswordAPI() {
  const API_BASE = 'http://localhost:4750';
  
  console.log('🧪 Test de l\'API mot de passe oublié');
  console.log('=====================================');
  
  try {
    // Test 1: Vérifier si le serveur est accessible
    console.log('\n1. Test de connectivité...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (healthResponse.ok) {
      console.log('✅ Serveur accessible');
    } else {
      console.log('❌ Serveur non accessible');
      return;
    }
    
    // Test 2: Test de l'endpoint forgot-password
    console.log('\n2. Test de l\'endpoint forgot-password...');
    const forgotPasswordResponse = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    
    console.log(`Status: ${forgotPasswordResponse.status}`);
    const responseText = await forgotPasswordResponse.text();
    console.log(`Response: ${responseText}`);
    
    if (forgotPasswordResponse.ok) {
      console.log('✅ Endpoint forgot-password fonctionne');
    } else {
      console.log('❌ Endpoint forgot-password a des problèmes');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('\n💡 Solutions possibles:');
    console.log('1. Vérifiez que le backend est démarré: npm run start:dev');
    console.log('2. Vérifiez que le port 3000 est libre');
    console.log('3. Vérifiez la configuration de la base de données');
  }
}

testForgotPasswordAPI();
