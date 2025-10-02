const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🧪 Test de Connexion Gmail SMTP\n');

// Configuration de test Gmail
const gmailConfig = {
  service: 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: (parseInt(process.env.EMAIL_PORT) || 587) === 465,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 75000
};

console.log('📧 Configuration Gmail:');
console.log('━'.repeat(40));
console.log(`Host: ${gmailConfig.host}`);
console.log(`Port: ${gmailConfig.port}`);
console.log(`Secure: ${gmailConfig.secure}`);
console.log(`User: ${gmailConfig.auth.user || 'NON_DEFINI'}`);
console.log(`Password: ${gmailConfig.auth.pass ? '***défini***' : 'NON_DEFINI'}`);
console.log(`Service: ${gmailConfig.service}`);

if (!gmailConfig.auth.user || !gmailConfig.auth.pass) {
  console.log('\n❌ ERREUR: Variables EMAIL_USER et EMAIL_PASSWORD requises');
  console.log('\n📋 Ajoutez à votre .env:');
  console.log('EMAIL_USER=votre@gmail.com');
  console.log('EMAIL_PASSWORD=votre-mot-de-passe-application');
  console.log('\n💡 Le mot de passe doit être un "mot de passe d\'application" Gmail');
  process.exit(1);
}

async function testGmailConnection() {
  console.log('\n🔌 Test de connexion...');
  
  try {
    // Créer le transporter
    const transporter = nodemailer.createTransport(gmailConfig);
    
    // Test de vérification
    console.log('⏳ Vérification de la connexion SMTP...');
    
    const isValid = await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          reject(error);
        } else {
          resolve(success);
        }
      });
    });
    
    if (isValid) {
      console.log('✅ Connexion Gmail SMTP réussie!');
      
      // Test d'envoi (optionnel)
      const testEmail = process.env.TEST_EMAIL || gmailConfig.auth.user;
      
      if (testEmail) {
        console.log(`\n📧 Test d'envoi vers ${testEmail}...`);
        
        const mailOptions = {
          from: {
            name: 'TOLOTANANA Test',
            address: gmailConfig.auth.user
          },
          to: testEmail,
          subject: 'Test Configuration Gmail SMTP',
          html: `
            <h2>✅ Test Gmail SMTP Réussi!</h2>
            <p>Ce message confirme que votre configuration Gmail SMTP fonctionne correctement.</p>
            <hr>
            <p><strong>Configuration testée:</strong></p>
            <ul>
              <li>Host: ${gmailConfig.host}</li>
              <li>Port: ${gmailConfig.port}</li>
              <li>Secure: ${gmailConfig.secure}</li>
              <li>User: ${gmailConfig.auth.user}</li>
            </ul>
            <p><em>Envoyé par le script de test TOLOTANANA</em></p>
          `
        };
        
        try {
          const result = await transporter.sendMail(mailOptions);
          console.log('✅ Email de test envoyé avec succès!');
          console.log(`📬 Message ID: ${result.messageId}`);
          console.log(`📧 Vérifiez votre boîte email: ${testEmail}`);
        } catch (emailError) {
          console.log('⚠️  Connexion OK mais échec d\'envoi email:');
          console.log(`   ${emailError.message}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur de connexion Gmail:');
    console.log(`   ${error.message}`);
    
    // Diagnostic de l'erreur
    console.log('\n🔍 Diagnostic:');
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('💡 Problème SSL/TLS détecté');
      console.log('   → Vérifiez la configuration des ports:');
      console.log('   → Port 587: secure=false (STARTTLS)');
      console.log('   → Port 465: secure=true (SSL direct)');
    } else if (error.message.includes('authentication') || error.message.includes('Username and Password not accepted')) {
      console.log('💡 Problème d\'authentification détecté');
      console.log('   → Vérifiez EMAIL_USER (doit être un email Gmail complet)');
      console.log('   → Vérifiez EMAIL_PASSWORD (doit être un mot de passe d\'application, pas votre mot de passe Gmail)');
      console.log('   → Assurez-vous que la 2FA est activée sur Gmail');
    } else if (error.message.includes('timeout') || error.message.includes('connect')) {
      console.log('💡 Problème de réseau détecté');
      console.log('   → Vérifiez votre connexion internet');
      console.log('   → Vérifiez que le port n\'est pas bloqué par un firewall');
    } else {
      console.log('💡 Erreur non reconnue');
      console.log('   → Consultez le guide GMAIL_TROUBLESHOOTING.md');
    }
    
    process.exit(1);
  }
}

console.log('\n⏳ Démarrage du test dans 2 secondes...');
setTimeout(testGmailConnection, 2000);
