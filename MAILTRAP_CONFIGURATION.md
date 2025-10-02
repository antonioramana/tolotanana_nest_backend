# 📧 Configuration Mailtrap - TOLOTANANA

## ✅ **Système Configuré pour Mailtrap**

Le système d'email est maintenant configuré pour **Mailtrap** et envoie aux **vraies adresses email** des utilisateurs !

### 🔧 **Configuration Mailtrap**

#### **1. Créer un Compte Mailtrap**
1. **Aller sur** : https://mailtrap.io/
2. **S'inscrire** gratuitement
3. **Créer une boîte de réception** (Inbox)

#### **2. Obtenir les Identifiants SMTP**
Dans votre inbox Mailtrap :
1. **Cliquer** sur l'inbox créée
2. **Aller** dans l'onglet "SMTP Settings"
3. **Sélectionner** "Nodemailer" dans le dropdown
4. **Copier** les informations affichées

#### **3. Variables d'Environnement**
Ajoutez ces variables à votre fichier `.env` :

```bash
# Configuration Mailtrap
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="votre_username_mailtrap"
MAILTRAP_PASSWORD="votre_password_mailtrap"

# Adresse d'expéditeur
EMAIL_FROM="support@tolotanana.com"

# Email admin pour notifications
ADMIN_EMAIL="admin@tolotanana.com"
```

### 📧 **Fonctionnement avec Mailtrap**

#### **Avantages de Mailtrap :**
- ✅ **Emails de test** : Intercepte tous les emails sans les envoyer réellement
- ✅ **Vraies adresses** : Utilise les vraies adresses des utilisateurs
- ✅ **Interface web** : Voir tous les emails dans l'interface Mailtrap
- ✅ **Debugging** : Analyser le contenu HTML, headers, etc.
- ✅ **Gratuit** : Plan gratuit généreux pour le développement

#### **Ce qui se passe :**
1. **Utilisateur** envoie message avec son vrai email (ex: `user@gmail.com`)
2. **Email envoyé** à `user@gmail.com` mais intercepté par Mailtrap
3. **Email visible** dans l'interface Mailtrap avec la vraie adresse de destination
4. **Contenu réel** : Template complet comme en production

### 🎯 **Types d'Emails Testables**

#### **1. Email de Confirmation**
- **À** : Vraie adresse de l'utilisateur qui a envoyé le message
- **Contenu** : Confirmation de réception + récapitulatif
- **Visible dans** : Mailtrap inbox

#### **2. Email de Réponse Admin**
- **À** : Vraie adresse de l'utilisateur
- **Contenu** : Réponse de l'admin + message original
- **Visible dans** : Mailtrap inbox

#### **3. Notification Admin**
- **À** : `ADMIN_EMAIL` configuré
- **Contenu** : Nouveau message reçu + détails
- **Visible dans** : Mailtrap inbox

### 🧪 **Test Complet avec Mailtrap**

#### **1. Configuration**
```bash
# Exemple de configuration .env
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="1a2b3c4d5e6f7g"
MAILTRAP_PASSWORD="9z8y7x6w5v4u3t"
EMAIL_FROM="support@tolotanana.com"
ADMIN_EMAIL="admin@tolotanana.com"
```

#### **2. Test du Workflow**
1. **Envoyer message** via `/contact` avec votre vrai email
2. **Aller sur Mailtrap** → Voir 2 emails :
   - Confirmation à votre adresse
   - Notification à l'admin
3. **Répondre** via `/admin/contact`
4. **Voir dans Mailtrap** : Email de réponse à votre adresse

#### **3. Vérifications dans Mailtrap**
- ✅ **Destinataires** : Vraies adresses email
- ✅ **Contenu HTML** : Templates complets
- ✅ **Headers** : Informations d'envoi
- ✅ **Pièces jointes** : Si applicable

### 🔄 **Passage en Production**

#### **Pour passer en production :**
1. **Remplacer Mailtrap** par un vrai service SMTP :
   ```bash
   # Gmail
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="votre@gmail.com"
   EMAIL_PASSWORD="mot-de-passe-app"
   
   # Ou SendGrid, Mailgun, AWS SES, etc.
   ```

2. **Garder la même logique** : Les emails iront aux vraies adresses

### 📊 **Interface Mailtrap**

#### **Fonctionnalités Utiles :**
- 📧 **Liste des emails** : Tous les emails interceptés
- 🔍 **Détails complets** : HTML, texte, headers
- 📱 **Aperçu mobile** : Comment l'email s'affiche sur mobile
- 📈 **Statistiques** : Nombre d'emails envoyés
- 🔗 **Partage** : Partager un email avec l'équipe

#### **Debugging :**
- ✅ **Vérifier le HTML** : Template s'affiche correctement
- ✅ **Tester les liens** : Tous les liens fonctionnent
- ✅ **Responsive** : Affichage mobile/desktop
- ✅ **Contenu** : Variables remplacées correctement

### 🚀 **Démarrage Rapide**

#### **1. Configurer Mailtrap**
```bash
# Créer compte sur mailtrap.io
# Créer une inbox
# Copier les identifiants SMTP
```

#### **2. Configurer l'Application**
```bash
# Ajouter les variables dans .env
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="votre_username"
MAILTRAP_PASSWORD="votre_password"
EMAIL_FROM="support@tolotanana.com"
ADMIN_EMAIL="admin@tolotanana.com"
```

#### **3. Redémarrer et Tester**
```bash
# Redémarrer le serveur
npm run start:dev

# Tester via l'interface web
# Vérifier les emails dans Mailtrap
```

### 💡 **Exemple de Configuration Complète**

```bash
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/tolotanana_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Mailtrap
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="1a2b3c4d5e6f7g"
MAILTRAP_PASSWORD="9z8y7x6w5v4u3t"
EMAIL_FROM="support@tolotanana.com"
ADMIN_EMAIL="admin@tolotanana.com"

# Serveur
PORT=4750
```

### 🎯 **Avantages de cette Configuration**

- ✅ **Développement sûr** : Pas d'envoi accidentel d'emails
- ✅ **Vraies adresses** : Test avec les vraies adresses utilisateurs
- ✅ **Templates complets** : Voir le rendu final
- ✅ **Debugging facile** : Interface web pour analyser
- ✅ **Gratuit** : Pas de coût pour les tests
- ✅ **Production ready** : Facile de passer en production

**Le système est maintenant configuré pour Mailtrap ! Configurez vos identifiants et testez immédiatement !** 🎉📧

---

### 🔧 **Support**

- **Mailtrap Docs** : https://help.mailtrap.io/
- **Plan gratuit** : 100 emails/mois, parfait pour le développement
- **Interface intuitive** : Facile à utiliser et comprendre
