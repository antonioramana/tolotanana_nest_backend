# Configuration Email - Mailtrap et Gmail

## Variables d'Environnement Requises

### Configuration Générale
```bash
# Email settings
EMAIL_FROM="support@tolotanana.com"
ADMIN_EMAIL="admin@tolotanana.com"
NODE_ENV=development  # ou production
```

### Pour Mailtrap (Développement)
```bash
# Variables Mailtrap
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="your_mailtrap_username"
MAILTRAP_PASSWORD="your_mailtrap_password"
```

### Pour Gmail (Production)
```bash
# Variables Gmail
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
```

### Options Avancées
```bash
# Forcer un provider spécifique (optionnel)
EMAIL_PROVIDER="gmail"  # ou "mailtrap"

# Désactiver notifications admin
SEND_ADMIN_NOTIFICATIONS=false

# Délai personnalisé entre emails
MIN_EMAIL_DELAY=1000
```

## Fonctionnement Automatique

### Basculement selon NODE_ENV
- **development** → Utilise Mailtrap
- **production** → Utilise Gmail

### Basculement Manuel
Utilisez `EMAIL_PROVIDER="gmail"` pour forcer Gmail même en développement.

## Configuration Gmail

1. **Créer un compte Gmail dédié**
2. **Activer l'authentification à 2 facteurs**
3. **Générer un mot de passe d'application :**
   - Google Account → Sécurité → Authentification à 2 facteurs → Mots de passe des applications
4. **Utiliser ce mot de passe dans EMAIL_PASSWORD**

## Configuration Mailtrap

1. **Créer un compte sur https://mailtrap.io**
2. **Créer une inbox**
3. **Copier les credentials SMTP**

## Exemple de .env

```bash
# Base
NODE_ENV=development
EMAIL_FROM="support@tolotanana.com"
ADMIN_EMAIL="admin@tolotanana.com"

# Mailtrap (dev)
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="1a2b3c4d5e6f7g"
MAILTRAP_PASSWORD="9h8i7j6k5l4m3n"

# Gmail (prod)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="support@yourproject.com"
EMAIL_PASSWORD="abcd-efgh-ijkl-mnop"
```

