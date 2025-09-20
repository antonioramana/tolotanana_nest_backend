const fetch = require('node-fetch');

const API_BASE = 'http://localhost:4750';

async function testDeleteUpdate() {
  console.log('🧪 Test de suppression d\'update...');
  
  try {
    // D'abord, récupérer les updates d'une campagne
    console.log('📋 Récupération des updates...');
    const updatesResponse = await fetch(`${API_BASE}/campaigns/seed-camp-b/updates`);
    
    if (!updatesResponse.ok) {
      console.error('❌ Erreur lors de la récupération des updates:', updatesResponse.status);
      return;
    }
    
    const updatesData = await updatesResponse.json();
    console.log('✅ Updates récupérés:', updatesData);
    
    if (!updatesData.data || updatesData.data.length === 0) {
      console.log('ℹ️  Aucun update à supprimer');
      return;
    }
    
    const updateToDelete = updatesData.data[0];
    console.log('🎯 Update à supprimer:', updateToDelete.id);
    
    // Tester la suppression (sans token d'auth pour voir l'erreur)
    console.log('🗑️  Test de suppression...');
    const deleteResponse = await fetch(`${API_BASE}/campaigns/seed-camp-b/updates/${updateToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Pas de token d'auth pour tester
      }
    });
    
    console.log('📊 Statut de la réponse:', deleteResponse.status);
    
    if (deleteResponse.status === 401) {
      console.log('✅ Endpoint trouvé ! (Erreur d\'authentification attendue)');
    } else if (deleteResponse.status === 404) {
      console.log('❌ Endpoint non trouvé (404)');
    } else {
      const responseText = await deleteResponse.text();
      console.log('📄 Réponse:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Attendre un peu que le backend démarre
setTimeout(testDeleteUpdate, 3000);
