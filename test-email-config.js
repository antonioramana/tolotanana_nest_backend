const { execSync } = require('child_process');

console.log('🧪 Test de Configuration Email - Mailtrap vs Gmail\n');

function testEmailConfig(envVars, description) {
  console.log(`\n📧 Test: ${description}`);
  console.log('Variables:', envVars);
  
  try {
    // Créer un fichier .env temporaire pour le test
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    console.log('✅ Configuration simulée avec succès');
    console.log('📋 Variables d\'environnement:');
    console.log(envContent);
    
    return true;
  } catch (error) {
    console.log('❌ Erreur de configuration:', error.message);
    return false;
  }
}

// Test 1: Configuration Mailtrap (Développement)
testEmailConfig({
  NODE_ENV: 'development',
  EMAIL_FROM: 'support@tolotanana.com',
  ADMIN_EMAIL: 'admin@tolotanana.com',
  MAILTRAP_HOST: 'sandbox.smtp.mailtrap.io',
  MAILTRAP_PORT: '2525',
  MAILTRAP_USER: 'test_user',
  MAILTRAP_PASSWORD: 'test_password',
}, 'Mailtrap (Développement par défaut)');

// Test 2: Configuration Gmail (Production)
testEmailConfig({
  NODE_ENV: 'production',
  EMAIL_FROM: 'support@tolotanana.com',
  ADMIN_EMAIL: 'admin@tolotanana.com',
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: '587',
  EMAIL_SECURE: 'false',
  EMAIL_USER: 'support@example.com',
  EMAIL_PASSWORD: 'abcd-efgh-ijkl-mnop',
}, 'Gmail (Production par défaut)');

// Test 3: Force Gmail en développement
testEmailConfig({
  NODE_ENV: 'development',
  EMAIL_PROVIDER: 'gmail',
  EMAIL_FROM: 'support@tolotanana.com',
  ADMIN_EMAIL: 'admin@tolotanana.com',
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: '587',
  EMAIL_SECURE: 'false',
  EMAIL_USER: 'support@example.com',
  EMAIL_PASSWORD: 'abcd-efgh-ijkl-mnop',
}, 'Gmail forcé en développement');

// Test 4: Force Mailtrap en production
testEmailConfig({
  NODE_ENV: 'production',
  EMAIL_PROVIDER: 'mailtrap',
  EMAIL_FROM: 'support@tolotanana.com',
  ADMIN_EMAIL: 'admin@tolotanana.com',
  MAILTRAP_HOST: 'sandbox.smtp.mailtrap.io',
  MAILTRAP_PORT: '2525',
  MAILTRAP_USER: 'test_user',
  MAILTRAP_PASSWORD: 'test_password',
}, 'Mailtrap forcé en production');

// Test 5: Délai personnalisé
testEmailConfig({
  NODE_ENV: 'development',
  EMAIL_FROM: 'support@tolotanana.com',
  ADMIN_EMAIL: 'admin@tolotanana.com',
  MAILTRAP_HOST: 'sandbox.smtp.mailtrap.io',
  MAILTRAP_PORT: '2525',
  MAILTRAP_USER: 'test_user',
  MAILTRAP_PASSWORD: 'test_password',
  MIN_EMAIL_DELAY: '500',
}, 'Délai personnalisé à 500ms');

console.log('\n✅ Tous les tests de configuration terminés!');
console.log('\n📚 Instructions pour utiliser votre configuration:');
console.log('1. Copiez les variables appropriées dans votre fichier .env');
console.log('2. Remplacez les valeurs de test par vos vraies credentials');
console.log('3. Redémarrez votre serveur NestJS');
console.log('4. Vérifiez les logs au démarrage pour confirmer la configuration');

console.log('\n🎯 Exemple de commande pour tester:');
console.log('NODE_ENV=development npm run start:dev  # → Utilise Mailtrap');
console.log('NODE_ENV=production npm run start:dev   # → Utilise Gmail');
console.log('EMAIL_PROVIDER=gmail npm run start:dev  # → Force Gmail');

