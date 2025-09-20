const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Redémarrage du backend...');

// Arrêter le processus existant s'il y en a un
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du backend...');
  process.exit(0);
});

// Démarrer le backend
const backend = spawn('npm', ['run', 'start:dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('❌ Erreur lors du démarrage du backend:', err);
});

backend.on('close', (code) => {
  console.log(`🔚 Backend fermé avec le code ${code}`);
});

console.log('✅ Backend démarré !');
console.log('📡 Endpoints disponibles:');
console.log('   - GET    /campaigns/:id/updates');
console.log('   - POST   /campaigns/:id/updates');
console.log('   - DELETE /campaigns/:id/updates/:updateId');
console.log('   - DELETE /campaigns/:id');
