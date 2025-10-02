// Script pour vérifier la configuration en cours d'exécution

const { exec } = require('child_process');
const fs = require('fs');

console.log('🔍 Vérification de la Configuration en Cours\n');

// 1. Vérifier les variables d'environnement actuelles
require('dotenv').config();

console.log('📋 Configuration Actuelle:');
console.log('━'.repeat(40));
console.log(`NODE_ENV: "${process.env.NODE_ENV}"`);
console.log(`useGmail: ${process.env.NODE_ENV === 'production' || process.env.EMAIL_PROVIDER === 'gmail'}`);
console.log();

// 2. Vérifier si le serveur tourne
console.log('🔍 Vérification du serveur en cours...');

exec('netstat -ano | findstr :3000', (error, stdout, stderr) => {
  if (stdout) {
    console.log('✅ Serveur semble tourner sur le port 3000');
    console.log('💡 Si vous avez changé NODE_ENV, redémarrez le serveur');
  } else {
    console.log('❌ Aucun serveur détecté sur le port 3000');
  }
});

// 3. Vérifier le fichier .env
console.log('\n📁 Contenu de votre .env:');
console.log('━'.repeat(40));

try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && key.includes('EMAIL') || key.includes('NODE_ENV')) {
      if (key.includes('PASSWORD')) {
        console.log(`${key}=***masqué***`);
      } else {
        console.log(`${key}=${value || ''}`);
      }
    }
  });
} catch (error) {
  console.log('❌ Impossible de lire le fichier .env');
}

// 4. Proposer des solutions
console.log('\n🔧 Solutions pour Forcer Gmail:');
console.log('━'.repeat(40));
console.log('1. 🔄 Redémarrer le serveur après changement de NODE_ENV:');
console.log('   Ctrl+C puis npm run start:dev');
console.log();
console.log('2. 🎯 Forcer Gmail explicitement:');
console.log('   EMAIL_PROVIDER=gmail npm run start:dev');
console.log();
console.log('3. 📧 Test d\'envoi pour vérifier:');
console.log('   curl -X POST http://localhost:3000/public/contact \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"name":"Test","email":"test@example.com","subject":"Test","message":"Test Gmail"}\'');

console.log('\n📋 Logs à Rechercher au Démarrage:');
console.log('━'.repeat(40));
console.log('✅ Gmail:    "[LOG] 📧 Configuration Gmail SMTP (Production)"');
console.log('❌ Mailtrap: "[LOG] 📧 Configuration Mailtrap SMTP (Développement)"');

console.log('\n💡 Si les emails vont encore dans Mailtrap:');
console.log('━'.repeat(40));
console.log('1. Vérifiez que vous regardez les BONS logs (nouveau démarrage)');
console.log('2. Le serveur utilise peut-être un ancien .env en cache');
console.log('3. Il y a peut-être un fallback en cas d\'erreur Gmail');

