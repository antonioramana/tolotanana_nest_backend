# 🗄️ Guide des Commandes Prisma

## 📋 **Commandes Disponibles**

Toutes les commandes Prisma sont configurées dans `package.json` et peuvent être exécutées avec `npm run`.

### 🔧 **Commandes de Base**

#### **Génération du Client**
```bash
npm run prisma:generate
# Génère le client Prisma TypeScript
# À exécuter après chaque modification du schema
```

#### **Validation du Schéma**
```bash
npm run prisma:validate
# Valide la syntaxe du fichier schema.prisma
# Vérifie les erreurs de configuration
```

#### **Formatage du Schéma**
```bash
npm run prisma:format
# Formate automatiquement le fichier schema.prisma
# Organise et nettoie la syntaxe
```

### 🗃️ **Gestion de la Base de Données**

#### **Push des Changements**
```bash
npm run prisma:push
# Pousse les changements du schema vers la DB
# Utile pour le développement rapide
# ⚠️ Peut perdre des données en production
```

#### **Migrations**
```bash
# Créer une nouvelle migration
npm run prisma:migrate
# Équivaut à: prisma migrate dev

# Déployer les migrations (production)
npm run prisma:migrate:deploy

# Réinitialiser la base (ATTENTION: supprime tout)
npm run prisma:migrate:reset
```

### 🌱 **Seeding (Données de Test)**

#### **Peupler la Base**
```bash
npm run prisma:seed
# Exécute le fichier prisma/seed.ts
# Ajoute toutes les données de test
```

#### **Reset Complet + Seed**
```bash
npm run db:reset
# Réinitialise la DB + lance le seed
# Équivaut à: migrate reset + seed
```

### 🎛️ **Interface Graphique**

#### **Prisma Studio**
```bash
npm run prisma:studio
# Lance l'interface web pour gérer la DB
# Accessible sur http://localhost:5555
```

---

## 🚀 **Workflow de Développement**

### **🔄 Workflow Standard**

#### **1. Modification du Schéma**
```bash
# 1. Modifier prisma/schema.prisma
# 2. Valider les changements
npm run prisma:validate

# 3. Créer la migration
npm run prisma:migrate

# 4. Générer le client
npm run prisma:generate
```

#### **2. Développement Rapide**
```bash
# Pour des tests rapides (sans migration)
npm run prisma:push
npm run prisma:generate
```

#### **3. Données de Test**
```bash
# Peupler avec des données de test
npm run prisma:seed

# Ou reset complet + données
npm run db:reset
```

### **🏭 Workflow de Production**

#### **Déploiement**
```bash
# 1. Générer le client
npm run prisma:generate

# 2. Déployer les migrations
npm run prisma:migrate:deploy
```

---

## 📊 **Commandes par Cas d'Usage**

### **🆕 Nouveau Développeur**
```bash
# Setup initial
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### **🔄 Après Pull/Merge**
```bash
# Mettre à jour après changements
npm run prisma:generate
npm run prisma:migrate
```

### **🧪 Tests Locaux**
```bash
# Reset pour tests propres
npm run db:reset
```

### **🔍 Debug/Exploration**
```bash
# Interface graphique
npm run prisma:studio
```

### **📝 Modification de Schéma**
```bash
# 1. Modifier schema.prisma
# 2. Valider
npm run prisma:validate

# 3. Appliquer
npm run prisma:migrate

# 4. Générer client
npm run prisma:generate
```

---

## ⚠️ **Commandes Dangereuses**

### **🚨 ATTENTION - Perte de Données**

#### **Reset de Migration**
```bash
npm run prisma:migrate:reset
# ❌ SUPPRIME TOUTES LES DONNÉES
# ✅ Utiliser seulement en développement
```

#### **Push en Production**
```bash
npm run prisma:push
# ❌ Peut causer des pertes de données
# ✅ Utiliser seulement en développement
```

### **✅ Alternatives Sûres**

#### **Au lieu de Reset**
```bash
# Créer une nouvelle migration
npm run prisma:migrate
```

#### **Au lieu de Push**
```bash
# Utiliser les migrations
npm run prisma:migrate
npm run prisma:migrate:deploy
```

---

## 🛠️ **Configuration dans package.json**

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:seed": "prisma db seed",
    "prisma:push": "prisma db push",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:reset": "prisma migrate reset",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:format": "prisma format",
    "prisma:validate": "prisma validate",
    "db:reset": "prisma migrate reset --force && npm run prisma:seed"
  },
  "prisma": {
    "seed": "ts-node --transpile-only prisma/seed.ts"
  }
}
```

---

## 🎯 **Conseils et Bonnes Pratiques**

### **✅ À Faire**
- **Toujours valider** avant de migrer : `npm run prisma:validate`
- **Générer le client** après chaque changement de schéma
- **Utiliser les migrations** en production
- **Tester avec seed** en développement
- **Sauvegarder** avant les resets

### **❌ À Éviter**
- **Push en production** (utiliser migrate deploy)
- **Reset en production** (perte de données)
- **Oublier de générer** le client après changements
- **Modifier directement** la base sans migration

### **🔄 Routine Quotidienne**
```bash
# Matin - mise à jour
git pull
npm run prisma:generate
npm run prisma:migrate

# Développement - après modif schema
npm run prisma:validate
npm run prisma:migrate
npm run prisma:generate

# Tests - données fraîches
npm run db:reset
```

---

## 🎉 **Résumé des Commandes Essentielles**

| Commande | Usage | Fréquence |
|----------|-------|-----------|
| `npm run prisma:generate` | Générer client TS | Après chaque modif schema |
| `npm run prisma:migrate` | Créer migration | Après modif schema |
| `npm run prisma:seed` | Données de test | Pour tests/dev |
| `npm run prisma:studio` | Interface graphique | Debug/exploration |
| `npm run prisma:validate` | Valider schema | Avant migration |
| `npm run db:reset` | Reset + seed | Tests propres |

**Commande la plus utilisée :** `npm run prisma:generate` 🚀

**Votre base de données Prisma est maintenant parfaitement configurée ! 🎯✨**
