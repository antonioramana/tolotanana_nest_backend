const axios = require('axios');

const API_BASE = 'http://localhost:4750';

async function testContactSystem() {
  console.log('🧪 Test du système de contact...\n');

  try {
    // 1. Test d'envoi d'un message public
    console.log('1️⃣ Test d\'envoi d\'un message de contact...');
    const messageData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Message de test',
      message: 'Ceci est un message de test pour vérifier le système de contact.'
    };

    const sendResponse = await axios.post(`${API_BASE}/public/contact`, messageData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Message envoyé avec succès:', sendResponse.data);
    console.log('');

    // 2. Test de récupération des statistiques (nécessite un token admin)
    console.log('2️⃣ Test de récupération des statistiques...');
    console.log('⚠️  Nécessite un token admin - à tester manuellement');
    console.log('');

    console.log('🎉 Tests publics terminés avec succès !');
    console.log('');
    console.log('📋 Pour tester les fonctionnalités admin :');
    console.log('1. Connectez-vous en tant qu\'admin sur /admin-login');
    console.log('2. Allez sur /admin/contact');
    console.log('3. Vérifiez que le message de test apparaît');
    console.log('4. Testez les fonctionnalités de réponse et marquage');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

// Exécuter les tests
testContactSystem();
