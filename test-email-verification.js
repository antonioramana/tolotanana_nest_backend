const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

async function testEmailVerification() {
  try {
    console.log('🧪 Test de l\'envoi d\'email de vérification pour changement d\'email');
    console.log('=' .repeat(60));

    // 1. Se connecter pour obtenir un token
    console.log('1. Connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Connexion réussie');

    // 2. Demander un changement d'email
    console.log('\n2. Demande de changement d\'email...');
    const changeEmailResponse = await axios.post(
      `${API_BASE_URL}/auth/change-email-request`,
      {
        newEmail: 'nouveau@example.com',
        currentPassword: TEST_PASSWORD
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Demande de changement d\'email envoyée');
    console.log('📧 Réponse:', changeEmailResponse.data);

    // 3. Tester le renvoi de code
    console.log('\n3. Test de renvoi de code...');
    const resendResponse = await axios.post(
      `${API_BASE_URL}/auth/change-email-resend`,
      {
        newEmail: 'nouveau@example.com'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Code renvoyé');
    console.log('📧 Réponse:', resendResponse.data);

    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n📝 Vérifiez les logs du serveur pour voir si les emails ont été envoyés.');
    console.log('📧 En mode développement, le code de vérification est affiché dans la réponse.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Conseil: Vérifiez que l\'utilisateur de test existe et que le mot de passe est correct.');
    } else if (error.response?.status === 500) {
      console.log('\n💡 Conseil: Vérifiez la configuration email dans le backend.');
    }
  }
}

// Exécuter le test
testEmailVerification();
