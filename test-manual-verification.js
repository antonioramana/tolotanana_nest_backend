const fetch = require('node-fetch');

async function testManualVerification() {
  try {
    console.log('🧪 Test de la vérification manuelle...');

    // URL de l'API (assurez-vous que le backend est démarré)
    const baseUrl = 'http://localhost:4750';
    
    // D'abord, vérifier que le backend est accessible
    try {
      const healthResponse = await fetch(`${baseUrl}/health`);
      if (healthResponse.ok) {
        console.log('✅ Backend accessible');
      } else {
        console.log('❌ Backend non accessible');
        return;
      }
    } catch (error) {
      console.log('❌ Backend non accessible:', error.message);
      console.log('💡 Assurez-vous que le backend est démarré avec: npm run start:dev');
      return;
    }

    // Test de la vérification manuelle
    console.log('🔧 Déclenchement de la vérification manuelle...');
    
    const verificationResponse = await fetch(`${baseUrl}/campaigns/verification/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: En production, vous devriez inclure un token d'authentification admin
        // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
      },
    });

    if (verificationResponse.ok) {
      const result = await verificationResponse.json();
      console.log('✅ Vérification manuelle réussie:', result);
    } else {
      const error = await verificationResponse.text();
      console.log('❌ Erreur lors de la vérification:', error);
    }

    // Vérifier les statistiques
    console.log('📊 Récupération des statistiques...');
    
    const statsResponse = await fetch(`${baseUrl}/campaigns/verification/stats`, {
      headers: {
        'Content-Type': 'application/json',
        // Note: En production, vous devriez inclure un token d'authentification admin
        // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
      },
    });

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('📊 Statistiques des campagnes:', stats);
    } else {
      const error = await statsResponse.text();
      console.log('❌ Erreur lors de la récupération des stats:', error);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testManualVerification();

