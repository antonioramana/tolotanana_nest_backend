const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage du backend TOLOTANANA...');
console.log('=====================================');

// Changer vers le répertoire backend
process.chdir(path.join(__dirname));

// Démarrer le backend en mode développement
const backend = spawn('npm', ['run', 'start:dev'], {
  stdio: 'inherit',
  shell: true
});

backend.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error);
  console.log('\n💡 Solutions possibles:');
  console.log('1. Vérifiez que Node.js est installé');
  console.log('2. Vérifiez que npm est installé');
  console.log('3. Installez les dépendances: npm install');
  console.log('4. Vérifiez que le port 3000 est libre');
});

backend.on('close', (code) => {
  console.log(`\n🛑 Backend arrêté avec le code ${code}`);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du backend...');
  backend.kill('SIGINT');
  process.exit(0);
});

console.log('✅ Backend démarré sur http://localhost:3000');
console.log('📚 Documentation Swagger: http://localhost:3000/api/docs');
console.log('🛑 Appuyez sur Ctrl+C pour arrêter');
