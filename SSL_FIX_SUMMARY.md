# 🔧 Correction de l'Erreur SSL Gmail

## ❌ **Erreur Originale**
```
[ERROR] Error: 24280000:error:0A00010B:SSL routines:ssl3_get_record:wrong version number
```

## ✅ **Corrections Appliquées**

### **1. Configuration Gmail Optimisée**

#### **Avant:**
```typescript
this.transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user, pass },
  tls: { rejectUnauthorized: false }
});
```

#### **Après:**
```typescript
this.transporter = nodemailer.createTransport({
  service: 'gmail',          // ← Utilise la config prédéfinie Gmail
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,             // ← false pour port 587 (STARTTLS)
  requireTLS: true,          // ← Force TLS
  auth: { user, pass },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'    // ← Version TLS moderne
  },
  // Timeouts ajoutés
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 75000
});
```

### **2. Détection Automatique de Port**
```typescript
const gmailPort = this.configService.get<number>('EMAIL_PORT', 587);
secure: gmailPort === 465,  // Auto: true pour 465, false pour 587
```

### **3. Diagnostic d'Erreur Amélioré**
```typescript
if (error.message.includes('SSL') || error.message.includes('TLS')) {
  this.logger.error('💡 Conseil: Vérifiez la configuration SSL/TLS');
  this.logger.error('   - Port 587 avec STARTTLS (secure: false)');
  this.logger.error('   - Port 465 avec SSL (secure: true)');
}
```

---

## 🎯 **Changements Clés**

### **✅ Ajout de `service: 'gmail'`**
- Utilise la configuration Gmail prédéfinie de Nodemailer
- Résout automatiquement les problèmes SSL/TLS communs

### **✅ Ajout de `requireTLS: true`**
- Force l'utilisation de TLS pour la sécurité
- Évite les connexions non sécurisées

### **✅ Ajout de `minVersion: 'TLSv1.2'`**
- Utilise une version TLS moderne et sécurisée
- Évite les anciens protocoles SSL vulnérables

### **✅ Timeouts Configurés**
- Évite les timeouts sur connexions lentes
- Améliore la stabilité de la connexion

---

## 📊 **Ports Gmail Supportés**

| Port | Type | Secure | Configuration |
|------|------|--------|---------------|
| **587** | STARTTLS | `false` | **Recommandé** |
| 465 | SSL/TLS | `true` | Alternative |

### **Configuration Automatique:**
```typescript
const port = process.env.EMAIL_PORT || 587;
secure: port === 465  // Auto-détection
```

---

## 🧪 **Test de Validation**

### **Variables .env Requises:**
```bash
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-app
```

### **Démarrage du Serveur:**
```bash
npm run start:dev
```

### **Logs Attendus (Succès):**
```
[LOG] 📧 Configuration Gmail SMTP (Production)
[LOG] ✅ Serveur email prêt (Gmail) - Délai: 1000ms
[LOG] 📧 Configuration Gmail: votre@gmail.com via port 587
```

### **En Cas d'Erreur:**
```
[ERROR] 💡 Conseil: Vérifiez la configuration SSL/TLS
[ERROR]    - Port 587 avec STARTTLS (secure: false)
[ERROR]    - Port 465 avec SSL (secure: true)
```

---

## 🔍 **Scripts de Debug**

### **1. Test de Configuration:**
```bash
node verify-email-config.js
```

### **2. Test de Connexion Gmail:**
```bash
node test-gmail-connection.js
```

### **3. Guide de Dépannage:**
```bash
cat GMAIL_TROUBLESHOOTING.md
```

---

## ⚠️ **Points Importants**

### **Mot de Passe d'Application Gmail**
- **❌ NE PAS** utiliser votre mot de passe Gmail normal
- **✅ UTILISER** un mot de passe d'application Gmail
- Générer via: Google Account → Sécurité → 2FA → Mots de passe des applications

### **Format du Mot de Passe:**
```bash
# Reçu de Gmail (avec espaces)
abcd efgh ijkl mnop

# À utiliser dans .env (sans espaces)
EMAIL_PASSWORD=abcdefghijklmnop
```

### **2FA Requis**
- L'authentification à 2 facteurs DOIT être activée sur Gmail
- Sinon, les mots de passe d'application ne sont pas disponibles

---

## 🎉 **Résultat**

Avec ces corrections, l'erreur SSL `wrong version number` devrait être résolue.

### **Configuration Finale Recommandée:**
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

**🚀 Redémarrez votre serveur avec `npm run start:dev` pour tester !**

