const axios = require('axios');

const API_BASE_URL = 'http://localhost:4750';

async function testAPI() {
  console.log('🚀 Test de l\'API Backend TOLOTANANA');
  console.log('=====================================\n');

  try {
    // Test 1: Vérifier que le serveur est en cours d'exécution
    console.log('1. Test de connectivité...');
    const healthResponse = await axios.get(`${API_BASE_URL}/campaigns`);
    console.log('✅ Serveur accessible:', healthResponse.status);
  } catch (error) {
    console.log('❌ Serveur inaccessible:', error.message);
    console.log('💡 Assurez-vous que le backend est démarré avec: npm run start:dev');
    return;
  }

  try {
    // Test 2: Test des campagnes
    console.log('\n2. Test des campagnes...');
    const campaignsResponse = await axios.get(`${API_BASE_URL}/campaigns`);
    console.log('✅ Campagnes récupérées:', campaignsResponse.data.data.length);
  } catch (error) {
    console.log('❌ Erreur campagnes:', error.response?.data?.message || error.message);
  }

  try {
    // Test 3: Test des catégories
    console.log('\n3. Test des catégories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    console.log('✅ Catégories récupérées:', categoriesResponse.data.data.length);
  } catch (error) {
    console.log('❌ Erreur catégories:', error.response?.data?.message || error.message);
  }

  try {
    // Test 4: Test des statistiques
    console.log('\n4. Test des statistiques...');
    const statsResponse = await axios.get(`${API_BASE_URL}/statistics/dashboard`);
    console.log('✅ Statistiques récupérées:', statsResponse.data);
  } catch (error) {
    console.log('❌ Erreur statistiques:', error.response?.data?.message || error.message);
  }

  try {
    // Test 5: Test d'inscription
    console.log('\n5. Test d\'inscription...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '+261123456789'
    };
    
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
    console.log('✅ Inscription réussie:', registerResponse.data.user.email);
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️  Utilisateur déjà existant (normal)');
    } else {
      console.log('❌ Erreur inscription:', error.response?.data?.message || error.message);
    }
  }

  try {
    // Test 6: Test de connexion
    console.log('\n6. Test de connexion...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    console.log('✅ Connexion réussie:', loginResponse.data.user.email);
    
    // Test 7: Test avec token d'authentification
    console.log('\n7. Test avec authentification...');
    const token = loginResponse.data.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };
    
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, { headers: authHeaders });
    console.log('✅ Profil récupéré:', profileResponse.data.email);
    
  } catch (error) {
    console.log('❌ Erreur connexion:', error.response?.data?.message || error.message);
  }

  console.log('\n🎉 Tests terminés !');
  console.log('💡 Si tous les tests passent, l\'API est prête pour l\'intégration frontend.');
}

testAPI().catch(console.error);
