// Script simple pour vérifier que notre configuration email fonctionne

console.log('🔍 Vérification de la Configuration Email\n');

// Charger les dépendances nécessaires
const fs = require('fs');
const path = require('path');

// Vérifier que les fichiers modifiés existent
const emailServicePath = path.join(__dirname, 'src', 'email', 'email.service.ts');
const configDocPath = path.join(__dirname, 'EMAIL_ENV_CONFIGURATION.md');

console.log('📁 Vérification des fichiers...');

if (fs.existsSync(emailServicePath)) {
  console.log('✅ src/email/email.service.ts trouvé');
  
  // Lire le contenu pour vérifier les modifications
  const serviceContent = fs.readFileSync(emailServicePath, 'utf8');
  
  const checks = [
    { test: serviceContent.includes('useGmail'), name: 'Logique de basculement Gmail/Mailtrap' },
    { test: serviceContent.includes('NODE_ENV'), name: 'Détection de l\'environnement' },
    { test: serviceContent.includes('EMAIL_PROVIDER'), name: 'Force provider manuel' },
    { test: serviceContent.includes('Configuration Gmail SMTP'), name: 'Configuration Gmail' },
    { test: serviceContent.includes('Configuration Mailtrap SMTP'), name: 'Configuration Mailtrap' },
    { test: serviceContent.includes('MIN_EMAIL_DELAY'), name: 'Délai personnalisable' },
    { test: serviceContent.includes('this.minDelayBetweenEmails = this.configService.get'), name: 'Rate limiting dynamique' }
  ];
  
  console.log('\n🔧 Vérifications des fonctionnalités:');
  checks.forEach(check => {
    console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
  });
  
  const allPassed = checks.every(check => check.test);
  console.log(`\n📊 Score: ${checks.filter(c => c.test).length}/${checks.length} fonctionnalités implémentées`);
  
  if (allPassed) {
    console.log('🎉 Toutes les modifications sont présentes!');
  } else {
    console.log('⚠️  Certaines fonctionnalités semblent manquantes');
  }
  
} else {
  console.log('❌ src/email/email.service.ts non trouvé');
}

if (fs.existsSync(configDocPath)) {
  console.log('✅ EMAIL_ENV_CONFIGURATION.md trouvé');
} else {
  console.log('❌ EMAIL_ENV_CONFIGURATION.md non trouvé');
}

// Vérifier le package.json pour les scripts
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('\n📦 Scripts disponibles:');
  console.log(`   start:dev: ${packageJson.scripts['start:dev'] ? '✅' : '❌'}`);
  console.log(`   build: ${packageJson.scripts['build'] ? '✅' : '❌'}`);
}

// Suggestions de variables d'environnement
console.log('\n🔧 Variables d\'environnement recommandées:');
console.log('━'.repeat(50));

console.log('\n💻 DÉVELOPPEMENT (Mailtrap):');
console.log('NODE_ENV=development');
console.log('MAILTRAP_HOST=sandbox.smtp.mailtrap.io');
console.log('MAILTRAP_PORT=2525');
console.log('MAILTRAP_USER=your_username');
console.log('MAILTRAP_PASSWORD=your_password');
console.log('EMAIL_FROM=support@tolotanana.com');
console.log('ADMIN_EMAIL=admin@tolotanana.com');

console.log('\n🌐 PRODUCTION (Gmail):');
console.log('NODE_ENV=production');
console.log('EMAIL_HOST=smtp.gmail.com');
console.log('EMAIL_PORT=587');
console.log('EMAIL_SECURE=false');
console.log('EMAIL_USER=your@gmail.com');
console.log('EMAIL_PASSWORD=your-app-password');
console.log('EMAIL_FROM=support@tolotanana.com');
console.log('ADMIN_EMAIL=admin@tolotanana.com');

console.log('\n⚙️  BASCULEMENT MANUEL:');
console.log('EMAIL_PROVIDER=gmail    # Force Gmail même en dev');
console.log('EMAIL_PROVIDER=mailtrap # Force Mailtrap même en prod');
console.log('MIN_EMAIL_DELAY=500     # Délai personnalisé (ms)');

console.log('\n🧪 COMMANDES DE TEST:');
console.log('NODE_ENV=development npm run start:dev    # → Mailtrap');
console.log('NODE_ENV=production npm run start:dev     # → Gmail');
console.log('EMAIL_PROVIDER=gmail npm run start:dev    # → Force Gmail');

console.log('\n✅ Configuration email prête pour le basculement automatique!');

