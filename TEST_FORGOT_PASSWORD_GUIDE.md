# 🧪 Guide de test - Formulaire de réinitialisation de mot de passe

## 🎯 Objectif
Tester le flux complet de réinitialisation de mot de passe avec code à 6 chiffres.

## 🚀 Étapes de test

### 1. Démarrer le backend
```bash
cd tolotanana-backend
npm run start:dev
```
**Vérifiez :** http://localhost:4750/health

### 2. Démarrer le frontend
```bash
cd tolotanana-frontend
npm run dev
```
**Vérifiez :** http://localhost:3000

### 3. Tester le flux complet

#### Option A: Test via le modal d'authentification
1. Allez sur http://localhost:3000/?auth=login
2. Cliquez sur "Mot de passe oublié ?"
3. Saisissez un email de test
4. Cliquez sur "Envoyer le code de vérification"
5. **Vérifiez :** Le code s'affiche (en mode développement)
6. Cliquez sur "Continuer vers la réinitialisation"
7. **Vérifiez :** Le formulaire de nouveau mot de passe apparaît

#### Option B: Test via la page dédiée
1. Allez sur http://localhost:3000/test-forgot-flow
2. Cliquez sur "Commencer le test"
3. Suivez les étapes du flux

## 🔍 Points de vérification

### ✅ Étape 1: Demande de réinitialisation
- [ ] Formulaire avec champ email
- [ ] Validation de l'email
- [ ] Bouton "Envoyer le code de vérification"
- [ ] Message de succès avec code affiché (dev)

### ✅ Étape 2: Code de vérification
- [ ] Code à 6 chiffres affiché
- [ ] Bouton "Continuer vers la réinitialisation"
- [ ] Bouton "Réinitialiser le formulaire"
- [ ] Bouton "Retour à la connexion"

### ✅ Étape 3: Nouveau mot de passe
- [ ] Champ "Code de vérification" (6 chiffres)
- [ ] Champ "Nouveau mot de passe" (avec affichage/masquage)
- [ ] Champ "Confirmer le mot de passe"
- [ ] Bouton "Réinitialiser le mot de passe"
- [ ] Bouton "Retour à la demande"

## 🛠️ Résolution de problèmes

### ❌ Problème: "Failed to fetch"
**Solution :**
1. Vérifiez que le backend est démarré sur le port 4750
2. Testez l'API : `node test-forgot-password-api.js`
3. Vérifiez la configuration CORS

### ❌ Problème: Formulaire ne s'affiche pas
**Solution :**
1. Vérifiez que `activeTab` passe à `'reset-password'`
2. Vérifiez que `forgotPasswordEmail` est défini
3. Ouvrez les outils de développement pour voir les erreurs

### ❌ Problème: Code non affiché
**Solution :**
1. Vérifiez que `NODE_ENV=development`
2. Vérifiez la réponse de l'API dans la console
3. Vérifiez que `verificationCode` est retourné par le backend

## 📱 URLs de test

- **Test complet :** http://localhost:3000/test-forgot-flow
- **Modal auth :** http://localhost:3000/?auth=login
- **API Health :** http://localhost:4750/health
- **API Docs :** http://localhost:4750/api/docs

## 🔧 Configuration requise

### Backend (port 4750)
- ✅ NestJS démarré
- ✅ Base de données accessible
- ✅ Configuration email (Mailtrap ou Gmail)
- ✅ Endpoints `/auth/forgot-password` et `/auth/reset-password`

### Frontend (port 3000)
- ✅ Next.js démarré
- ✅ `API_BASE` configuré sur `http://localhost:4750`
- ✅ Composants `ForgotPasswordForm` et `ResetPasswordForm`

## 📊 Résultats attendus

1. **Demande réussie :** Code affiché + passage automatique
2. **Réinitialisation réussie :** Redirection vers la connexion
3. **Gestion d'erreurs :** Messages clairs pour chaque cas
4. **Interface fluide :** Navigation intuitive entre les étapes

## 🎉 Succès
Si tout fonctionne, vous devriez voir :
- Code de vérification affiché
- Formulaire de nouveau mot de passe
- Réinitialisation réussie
- Redirection vers la connexion
