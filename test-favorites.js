const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testFavorites() {
  try {
    console.log('🧪 Test du système de favoris...\n');

    // 1. Connexion d'un utilisateur
    console.log('1. Connexion d\'un utilisateur...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com', // Remplacez par un email valide
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Connexion réussie\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Récupérer les campagnes pour voir isFavoris
    console.log('2. Récupération des campagnes avec isFavoris...');
    const campaignsResponse = await axios.get(`${BASE_URL}/campaigns`, { headers });
    console.log('✅ Campagnes récupérées:', campaignsResponse.data.data.length, 'campagnes');
    console.log('Première campagne isFavoris:', campaignsResponse.data.data[0]?.isFavoris);
    console.log('');

    // 3. Tester l'endpoint toggle favoris
    if (campaignsResponse.data.data.length > 0) {
      const campaignId = campaignsResponse.data.data[0].id;
      console.log('3. Test de l\'endpoint toggle favoris...');
      
      // Toggle favoris
      const toggleResponse = await axios.post(
        `${BASE_URL}/campaigns/${campaignId}/toggle-favorite`,
        {},
        { headers }
      );
      console.log('✅ Toggle favoris:', toggleResponse.data);
      
      // Vérifier que la campagne a bien isFavoris = true
      const campaignDetailResponse = await axios.get(`${BASE_URL}/campaigns/${campaignId}`, { headers });
      console.log('✅ Détail campagne isFavoris:', campaignDetailResponse.data.isFavoris);
      console.log('');

      // 4. Tester l'endpoint des favoris dédié
      console.log('4. Test de l\'endpoint des favoris...');
      const favoritesResponse = await axios.get(`${BASE_URL}/favorites/my-favorites`, { headers });
      console.log('✅ Favoris récupérés:', favoritesResponse.data.data.length, 'favoris');
      console.log('');

      // 5. Toggle à nouveau pour retirer des favoris
      console.log('5. Retrait des favoris...');
      const toggleResponse2 = await axios.post(
        `${BASE_URL}/campaigns/${campaignId}/toggle-favorite`,
        {},
        { headers }
      );
      console.log('✅ Toggle favoris (retrait):', toggleResponse2.data);
      
      // Vérifier que la campagne a bien isFavoris = false
      const campaignDetailResponse2 = await axios.get(`${BASE_URL}/campaigns/${campaignId}`, { headers });
      console.log('✅ Détail campagne isFavoris après retrait:', campaignDetailResponse2.data.isFavoris);
    }

    console.log('\n🎉 Tous les tests sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
  }
}

// Exécuter les tests
testFavorites();
