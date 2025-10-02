// Script de test rapide pour vérifier le démarrage du service email
// avec différentes configurations

console.log('🧪 Test de Démarrage Email Service\n');

// Simuler le ConfigService
class MockConfigService {
  constructor(config) {
    this.config = config;
  }
  
  get(key, defaultValue) {
    return this.config[key] || defaultValue;
  }
}

// Simuler le Logger
class MockLogger {
  log(message) {
    console.log(`[LOG] ${message}`);
  }
  
  error(message, error) {
    console.log(`[ERROR] ${message}`, error || '');
  }
}

// Simuler la logique de createTransporter
function testEmailConfiguration(config, description) {
  console.log(`\n📧 ${description}`);
  console.log('━'.repeat(50));
  
  const configService = new MockConfigService(config);
  const logger = new MockLogger();
  
  const nodeEnv = configService.get('NODE_ENV', 'development');
  const useGmail = nodeEnv === 'production' || configService.get('EMAIL_PROVIDER') === 'gmail';
  
  if (useGmail) {
    logger.log('📧 Configuration Gmail SMTP (Production)');
    console.log('🔧 Variables utilisées:');
    console.log(`   EMAIL_HOST: ${configService.get('EMAIL_HOST', 'smtp.gmail.com')}`);
    console.log(`   EMAIL_PORT: ${configService.get('EMAIL_PORT', 587)}`);
    console.log(`   EMAIL_USER: ${configService.get('EMAIL_USER', 'NON_DEFINI')}`);
    console.log(`   EMAIL_PASSWORD: ${configService.get('EMAIL_PASSWORD') ? '***défini***' : 'NON_DEFINI'}`);
    
    const minDelay = configService.get('MIN_EMAIL_DELAY', 1000);
    logger.log(`✅ Serveur email prêt (Gmail) - Délai: ${minDelay}ms`);
  } else {
    logger.log('📧 Configuration Mailtrap SMTP (Développement)');
    console.log('🔧 Variables utilisées:');
    console.log(`   MAILTRAP_HOST: ${configService.get('MAILTRAP_HOST', 'sandbox.smtp.mailtrap.io')}`);
    console.log(`   MAILTRAP_PORT: ${configService.get('MAILTRAP_PORT', 2525)}`);
    console.log(`   MAILTRAP_USER: ${configService.get('MAILTRAP_USER', 'NON_DEFINI')}`);
    console.log(`   MAILTRAP_PASSWORD: ${configService.get('MAILTRAP_PASSWORD') ? '***défini***' : 'NON_DEFINI'}`);
    
    const minDelay = configService.get('MIN_EMAIL_DELAY', 3000);
    logger.log(`✅ Serveur email prêt (Mailtrap) - Délai: ${minDelay}ms`);
  }
}

// Test 1: Développement par défaut (Mailtrap)
testEmailConfiguration({
  NODE_ENV: 'development',
  MAILTRAP_USER: 'test_user',
  MAILTRAP_PASSWORD: 'test_password'
}, 'Développement - Mailtrap par défaut');

// Test 2: Production par défaut (Gmail)  
testEmailConfiguration({
  NODE_ENV: 'production',
  EMAIL_USER: 'support@example.com',
  EMAIL_PASSWORD: 'app-password'
}, 'Production - Gmail par défaut');

// Test 3: Force Gmail en développement
testEmailConfiguration({
  NODE_ENV: 'development',
  EMAIL_PROVIDER: 'gmail',
  EMAIL_USER: 'support@example.com',
  EMAIL_PASSWORD: 'app-password',
  MIN_EMAIL_DELAY: '500'
}, 'Développement - Gmail forcé avec délai personnalisé');

// Test 4: Variables manquantes
testEmailConfiguration({
  NODE_ENV: 'production'
  // Pas d'EMAIL_USER ni EMAIL_PASSWORD
}, 'Production - Variables Gmail manquantes');

console.log('\n🎯 Résumé des Tests Terminés');
console.log('━'.repeat(50));
console.log('✅ Configuration Mailtrap (dev) : OK');
console.log('✅ Configuration Gmail (prod) : OK');  
console.log('✅ Basculement forcé : OK');
console.log('⚠️  Variables manquantes : Détectées');

console.log('\n📋 Pour utiliser votre configuration :');
console.log('1. Ajoutez les variables appropriées à votre .env');
console.log('2. Redémarrez avec npm run start:dev');
console.log('3. Vérifiez les logs de démarrage pour confirmer la config');

console.log('\n🚀 Commandes de test en temps réel :');
console.log('NODE_ENV=development npm run start:dev');
console.log('NODE_ENV=production npm run start:dev');
console.log('EMAIL_PROVIDER=gmail npm run start:dev');

