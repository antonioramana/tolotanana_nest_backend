# 🔧 Dépannage Gmail SMTP

## ❌ Erreur SSL "wrong version number"

### **Problème**
```
Error: 24280000:error:0A00010B:SSL routines:ssl3_get_record:wrong version number
```

### **Cause**
Configuration SSL/TLS incorrecte pour Gmail SMTP.

### **✅ Solution Appliquée**

#### **1. Configuration Corrigée**
```typescript
// Configuration Gmail optimisée
this.transporter = nodemailer.createTransporter({
  service: 'gmail',  // ← Utilise la config prédéfinie Gmail
  host: 'smtp.gmail.com',
  port: 587,         // ← Port STARTTLS recommandé
  secure: false,     // ← false pour port 587
  requireTLS: true,  // ← Force TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // ← Mot de passe d'application
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'  // ← Version TLS moderne
  }
});
```

#### **2. Ports Gmail Supportés**
| Port | Type | Secure | Description |
|------|------|--------|-------------|
| **587** | STARTTLS | `false` | **Recommandé** - TLS après connexion |
| 465 | SSL/TLS | `true` | SSL direct |
| 25 | Plain | `false` | Non sécurisé (déprécié) |

---

## 🔐 Configuration Gmail Requise

### **1. Créer un Compte Gmail Dédié**
```
Exemple: support@yourproject.com
```

### **2. Activer l'Authentification 2FA**
- Google Account → Sécurité
- Authentification à 2 facteurs → Activer

### **3. Générer un Mot de Passe d'Application**
- Google Account → Sécurité
- Authentification à 2 facteurs
- **Mots de passe des applications** → Générer

**Format reçu:**
```
abcd efgh ijkl mnop  (16 caractères avec espaces)
```

**Format à utiliser dans .env:**
```bash
EMAIL_PASSWORD="abcdefghijklmnop"  # Sans espaces
# OU avec tirets (optionnel)
EMAIL_PASSWORD="abcd-efgh-ijkl-mnop"
```

---

## 📋 Variables d'Environnement Gmail

### **Configuration Recommandée (.env)**
```bash
# Environnement
NODE_ENV=production

# Gmail SMTP
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="support@yourproject.com"
EMAIL_PASSWORD="abcdefghijklmnop"

# Email général
EMAIL_FROM="support@tolotanana.com"
ADMIN_EMAIL="admin@tolotanana.com"
```

### **Basculement Manuel**
```bash
# Force Gmail même en développement
EMAIL_PROVIDER="gmail"
```

---

## 🧪 Tests de Diagnostic

### **1. Test Rapide de Configuration**
```bash
node verify-email-config.js
```

### **2. Test de Démarrage**
```bash
NODE_ENV=production npm run start:dev
```

**Logs attendus :**
```
[LOG] 📧 Configuration Gmail SMTP (Production)
[LOG] ✅ Serveur email prêt (Gmail) - Délai: 1000ms
[LOG] 📧 Configuration Gmail: support@yourproject.com via port 587
```

### **3. Test d'Envoi Email**
```bash
curl -X POST http://localhost:3000/public/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Gmail SMTP",
    "message": "Test de la configuration Gmail"
  }'
```

---

## ⚠️ Erreurs Communes

### **1. Erreur d'Authentification**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solutions:**
- ✅ Vérifier que l'email Gmail est correct
- ✅ Utiliser un **mot de passe d'application** (pas le mot de passe Gmail normal)
- ✅ Vérifier que la 2FA est activée
- ✅ Régénérer le mot de passe d'application si nécessaire

### **2. Erreur de Connexion**
```
Error: connect ETIMEDOUT 74.125.24.108:587
```

**Solutions:**
- ✅ Vérifier la connexion internet
- ✅ Vérifier que le port 587 n'est pas bloqué par un firewall
- ✅ Essayer le port 465 avec `EMAIL_SECURE=true`

### **3. Erreur TLS/SSL**
```
Error: 24280000:error:0A00010B:SSL routines
```

**Solutions:**
- ✅ **[APPLIQUÉ]** Utiliser `service: 'gmail'` dans la configuration
- ✅ **[APPLIQUÉ]** Port 587 avec `secure: false`
- ✅ **[APPLIQUÉ]** `requireTLS: true` et `minVersion: 'TLSv1.2'`

---

## 🔄 Configuration Alternative (Port 465)

Si le port 587 ne fonctionne pas, essayez le port 465 :

```bash
# Dans votre .env
EMAIL_PORT=465
EMAIL_SECURE=true
```

La configuration s'adaptera automatiquement :
```typescript
secure: gmailPort === 465  // true pour 465, false pour 587
```

---

## 🎯 Configuration Finale Recommandée

### **Variables .env pour Gmail**
```bash
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=support@yourproject.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=support@tolotanana.com
ADMIN_EMAIL=admin@tolotanana.com
```

### **Commande de Test**
```bash
NODE_ENV=production npm run start:dev
```

### **Vérification Réussie**
```
✅ [LOG] 📧 Configuration Gmail SMTP (Production)
✅ [LOG] ✅ Serveur email prêt (Gmail) - Délai: 1000ms
✅ [LOG] 📧 Configuration Gmail: support@yourproject.com via port 587
```

---

## 🔍 Debug Avancé

### **Activer les Logs Nodemailer**
```typescript
// Dans email.service.ts (temporaire pour debug)
this.transporter = nodemailer.createTransporter({
  // ... configuration existante
  debug: true,  // ← Ajouter pour debug
  logger: true  // ← Ajouter pour logs détaillés
});
```

### **Variables de Debug**
```bash
DEBUG=nodemailer:* npm run start:dev
```

---

**🎉 Avec ces corrections, votre configuration Gmail devrait fonctionner parfaitement !**

