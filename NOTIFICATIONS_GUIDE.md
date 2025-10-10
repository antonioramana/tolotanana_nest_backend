# 🔔 Guide de test - Système de notifications en temps réel

## 📋 Vue d'ensemble

Le système de notifications en temps réel utilise Socket.IO pour envoyer des notifications instantanées aux utilisateurs connectés. Il comprend :

- **Backend** : Gateway WebSocket, Service de notifications, Contrôleur API
- **Frontend** : Hook Socket.IO, Composant NotificationBell, Intégration dans le header

## 🚀 Démarrage rapide

### 1. Démarrer le backend
```bash
cd tolotanana-backend
npm run start:dev
```

### 2. Démarrer le frontend
```bash
cd tolotanana-frontend
npm run dev
```

### 3. Accéder à la page de test
- **URL** : http://localhost:3000/test-notifications
- **Fonctionnalité** : Test complet du système de notifications

## 🧪 Tests à effectuer

### Test 1 : Connexion WebSocket
1. Ouvrir la page de test
2. Vérifier que le statut montre "Connecté" (point vert)
3. Si déconnecté, vérifier la console pour les erreurs

### Test 2 : Notification serveur
1. Cliquer sur "Envoyer notification serveur"
2. Vérifier que la notification apparaît dans la liste
3. Vérifier que le compteur de notifications non lues s'incrémente

### Test 3 : Notification locale
1. Cliquer sur "Ajouter notification locale"
2. Vérifier l'affichage immédiat dans la liste
3. Vérifier l'incrémentation du compteur

### Test 4 : Composant NotificationBell
1. Cliquer sur l'icône de cloche dans le header
2. Vérifier l'ouverture du dropdown
3. Tester le marquage des notifications comme lues
4. Tester "Tout marquer comme lu"

### Test 5 : Notifications de dons
1. Se connecter avec un compte créateur de campagne
2. Faire un don sur une campagne
3. Vérifier que le créateur reçoit une notification en temps réel

## 🔧 Configuration

### Variables d'environnement

#### Backend (.env)
```env
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:4750
```

### Ports par défaut
- **Backend** : 4750
- **Frontend** : 3000
- **WebSocket** : 4750 (même port que le backend)

## 📡 Types de notifications

### 1. Notifications de dons
- **Déclencheur** : Nouveau don reçu
- **Destinataire** : Créateur de la campagne
- **Type** : `success`
- **Message** : "Vous avez reçu un don de X Ar de [Nom du donateur]"

### 2. Notifications de mises à jour de campagne
- **Déclencheur** : Nouvelle mise à jour publiée
- **Destinataire** : Suiveurs de la campagne
- **Type** : `info`
- **Message** : "La campagne '[Titre]' a été mise à jour"

### 3. Notifications d'objectif atteint
- **Déclencheur** : Objectif financier atteint
- **Destinataire** : Créateur de la campagne
- **Type** : `success`
- **Message** : "Félicitations ! Votre campagne '[Titre]' a atteint son objectif"

### 4. Notifications de demandes de retrait
- **Déclencheur** : Nouvelle demande de retrait
- **Destinataire** : Administrateurs
- **Type** : `warning`
- **Message** : "[Nom] demande un retrait de X Ar"

### 5. Notifications système
- **Déclencheur** : Événements système
- **Destinataire** : Utilisateurs spécifiques ou tous
- **Type** : `info`, `success`, `warning`, `error`

## 🐛 Dépannage

### Problème : WebSocket non connecté
**Causes possibles :**
- Token JWT invalide ou expiré
- Backend non démarré
- Problème de CORS
- Port incorrect

**Solutions :**
1. Vérifier la console du navigateur
2. Vérifier que le backend est démarré sur le port 4750
3. Vérifier le token JWT dans le localStorage
4. Se reconnecter si nécessaire

### Problème : Notifications non reçues
**Causes possibles :**
- Utilisateur non connecté au WebSocket
- Erreur dans le service de notifications
- Problème de permissions

**Solutions :**
1. Vérifier le statut de connexion WebSocket
2. Vérifier les logs du backend
3. Tester avec une notification de test

### Problème : Interface non mise à jour
**Causes possibles :**
- État React non synchronisé
- Composant non monté
- Erreur dans le hook useSocket

**Solutions :**
1. Vérifier la console pour les erreurs React
2. Rafraîchir la page
3. Vérifier l'implémentation du hook useSocket

## 📊 Monitoring

### Logs à surveiller

#### Backend
```bash
# Connexions WebSocket
[NotificationsGateway] Utilisateur {userId} connecté (socket: {socketId})
[NotificationsGateway] Utilisateur {userId} déconnecté (socket: {socketId})

# Notifications envoyées
[NotificationsGateway] Notification envoyée à l'utilisateur {userId}
[NotificationsGateway] Utilisateur {userId} non connecté, notification non envoyée
```

#### Frontend
```bash
# Connexion WebSocket
Connecté aux notifications en temps réel
Déconnecté des notifications

# Notifications reçues
Nouvelle notification reçue: {notification}
```

## 🔒 Sécurité

### Authentification
- Toutes les connexions WebSocket nécessitent un token JWT valide
- Les tokens sont vérifiés à chaque connexion
- Les utilisateurs non authentifiés sont déconnectés automatiquement

### Autorisation
- Les notifications sont envoyées uniquement aux utilisateurs autorisés
- Chaque notification contient l'ID de l'utilisateur destinataire
- Les utilisateurs ne peuvent voir que leurs propres notifications

## 🚀 Améliorations futures

### Fonctionnalités à ajouter
1. **Persistance** : Stocker les notifications en base de données
2. **Historique** : Page dédiée aux notifications passées
3. **Préférences** : Paramètres de notification par utilisateur
4. **Push notifications** : Notifications du navigateur
5. **Email** : Notifications par email pour les événements importants
6. **Mobile** : Support des notifications push mobiles

### Optimisations
1. **Redis** : Utiliser Redis pour la gestion des connexions
2. **Clustering** : Support du clustering pour la scalabilité
3. **Rate limiting** : Limiter le nombre de notifications par utilisateur
4. **Compression** : Compresser les données WebSocket

## 📝 Notes importantes

- Le système utilise actuellement une Map en mémoire pour stocker les connexions
- En production, utiliser Redis pour la persistance des connexions
- Les notifications de test sont automatiquement supprimées
- Le système fonctionne uniquement pour les utilisateurs connectés
- Les notifications non lues sont mises en évidence visuellement



