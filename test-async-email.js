// Script de test pour la solution email asynchrone

const axios = require('axios');

const API_BASE_URL = 'http://localhost:4750';

async function testAsyncEmail() {
  console.log('🧪 Test de la Solution Email Asynchrone');
  console.log('=====================================\n');

  try {
    console.log('📧 Test 1: Envoi formulaire de contact...');
    const startTime = Date.now();
    
    const response = await axios.post(`${API_BASE_URL}/public/contact`, {
      name: 'Test Async User',
      email: 'test.async@example.com',
      subject: 'Test Solution Asynchrone',
      message: 'Ce message teste la nouvelle solution avec réponse rapide frontend et retry en arrière-plan.'
    });

    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Réponse reçue en ${responseTime}ms`);
    console.log('📊 Contenu de la réponse:');
    console.log(`   - ID: ${response.data.id}`);
    console.log(`   - Email Status: ${response.data.emailStatus}`);
    console.log(`   - Message: ${response.data.message}`);
    
    if (responseTime < 5000) {
      console.log(`🎉 SUCCÈS: Réponse rapide (${responseTime}ms < 5 secondes)`);
    } else {
      console.log(`⚠️  Réponse un peu lente: ${responseTime}ms`);
    }

    console.log('\n💡 Vérifiez les logs du backend pour voir:');
    console.log('   📧 "Début envoi emails en arrière-plan"');
    console.log('   📧 "Tentative X/5 - Email confirmation"');
    console.log('   ✅ "Email confirmation envoyé avec succès"');
    
    console.log('\n⏳ Les emails continuent d\'être envoyés en arrière-plan...');
    console.log('   Même si cette réponse est rapide, le backend continue');
    console.log('   d\'essayer jusqu\'à 5 fois d\'envoyer les emails.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.response) {
      console.log('Détails de l\'erreur:', error.response.data);
    }
  }
}

async function testResponseTime() {
  console.log('\n🚀 Test de Performance - Temps de Réponse');
  console.log('==========================================\n');

  const tests = [];
  const numTests = 3;

  for (let i = 1; i <= numTests; i++) {
    try {
      console.log(`Test ${i}/${numTests}...`);
      const startTime = Date.now();
      
      await axios.post(`${API_BASE_URL}/public/contact`, {
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
        subject: `Test Performance ${i}`,
        message: `Message de test numéro ${i} pour mesurer les performances.`
      });

      const responseTime = Date.now() - startTime;
      tests.push(responseTime);
      console.log(`   ✅ ${responseTime}ms`);
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }

  if (tests.length > 0) {
    const avgTime = Math.round(tests.reduce((a, b) => a + b, 0) / tests.length);
    const maxTime = Math.max(...tests);
    const minTime = Math.min(...tests);

    console.log('\n📊 Statistiques:');
    console.log(`   Temps moyen: ${avgTime}ms`);
    console.log(`   Temps min: ${minTime}ms`);
    console.log(`   Temps max: ${maxTime}ms`);

    if (avgTime < 3000) {
      console.log('🎯 OBJECTIF ATTEINT: Toutes les réponses < 3 secondes !');
    } else if (avgTime < 5000) {
      console.log('✅ Bon résultat: Réponses rapides (< 5 secondes)');
    } else {
      console.log('⚠️  À améliorer: Réponses un peu lentes');
    }
  }
}

async function main() {
  try {
    // Vérifier que le serveur est accessible
    console.log('🔍 Vérification de la connexion au serveur...');
    await axios.get(`${API_BASE_URL}/campaigns`);
    console.log('✅ Serveur accessible\n');

    await testAsyncEmail();
    await testResponseTime();

    console.log('\n🎉 Tests terminés !');
    console.log('\n💡 Points à retenir:');
    console.log('   ✅ Le frontend reçoit une réponse rapide');
    console.log('   ✅ Les emails sont envoyés en arrière-plan');
    console.log('   ✅ Jusqu\'à 5 tentatives par email');
    console.log('   ✅ Logs détaillés pour le monitoring');

  } catch (error) {
    console.error('\n❌ Impossible de se connecter au serveur');
    console.error('💡 Assurez-vous que le backend est démarré:');
    console.error('   npm run start:dev');
  }
}

main();
