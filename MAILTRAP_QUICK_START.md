# 🚀 Démarrage Rapide Mailtrap - TOLOTANANA

## ✅ **Configuration Mailtrap en 5 Minutes**

### 📋 **Étape 1 : Créer un Compte Mailtrap**

1. **Aller sur** : https://mailtrap.io/
2. **Cliquer** "Sign Up" 
3. **S'inscrire** avec votre email
4. **Vérifier** votre email et activer le compte

### 📧 **Étape 2 : Créer une Inbox**

1. **Se connecter** à Mailtrap
2. **Cliquer** "Add Inbox" ou utiliser l'inbox par défaut
3. **Nommer** l'inbox (ex: "TOLOTANANA Dev")

### 🔧 **Étape 3 : Obtenir les Identifiants SMTP**

1. **Cliquer** sur votre inbox
2. **Aller** dans l'onglet "SMTP Settings"
3. **Sélectionner** "Nodemailer" dans le dropdown
4. **Copier** les informations affichées

Vous verrez quelque chose comme :
```javascript
var transport = nodemailer.createTransporter({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "1a2b3c4d5e6f7g",      // ← Copier cette valeur
    pass: "9z8y7x6w5v4u3t2s"     // ← Copier cette valeur
  }
});
```

### ⚙️ **Étape 4 : Configurer les Variables**

Ajoutez ces lignes à votre fichier `.env` :

```bash
# Configuration Mailtrap
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="1a2b3c4d5e6f7g"        # ← Remplacer par votre user
MAILTRAP_PASSWORD="9z8y7x6w5v4u3t2s"   # ← Remplacer par votre password

# Adresses email
EMAIL_FROM="support@tolotanana.com"
ADMIN_EMAIL="admin@tolotanana.com"
```

### 🧪 **Étape 5 : Tester la Configuration**

```bash
# Tester la connexion Mailtrap
node test-mailtrap.js
```

**Résultat attendu :**
```
🧪 Test de configuration Mailtrap...
🔗 Test de connexion Mailtrap...
✅ Connexion Mailtrap réussie !
📧 Envoi d'un email de test...
✅ Email de test envoyé avec succès !
🎉 Configuration Mailtrap validée !
```

### 📧 **Étape 6 : Vérifier l'Email de Test**

1. **Retourner** sur https://mailtrap.io/inboxes
2. **Cliquer** sur votre inbox
3. **Voir** l'email de test qui vient d'arriver
4. **Vérifier** que le destinataire est `user.test@example.com`

### 🚀 **Étape 7 : Tester le Système Complet**

1. **Démarrer** le serveur backend :
   ```bash
   npm run start:dev
   ```

2. **Aller** sur le site : `http://localhost:3000/contact`

3. **Envoyer** un message avec votre **vraie adresse email**

4. **Vérifier** dans Mailtrap :
   - Email de confirmation à votre adresse
   - Notification admin à `admin@tolotanana.com`

5. **Répondre** via l'interface admin : `/admin/contact`

6. **Vérifier** l'email de réponse dans Mailtrap

### 🎯 **Ce que Vous Devriez Voir**

#### **Dans Mailtrap :**
- ✅ **Emails interceptés** avec vraies adresses de destination
- ✅ **Templates HTML** complets et professionnels
- ✅ **Contenu personnalisé** avec noms et messages réels

#### **Workflow Complet :**
1. **Message envoyé** → 2 emails dans Mailtrap (confirmation + notification)
2. **Admin répond** → 1 email dans Mailtrap (réponse à l'utilisateur)
3. **Vraies adresses** utilisées partout

### 🔧 **Dépannage**

#### **Erreur d'authentification :**
```bash
# Vérifiez vos identifiants
MAILTRAP_USER="votre_user_correct"
MAILTRAP_PASSWORD="votre_password_correct"
```

#### **Pas d'emails dans Mailtrap :**
- Vérifiez que vous regardez la bonne inbox
- Vérifiez les logs du serveur backend
- Relancez le test : `node test-mailtrap.js`

#### **Variables non trouvées :**
```bash
# Vérifiez que le fichier .env existe
# Vérifiez que les variables sont bien définies
# Redémarrez le serveur après modification
```

### 📊 **Exemple de Configuration Complète**

```bash
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/tolotanana_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Mailtrap (remplacez par vos vraies valeurs)
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="1a2b3c4d5e6f7g"
MAILTRAP_PASSWORD="9z8y7x6w5v4u3t2s"

# Emails
EMAIL_FROM="support@tolotanana.com"
ADMIN_EMAIL="admin@tolotanana.com"

# Serveur
PORT=4750
```

### 🎉 **Résultat Final**

Après configuration, vous aurez :

- ✅ **Emails de confirmation** envoyés aux vraies adresses utilisateurs
- ✅ **Notifications admin** pour chaque nouveau message
- ✅ **Réponses par email** quand l'admin répond
- ✅ **Tous les emails** interceptés et visibles dans Mailtrap
- ✅ **Templates professionnels** avec design TOLOTANANA
- ✅ **Aucun email** envoyé réellement (sécurisé pour le dev)

**Suivez ces étapes et votre système d'email sera opérationnel en 5 minutes !** 🚀📧

---

### 💡 **Conseils**

- **Plan gratuit** : 100 emails/mois, parfait pour le développement
- **Multiple inboxes** : Créez des inboxes séparées pour différents projets
- **Partage d'équipe** : Invitez votre équipe à voir les emails
- **Analyse** : Utilisez les outils Mailtrap pour analyser vos emails
