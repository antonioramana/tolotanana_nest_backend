# 📧 Configuration Email - Mailtrap vs Gmail selon NODE_ENV

## ✅ Modifications Appliquées

### 🔧 **1. Service Email Modifié**
**Fichier:** `src/email/email.service.ts`

**Changements:**
- ✅ Détection automatique de l'environnement (`NODE_ENV`)
- ✅ Configuration Gmail pour production (`NODE_ENV=production`)
- ✅ Configuration Mailtrap pour développement (`NODE_ENV=development`)
- ✅ Basculement manuel via `EMAIL_PROVIDER` 
- ✅ Rate limiting adaptatif (1s Gmail, 3s Mailtrap)
- ✅ Délai personnalisable via `MIN_EMAIL_DELAY`
- ✅ Logs informatifs pour identifier la configuration active

### 📋 **2. Documentation Créée**
- ✅ `EMAIL_ENV_CONFIGURATION.md` - Guide complet des variables
- ✅ `EMAIL_CONFIGURATION_SUMMARY.md` - Ce résumé
- ✅ Scripts de test et vérification

### 🧪 **3. Scripts de Test**
- ✅ `test-email-config.js` - Test des configurations
- ✅ `test-email-startup.js` - Simulation de démarrage
- ✅ `verify-email-config.js` - Vérification des modifications

---

## 🎯 **Fonctionnement Automatique**

### **Développement** (Mailtrap)
```bash
NODE_ENV=development npm run start:dev
```
**Résultat:**
- 📧 Utilise Mailtrap SMTP
- ⏱️ Délai de 3 secondes entre emails
- 📬 Emails capturés dans Mailtrap (pas d'envoi réel)

### **Production** (Gmail)
```bash
NODE_ENV=production npm run start:dev
```
**Résultat:**
- 📧 Utilise Gmail SMTP
- ⏱️ Délai de 1 seconde entre emails
- 📬 Emails réellement envoyés via Gmail

---

## ⚙️ **Basculement Manuel**

### **Forcer Gmail en Développement**
```bash
EMAIL_PROVIDER=gmail npm run start:dev
```

### **Forcer Mailtrap en Production**
```bash
EMAIL_PROVIDER=mailtrap npm run start:dev
```

### **Délai Personnalisé**
```bash
MIN_EMAIL_DELAY=500 npm run start:dev
```

---

## 🔧 **Variables d'Environnement**

### **Base (Toujours Requises)**
```bash
EMAIL_FROM="support@tolotanana.com"
ADMIN_EMAIL="admin@tolotanana.com"
NODE_ENV=development  # ou production
```

### **Mailtrap (Développement)**
```bash
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="votre_username"
MAILTRAP_PASSWORD="votre_password"
```

### **Gmail (Production)**
```bash
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="votre@gmail.com"
EMAIL_PASSWORD="votre-app-password"
```

### **Options Avancées**
```bash
EMAIL_PROVIDER=gmail          # Force un provider
MIN_EMAIL_DELAY=1000         # Délai personnalisé (ms)
SEND_ADMIN_NOTIFICATIONS=false  # Désactive notifications admin
```

---

## 🚀 **Configuration Gmail**

### **Étapes pour Gmail:**
1. **Créer un compte Gmail dédié** (ex: support@yourproject.com)
2. **Activer l'authentification à 2 facteurs**
3. **Générer un mot de passe d'application:**
   - Google Account → Sécurité → 2FA → Mots de passe des applications
4. **Utiliser ce mot de passe dans `EMAIL_PASSWORD`**

### **Format du mot de passe d'application:**
```
abcd-efgh-ijkl-mnop  (16 caractères avec tirets)
```

---

## 🧪 **Tests de Configuration**

### **Vérifier la Configuration**
```bash
node verify-email-config.js
```

### **Tester les Différentes Configurations**
```bash
node test-email-config.js
```

### **Simuler le Démarrage**
```bash
node test-email-startup.js
```

---

## 📊 **Avantages de Cette Implémentation**

### ✅ **Flexibilité Maximale**
- Basculement automatique selon l'environnement
- Force manual possible pour debug/test
- Rate limiting adaptatif

### ✅ **Maintenabilité**
- Un seul service pour les deux providers
- Configuration centralisée via variables d'environnement
- Logs clairs pour identifier la configuration active

### ✅ **Robustesse**
- Délais respectés pour éviter les rate limits
- Gestion d'erreur gracieuse
- Valeurs par défaut sécurisées

---

## 🎯 **Impact sur le Code Existant**

### **❌ AUCUN Changement Requis Dans:**
- Controllers de contact
- Templates HTML d'emails
- Logique métier
- APIs frontend
- Fonctions d'envoi (`sendContactConfirmation`, etc.)

### **✅ SEUL Changement:**
- Configuration du transporter Nodemailer selon l'environnement

---

## 🔍 **Logs de Démarrage**

### **Développement (Mailtrap):**
```
[LOG] 📧 Configuration Mailtrap SMTP (Développement)
[LOG] ✅ Serveur email prêt (Mailtrap) - Délai: 3000ms
```

### **Production (Gmail):**
```
[LOG] 📧 Configuration Gmail SMTP (Production)
[LOG] ✅ Serveur email prêt (Gmail) - Délai: 1000ms
```

---

## 🎉 **Configuration Terminée!**

Votre service email peut maintenant basculer automatiquement entre Mailtrap (développement) et Gmail (production) selon la variable `NODE_ENV`, avec possibilité de forcer manuellement un provider spécifique.

**Prochaines étapes:**
1. Ajoutez vos vraies credentials dans `.env`
2. Testez avec `npm run start:dev`
3. Vérifiez les logs de démarrage
4. Testez l'envoi via l'API de contact

