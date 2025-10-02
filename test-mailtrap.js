const nodemailer = require('nodemailer');
require('dotenv').config();

async function testMailtrap() {
  console.log('🧪 Test de configuration Mailtrap...\n');

  // Vérifier les variables d'environnement
  const requiredVars = ['MAILTRAP_USER', 'MAILTRAP_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables manquantes dans .env:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.log('\n💡 Ajoutez ces variables dans votre fichier .env');
    return;
  }

  // Configuration Mailtrap
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.MAILTRAP_PORT) || 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  try {
    // Test de connexion
    console.log('🔗 Test de connexion Mailtrap...');
    await transporter.verify();
    console.log('✅ Connexion Mailtrap réussie !');

    // Envoi d'un email de test
    console.log('\n📧 Envoi d\'un email de test...');
    const testEmail = {
      from: {
        name: 'TOLOTANANA Test',
        address: process.env.EMAIL_FROM || 'test@tolotanana.com',
      },
      to: 'user.test@example.com', // Adresse de test
      subject: 'Test Mailtrap - TOLOTANANA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ea580c; color: white; padding: 20px; text-align: center;">
            <h1>🧪 TEST MAILTRAP</h1>
            <p>Configuration TOLOTANANA</p>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <h2>✅ Test réussi !</h2>
            <p>Si vous voyez cet email dans votre interface Mailtrap, la configuration fonctionne parfaitement.</p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <h3>📋 Informations de test :</h3>
              <p><strong>📅 Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
              <p><strong>📧 Destinataire :</strong> user.test@example.com</p>
              <p><strong>🔧 Service :</strong> Mailtrap</p>
              <p><strong>🏷️ Type :</strong> Email de test</p>
            </div>
            
            <p><strong>🎯 Prochaines étapes :</strong></p>
            <ul>
              <li>Vérifiez cet email dans votre interface Mailtrap</li>
              <li>Testez le formulaire de contact sur le site</li>
              <li>Vérifiez que les emails utilisent les vraies adresses</li>
            </ul>
            
            <p>Cordialement,<br><strong>L'équipe TOLOTANANA</strong></p>
          </div>
          <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>TOLOTANANA - Test de configuration Mailtrap</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Email de test envoyé avec succès !');
    console.log(`📧 ID du message : ${result.messageId}`);
    
    console.log('\n🎉 Configuration Mailtrap validée !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Allez sur https://mailtrap.io/inboxes');
    console.log('2. Vérifiez que l\'email de test est arrivé');
    console.log('3. Testez le formulaire de contact sur votre site');
    console.log('4. Vérifiez que les emails utilisent les vraies adresses des utilisateurs');

  } catch (error) {
    console.error('❌ Erreur lors du test Mailtrap :');
    console.error(error.message);
    
    console.log('\n🔧 Vérifications à faire :');
    console.log('1. Vérifiez vos identifiants Mailtrap dans .env');
    console.log('2. Vérifiez que votre compte Mailtrap est actif');
    console.log('3. Vérifiez la connexion internet');
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Erreur d\'authentification :');
      console.log('- Vérifiez MAILTRAP_USER et MAILTRAP_PASSWORD');
      console.log('- Allez sur mailtrap.io → Inbox → SMTP Settings');
    }
  }
}

// Exécuter le test
testMailtrap();
