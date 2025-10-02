// Script de diagnostic pour comprendre pourquoi Gmail n'est pas utilisé

console.log('🔍 Diagnostic de Configuration Email\n');

// Charger les variables d'environnement
require('dotenv').config();

console.log('📋 Variables d\'environnement actuelles:');
console.log('━'.repeat(50));
console.log(`NODE_ENV: "${process.env.NODE_ENV}"`);
console.log(`EMAIL_PROVIDER: "${process.env.EMAIL_PROVIDER || 'non défini'}"`);
console.log(`EMAIL_HOST: "${process.env.EMAIL_HOST || 'non défini'}"`);
console.log(`EMAIL_PORT: "${process.env.EMAIL_PORT || 'non défini'}"`);
console.log(`EMAIL_USER: "${process.env.EMAIL_USER || 'non défini'}"`);
console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '***défini***' : 'non défini'}`);
console.log();

// Simuler la logique du service
const nodeEnv = process.env.NODE_ENV || 'development';
const useGmail = nodeEnv === 'production' || process.env.EMAIL_PROVIDER === 'gmail';

console.log('🧮 Logique de basculement:');
console.log('━'.repeat(50));
console.log(`NODE_ENV: "${nodeEnv}"`);
console.log(`NODE_ENV === 'production': ${nodeEnv === 'production'}`);
console.log(`EMAIL_PROVIDER === 'gmail': ${process.env.EMAIL_PROVIDER === 'gmail'}`);
console.log(`useGmail (résultat final): ${useGmail}`);
console.log();

if (useGmail) {
  console.log('✅ DEVRAIT utiliser Gmail');
  console.log('📧 Variables Gmail requises:');
  console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || '❌ MANQUANT'}`);
  console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || '❌ MANQUANT'}`);
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '❌ MANQUANT'}`);
  console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ défini' : '❌ MANQUANT'}`);
  
  const missingVars = [];
  if (!process.env.EMAIL_USER) missingVars.push('EMAIL_USER');
  if (!process.env.EMAIL_PASSWORD) missingVars.push('EMAIL_PASSWORD');
  
  if (missingVars.length > 0) {
    console.log(`\n⚠️  Variables manquantes: ${missingVars.join(', ')}`);
    console.log('💡 Le service pourrait fallback sur Mailtrap si Gmail échoue');
  }
} else {
  console.log('✅ DEVRAIT utiliser Mailtrap');
  console.log('📧 Variables Mailtrap:');
  console.log(`   MAILTRAP_HOST: ${process.env.MAILTRAP_HOST || 'valeur par défaut'}`);
  console.log(`   MAILTRAP_PORT: ${process.env.MAILTRAP_PORT || 'valeur par défaut'}`);
  console.log(`   MAILTRAP_USER: ${process.env.MAILTRAP_USER || '❌ MANQUANT'}`);
  console.log(`   MAILTRAP_PASSWORD: ${process.env.MAILTRAP_PASSWORD ? '✅ défini' : '❌ MANQUANT'}`);
}

console.log('\n🔧 Solutions possibles:');
console.log('━'.repeat(50));

if (!useGmail && nodeEnv !== 'production') {
  console.log('1. ✅ Forcer Gmail avec: EMAIL_PROVIDER=gmail');
  console.log('2. ✅ Ou définir: NODE_ENV=production');
} else if (useGmail && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
  console.log('1. ❌ Variables Gmail manquantes - ajoutez:');
  console.log('   EMAIL_USER=votre@gmail.com');
  console.log('   EMAIL_PASSWORD=votre-mot-de-passe-app');
} else if (useGmail) {
  console.log('1. ✅ Configuration semble correcte');
  console.log('2. 🔍 Vérifiez les logs du serveur au démarrage');
  console.log('3. 🧪 Testez avec: npm run start:dev');
}

console.log('\n🚀 Commandes de test:');
console.log('━'.repeat(50));
console.log('NODE_ENV=production npm run start:dev  # Force production');
console.log('EMAIL_PROVIDER=gmail npm run start:dev # Force Gmail');

console.log('\n📝 Vérifiez aussi votre fichier .env:');
console.log('━'.repeat(50));
console.log('NODE_ENV=production');
console.log('EMAIL_HOST=smtp.gmail.com');
console.log('EMAIL_PORT=587');
console.log('EMAIL_USER=votre@gmail.com');
console.log('EMAIL_PASSWORD=votre-mot-de-passe-app');

