#!/usr/bin/env node

console.log('🚀 Démarrage du backend Tolotanana...');
console.log('📡 Endpoints disponibles après démarrage:');
console.log('   ✅ GET    /campaigns/:id/updates');
console.log('   ✅ POST   /campaigns/:id/updates');
console.log('   ✅ DELETE /campaigns/:id/updates/:updateId');
console.log('   ✅ DELETE /campaigns/:id');
console.log('');
console.log('🔧 Ordre des routes corrigé:');
console.log('   - Route spécifique DELETE /campaigns/:id/updates/:updateId AVANT');
console.log('   - Route générale DELETE /campaigns/:id APRÈS');
console.log('');
console.log('⏳ Démarrage en cours...');

const { spawn } = require('child_process');

const backend = spawn('npm', ['run', 'start:dev'], {
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('❌ Erreur:', err);
});

backend.on('close', (code) => {
  console.log(`🔚 Backend fermé (code: ${code})`);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du backend...');
  backend.kill('SIGINT');
  process.exit(0);
});
