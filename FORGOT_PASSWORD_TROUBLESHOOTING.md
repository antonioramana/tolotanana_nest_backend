# 🔧 Guide de dépannage - Mot de passe oublié

## ❌ Erreur: "Failed to fetch"

Cette erreur indique que le frontend ne peut pas se connecter au backend.

### 🚀 Solution 1: Démarrer le backend

1. **Ouvrez un terminal dans le dossier `tolotanana-backend`**
2. **Démarrez le backend:**
   ```bash
   npm run start:dev
   ```
   ou
   ```bash
   node start-backend-forgot-password.js
   ```

3. **Vérifiez que le backend est accessible:**
   - Ouvrez http://localhost:3000/health
   - Vous devriez voir: `{"status":"ok","timestamp":"..."}`

### 🧪 Solution 2: Tester l'API

1. **Dans le dossier `tolotanana-backend`, exécutez:**
   ```bash
   node test-forgot-password-api.js
   ```

2. **Vérifiez les résultats:**
   - ✅ Serveur accessible
   - ✅ Endpoint forgot-password fonctionne

### 🔧 Solution 3: Vérifier la configuration

1. **Vérifiez le fichier `tolotanana-frontend/lib/api.ts`:**
   ```javascript
   const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
   ```

2. **Vérifiez que le port 3000 est libre:**
   ```bash
   netstat -an | grep 3000
   ```

### 🗄️ Solution 4: Vérifier la base de données

1. **Générez le client Prisma:**
   ```bash
   cd tolotanana-backend
   npx prisma generate
   ```

2. **Appliquez les migrations:**
   ```bash
   npx prisma migrate deploy
   ```

### 📧 Solution 5: Configuration email

1. **Vérifiez la configuration email dans le backend**
2. **Pour les tests, utilisez Mailtrap ou Gmail**

### 🔍 Diagnostic complet

Si le problème persiste, exécutez ce diagnostic:

```bash
cd tolotanana-backend
node test-forgot-password-api.js
```

### 📱 Test du frontend

1. **Démarrez le frontend:**
   ```bash
   cd tolotanana-frontend
   npm run dev
   ```

2. **Testez la fonctionnalité:**
   - Allez sur http://localhost:3000/?auth=login
   - Cliquez sur "Mot de passe oublié ?"
   - Saisissez un email de test
   - Vérifiez que le code est envoyé

### 🎯 URLs importantes

- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:3000 (Next.js)
- **API Docs:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/health

### ⚠️ Ports par défaut

- **Backend NestJS:** 3000
- **Frontend Next.js:** 3000 (peut entrer en conflit)

Si vous avez un conflit de ports, modifiez le port du backend dans `main.ts`:
```typescript
const port = process.env.PORT || 3001; // Changez 3000 en 3001
```

Et mettez à jour `API_BASE` dans le frontend:
```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
```
