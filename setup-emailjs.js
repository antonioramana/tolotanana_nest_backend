// Script pour configurer rapidement EmailJS comme fallback

console.log('🔧 Configuration EmailJS pour Fallback Email');
console.log('============================================\n');

console.log('📧 EmailJS est un service gratuit qui permet d\'envoyer des emails');
console.log('   via API HTTP, parfait pour contourner les blocages SMTP.\n');

console.log('🚀 Étapes de Configuration:');
console.log('━'.repeat(50));

console.log('\n1️⃣ Créer un compte EmailJS:');
console.log('   🌐 Aller sur: https://www.emailjs.com/');
console.log('   ✅ S\'inscrire gratuitement (100 emails/mois)');

console.log('\n2️⃣ Configurer le service email:');
console.log('   📧 Connecter votre Gmail/Outlook');
console.log('   🔑 Obtenir le Service ID (exemple: service_xxxxxxxxx)');

console.log('\n3️⃣ Créer un template:');
console.log('   📝 Nom: tolotanana_contact');
console.log('   📋 Template content:');
console.log('   ┌─────────────────────────────────────────┐');
console.log('   │ Subject: {{subject}}                    │');
console.log('   │                                         │');
console.log('   │ De: {{from_name}}                       │');
console.log('   │ À: {{to_email}}                         │');
console.log('   │                                         │');
console.log('   │ Message:                                │');
console.log('   │ {{{message_html}}}                      │');
console.log('   └─────────────────────────────────────────┘');
console.log('   🔑 Obtenir le Template ID (exemple: template_xxxxxxxxx)');

console.log('\n4️⃣ Obtenir l\'User ID:');
console.log('   ⚙️  Account → API Keys');
console.log('   🔑 Copier l\'User ID (exemple: user_xxxxxxxxx)');

console.log('\n5️⃣ Configurer les variables d\'environnement:');
console.log('   📁 Dans votre .env ou variables Render:');
console.log('   ┌─────────────────────────────────────────┐');
console.log('   │ EMAILJS_SERVICE_ID=service_xxxxxxxxx    │');
console.log('   │ EMAILJS_TEMPLATE_ID=template_xxxxxxxxx  │');
console.log('   │ EMAILJS_USER_ID=user_xxxxxxxxx          │');
console.log('   └─────────────────────────────────────────┘');

console.log('\n6️⃣ Tester la configuration:');
console.log('   🧪 Redémarrer le backend');
console.log('   📧 Essayer d\'envoyer un email de contact');
console.log('   🔍 Vérifier les logs pour voir le fallback');

console.log('\n✅ Logs attendus en cas de fallback EmailJS:');
console.log('━'.repeat(50));
console.log('[WARN] ❌ SMTP a échoué après toutes les tentatives');
console.log('[LOG] 🌐 Tentative d\'envoi via API HTTP...');
console.log('[LOG] ✅ Email envoyé avec succès via EmailJS');

console.log('\n🎯 Avantages d\'EmailJS:');
console.log('━'.repeat(50));
console.log('✅ Gratuit (100 emails/mois)');
console.log('✅ Fonctionne sur tous les hébergeurs');
console.log('✅ Pas de configuration SMTP');
console.log('✅ API HTTP simple');
console.log('✅ Support Gmail, Outlook, Yahoo, etc.');

console.log('\n⚠️  Limites à connaître:');
console.log('━'.repeat(50));
console.log('📊 100 emails/mois en gratuit');
console.log('💰 $20/mois pour 1000 emails');
console.log('🚫 Pas d\'emails en masse (anti-spam)');
console.log('👤 Nécessite authentification utilisateur');

console.log('\n🚀 Alternatives si besoin de plus:');
console.log('━'.repeat(50));
console.log('📧 SendGrid: 100 emails/jour gratuits');
console.log('📧 Mailgun: 300 emails/jour gratuits');
console.log('📧 Brevo: 300 emails/jour gratuits');
console.log('📧 Amazon SES: Très bon marché');

console.log('\n🎉 Une fois configuré:');
console.log('━'.repeat(50));
console.log('✅ Vos emails fonctionneront TOUJOURS');
console.log('✅ Même si SMTP est bloqué');
console.log('✅ Fallback automatique et transparent');
console.log('✅ Logs détaillés pour monitoring');

console.log('\n💡 Conseil: Gardez SMTP + EmailJS');
console.log('   → SMTP pour la vitesse');
console.log('   → EmailJS pour la fiabilité');
console.log('   → Le meilleur des deux mondes !');

console.log('\n🔗 Liens utiles:');
console.log('━'.repeat(50));
console.log('🌐 EmailJS: https://www.emailjs.com/');
console.log('📚 Documentation: https://www.emailjs.com/docs/');
console.log('🎓 Tutoriel: https://www.emailjs.com/docs/tutorial/');
console.log('💬 Support: https://www.emailjs.com/docs/faq/');

console.log('\n✨ Bonne configuration ! Vos emails ne tomberont plus jamais !');
