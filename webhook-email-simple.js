// Webhook simple pour envoyer des emails via API externe

const express = require('express');
const app = express();
app.use(express.json());

// Utilisez un service gratuit comme Formspree ou EmailJS direct
app.post('/send-email', async (req, res) => {
  const { to, from, subject, html } = req.body;
  
  console.log('📧 Webhook email reçu:', { to, subject });
  
  try {
    // Option 1: Utiliser Formspree (gratuit, 50 emails/mois)
    // Créer un compte sur https://formspree.io/
    // Remplacer YOUR_FORM_ID par votre ID Formspree
    const formspreeUrl = 'https://formspree.io/f/YOUR_FORM_ID';
    
    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: to,
        subject: subject,
        message: html
      })
    });

    if (response.ok) {
      console.log('✅ Email envoyé via Formspree');
      res.json({ success: true, messageId: 'formspree-' + Date.now() });
    } else {
      throw new Error('Formspree failed');
    }
    
  } catch (error) {
    console.error('❌ Erreur webhook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`🪝 Webhook email démarré sur port ${port}`);
  console.log('📧 Endpoint: /send-email');
  console.log('🌐 Configurez WEBHOOK_EMAIL_URL pour utiliser ce service');
});

// Instructions d'utilisation :
console.log('\n🔧 Configuration:');
console.log('1. Créer compte sur https://formspree.io/');
console.log('2. Créer un nouveau form');
console.log('3. Remplacer YOUR_FORM_ID par l\'ID obtenu');
console.log('4. Déployer ce webhook sur Render/Heroku');
console.log('5. Configurer WEBHOOK_EMAIL_URL avec l\'URL du webhook');











