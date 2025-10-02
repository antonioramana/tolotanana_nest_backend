# 🌱 Guide du Fichier Seed Centralisé

## 📋 **Vue d'ensemble**

Tous les seeds ont été **centralisés** dans un seul fichier : `prisma/seed.ts`

### ✅ **Seeds Intégrés**

Le fichier `seed.ts` contient maintenant **tous** les seeds précédemment séparés :

1. **🏠 Seed Principal** (`seedMain`)
   - Utilisateurs (Admin, Donateur, Demandeur)
   - Catégories (Santé, Éducation, Environnement, Entrepreneuriat)
   - Campagnes de test (2 campagnes)
   - Donations de test (3 donations)
   - Favoris, mises à jour, messages de remerciement
   - Demandes de retrait

2. **🏦 Seed Admin Bank Info** (`seedAdminBankInfo`)
   - Informations bancaires de l'admin
   - Orange Money, Mvola, BOA, BNI
   - Mise à jour du téléphone admin

3. **💳 Seed Platform Fees** (`seedPlatformFees`)
   - Frais de plateforme par défaut (5%)
   - Configuration active

4. **💬 Seed Testimonials** (`seedTestimonials`)
   - 8 témoignages de test
   - 6 mis en avant pour la page d'accueil
   - Statistiques et notes moyennes

5. **📧 Seed Contact Messages** (`seedContactMessages`)
   - 5 messages de contact de test
   - Messages lus/non lus
   - Réponses d'admin

---

## 🚀 **Utilisation**

### **Commande Principale**
```bash
# Depuis la racine du projet backend
npx prisma db seed
```

### **Commande Alternative**
```bash
# Exécution directe avec ts-node
npx ts-node --transpile-only prisma/seed.ts
```

### **Avec npm script**
```bash
# Utiliser le script défini dans package.json
npm run prisma:seed
```

---

## 📊 **Données Créées**

### **👤 Utilisateurs**
| Email | Rôle | Mot de passe | Téléphone |
|-------|------|--------------|-----------|
| `admin@example.com` | Admin | `Admin@123` | `0341234567` |
| `donor@example.com` | Donateur | `Donor@123` | `+261331111111` |
| `requester@example.com` | Demandeur | `Requester@123` | `+261321222222` |

### **🏷️ Catégories**
- Santé
- Éducation
- Environnement
- Entrepreneuriat

### **📋 Campagnes**
1. **Opération chirurgicale urgente** (Santé)
   - Objectif : 5,000 Ar
   - Collecté : 225.50 Ar
   - 2 donateurs

2. **Fournitures scolaires pour l'année** (Éducation)
   - Objectif : 2,000 Ar
   - Collecté : 50 Ar
   - 1 donateur

### **🏦 Informations Bancaires Admin**
- **Orange Money** : `0341234567` (par défaut)
- **Mvola** : `0321234567`
- **Bank of Africa** : `1234567890123456`
- **BNI Madagascar** : `9876543210987654`

### **💳 Frais de Plateforme**
- **Pourcentage** : 5%
- **Description** : Frais par défaut pour coûts opérationnels
- **Statut** : Actif

