const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 Test Réel de Configuration Email\n');

// Lire le fichier .env actuel s'il existe
let currentEnv = {};
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      currentEnv[key] = value;
    }
  });
  console.log('📁 Fichier .env existant trouvé');
} catch (error) {
  console.log('📁 Aucun fichier .env trouvé - utilisation des variables par défaut');
}

function testServerStartup(envVars, description, duration = 10000) {
  return new Promise((resolve) => {
    console.log(`\n🚀 Test: ${description}`);
    console.log('━'.repeat(60));
    
    // Créer les variables d'environnement pour le processus
    const testEnv = { ...process.env, ...currentEnv, ...envVars };
    
    console.log('🔧 Variables d\'environnement de test:');
    Object.entries(envVars).forEach(([key, value]) => {
      if (key.includes('PASSWORD')) {
        console.log(`   ${key}: ***masqué***`);
      } else {
        console.log(`   ${key}: ${value}`);
      }
    });
    
    // Démarrer le serveur NestJS
    const server = spawn('npm', ['run', 'start:dev'], {
      env: testEnv,
      stdio: 'pipe'
    });
    
    let outputBuffer = '';
    let errorBuffer = '';
    let emailConfigFound = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      
      // Chercher les logs de configuration email
      if (output.includes('Configuration Gmail SMTP') || output.includes('Configuration Mailtrap SMTP')) {
        emailConfigFound = true;
        console.log('✅ Configuration email détectée dans les logs');
        console.log(output.trim());
      }
      
      if (output.includes('Serveur email prêt')) {
        console.log('✅ Service email initialisé avec succès');
        console.log(output.trim());
      }
      
      if (output.includes('Application is running on')) {
        console.log('🌟 Serveur démarré avec succès!');
      }
    });
    
    server.stderr.on('data', (data) => {
      const error = data.toString();
      errorBuffer += error;
      
      if (error.includes('email') || error.includes('SMTP')) {
        console.log('❌ Erreur email détectée:', error.trim());
      }
    });
    
    // Arrêter le serveur après la durée spécifiée
    setTimeout(() => {
      server.kill('SIGTERM');
      
      setTimeout(() => {
        console.log(`\n📊 Résultat pour "${description}":`);
        if (emailConfigFound) {
          console.log('   ✅ Configuration email appliquée');
        } else {
          console.log('   ⚠️  Configuration email non détectée dans les logs');
        }
        
        if (errorBuffer.includes('email') || errorBuffer.includes('SMTP')) {
          console.log('   ❌ Erreurs email détectées');
        } else {
          console.log('   ✅ Aucune erreur email');
        }
        
        resolve({
          description,
          emailConfigFound,
          hasEmailErrors: errorBuffer.includes('email') || errorBuffer.includes('SMTP'),
          outputBuffer,
          errorBuffer
        });
      }, 1000);
    }, duration);
  });
}

async function runAllTests() {
  const results = [];
  
  // Test 1: Configuration Mailtrap (développement)
  results.push(await testServerStartup({
    NODE_ENV: 'development'
  }, 'Mailtrap (développement par défaut)', 8000));
  
  // Test 2: Configuration Gmail forcée en développement
  results.push(await testServerStartup({
    NODE_ENV: 'development',
    EMAIL_PROVIDER: 'gmail',
    EMAIL_HOST: 'smtp.gmail.com',
    EMAIL_PORT: '587',
    EMAIL_USER: 'test@example.com',
    EMAIL_PASSWORD: 'test-password'
  }, 'Gmail forcé en développement', 8000));
  
  // Test 3: Configuration production (Gmail par défaut)
  results.push(await testServerStartup({
    NODE_ENV: 'production',
    EMAIL_HOST: 'smtp.gmail.com',
    EMAIL_PORT: '587',
    EMAIL_USER: 'test@example.com',
    EMAIL_PASSWORD: 'test-password'
  }, 'Gmail (production par défaut)', 8000));
  
  // Résumé final
  console.log('\n🎯 RÉSUMÉ FINAL DES TESTS');
  console.log('━'.repeat(60));
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.description}`);
    console.log(`   Configuration email: ${result.emailConfigFound ? '✅ Détectée' : '❌ Non détectée'}`);
    console.log(`   Erreurs email: ${result.hasEmailErrors ? '❌ Présentes' : '✅ Aucune'}`);
  });
  
  const allConfigsWorking = results.every(r => r.emailConfigFound && !r.hasEmailErrors);
  
  console.log('\n🏆 RÉSULTAT GLOBAL:');
  if (allConfigsWorking) {
    console.log('✅ Tous les tests réussis! Votre configuration email fonctionne correctement.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez votre configuration .env');
  }
  
  console.log('\n📚 PROCHAINES ÉTAPES:');
  console.log('1. Ajoutez vos vraies credentials dans le .env');
  console.log('2. Testez l\'envoi d\'un email via l\'API de contact');
  console.log('3. Vérifiez la réception dans Mailtrap ou Gmail');
}

// Avertissement
console.log('⚠️  Ce test va démarrer et arrêter le serveur plusieurs fois');
console.log('💡 Assurez-vous qu\'aucun autre serveur ne fonctionne sur le port 3000');
console.log('\n🕐 Début des tests dans 3 secondes...\n');

setTimeout(() => {
  runAllTests().catch(error => {
    console.error('❌ Erreur lors des tests:', error);
  });
}, 3000);

