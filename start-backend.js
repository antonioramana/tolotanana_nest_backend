const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage du backend TOLOTANANA...');

const backend = spawn('npm', ['run', 'start:dev'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  shell: true
});

backend.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error);
});

backend.on('close', (code) => {
  console.log(`Backend fermé avec le code ${code}`);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du backend...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du backend...');
  backend.kill('SIGTERM');
  process.exit(0);
});