### **💬 Témoignages**
- **Total** : 8 témoignages
- **Mis en avant** : 6 (affichés sur la page d'accueil)
- **Note moyenne** : 4.875/5
- **Rôles** : Bénéficiaires, Créateurs, Donateurs/Donatrices

### **📧 Messages de Contact**
- **Total** : 5 messages
- **Non lus** : 2 messages
- **Répondus** : 2 messages
- **Sujets** : Frais, problèmes techniques, partenariats, etc.

---

## 🔧 **Configuration**

### **Package.json**
```json
{
  "prisma": {
    "seed": "ts-node --transpile-only prisma/seed.ts"
  }
}
```

### **Scripts Disponibles**
```json
{
  "scripts": {
    "prisma:seed": "prisma db seed",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

---

## 🛡️ **Sécurité et Logique**

### **Vérifications Intégrées**
- ✅ **Upsert** : Évite les doublons pour les utilisateurs et catégories
- ✅ **Vérifications d'existence** : Ne recrée pas les données existantes
- ✅ **Relations** : Utilise les IDs des entités créées
- ✅ **Gestion d'erreurs** : Try/catch avec messages explicites

### **Ordre d'Exécution**
1. **Utilisateurs** → Créés en premier (nécessaires pour les relations)
2. **Catégories** → Nécessaires pour les campagnes
3. **Campagnes et données liées** → Utilisent les utilisateurs et catégories
4. **Admin Bank Info** → Utilise l'admin créé
5. **Platform Fees** → Utilise l'admin créé
6. **Testimonials** → Utilise l'admin créé
7. **Contact Messages** → Utilise l'admin créé

---

## 🎯 **Avantages du Fichier Centralisé**

### **✅ Avant (Fichiers Séparés)**
- ❌ 5 fichiers différents à exécuter
- ❌ Ordre d'exécution manuel
- ❌ Gestion des dépendances complexe
- ❌ Risque d'oublier un seed

### **✅ Après (Fichier Centralisé)**
- ✅ **Une seule commande** pour tout
- ✅ **Ordre automatique** et logique
- ✅ **Gestion des relations** intégrée
- ✅ **Logs détaillés** et organisés
- ✅ **Vérifications d'existence** pour éviter les doublons
- ✅ **Statistiques finales** complètes

---

## 📝 **Logs de Sortie**

### **Exemple d'Exécution Réussie**
```
🚀 Démarrage de tous les seeds...

🌱 Seeding main data...
✅ Main seed completed

🌱 Seeding admin bank info...
✅ Utilisateur admin trouvé: Admin User
✅ Téléphone mis à jour: 0341234567
✅ Info bancaire créée: Orange Money - 0341234567
✅ Info bancaire créée: Mvola - 0321234567
✅ Info bancaire créée: Bank of Africa - 1234567890123456
✅ Info bancaire créée: BNI Madagascar - 9876543210987654
✅ Admin bank info seed completed

🌱 Seeding platform fees...
✅ Frais de plateforme créés avec succès: { id: '...', percentage: 5, ... }

🌱 Seeding testimonials...
✅ 8 témoignages ajoutés avec succès !
📊 Statistiques des témoignages :
   Bénéficiaire (Mis en avant): 2
   Créateur de campagne (Mis en avant): 2
   Donatrice (Mis en avant): 2
   Donateur: 1
   Bénéficiaire: 1
⭐ Note moyenne : 4.875/5

🌱 Seeding contact messages...
✅ 5 messages de contact ajoutés avec succès !
📊 Statistiques des messages :
   Non lus: 2
   Répondus: 2
   Lus: 1

🎉 Tous les seeds ont été exécutés avec succès!

📊 Résumé des données créées :
   👤 Utilisateurs : Admin, Donateur, Demandeur
   🏷️  Catégories : Santé, Éducation, Environnement, Entrepreneuriat
   📋 Campagnes : 2 campagnes de test
   💰 Donations : 3 donations de test
   🏦 Infos bancaires : Admin + Demandeur
   💳 Frais de plateforme : 5% par défaut
   💬 Témoignages : 8 témoignages (6 mis en avant)
   📧 Messages contact : 5 messages de test

✨ Votre base de données est prête à être utilisée !
```

---

## 🔄 **Réexécution**

### **Comportement Intelligent**
Le seed peut être **réexécuté sans problème** :
- ✅ **Upsert** pour les utilisateurs et catégories
- ✅ **Vérifications d'existence** pour éviter les doublons
- ✅ **Messages informatifs** si les données existent déjà

### **Nettoyage (si nécessaire)**
```bash
# Réinitialiser complètement la base
npx prisma migrate reset

# Puis relancer le seed
npx prisma db seed
```

---

## 🎉 **Résumé**

### **🏆 Mission Accomplie**
- ✅ **5 seeds séparés** → **1 fichier centralisé**
- ✅ **Exécution manuelle** → **Une seule commande**
- ✅ **Gestion complexe** → **Automatisation complète**
- ✅ **Risque d'erreurs** → **Logique robuste**

### **🚀 Utilisation Simple**
```bash
# Une seule commande pour tout créer !
npx prisma db seed
```

**Votre base de données sera entièrement peuplée avec toutes les données de test nécessaires ! 🎯✨**
