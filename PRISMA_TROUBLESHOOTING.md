# 🔧 Guide de Résolution des Problèmes Prisma

## ⚠️ **Erreurs Courantes et Solutions**

### 🚨 **Erreur : "Property 'modelName' does not exist on type 'PrismaClient'"**

#### **Symptômes**
```typescript
error TS2339: Property 'contactMessage' does not exist on type 'PrismaClient'
error TS2339: Property 'platformFees' does not exist on type 'PrismaService'
error TS2339: Property 'testimonial' does not exist on type 'PrismaService'
```

#### **Cause**
Le client Prisma n'a **pas été régénéré** après l'ajout de nouveaux modèles dans `schema.prisma`.

#### **✅ Solution**
```bash
# 1. Régénérer le client Prisma
npm run prisma:generate

# 2. Recompiler le projet
npm run build
```

#### **🔄 Workflow Correct**
```bash
# Après toute modification du schema.prisma :
1. npm run prisma:validate    # Valider le schéma
2. npm run prisma:migrate     # Créer/appliquer les migrations
3. npm run prisma:generate    # Régénérer le client
4. npm run build              # Compiler le projet
```

---

## 🗄️ **Erreurs de Base de Données**

### 🚨 **Erreur : "Table does not exist in the current database"**

#### **Symptômes**
```
PrismaClientKnownRequestError: The table `public.users` does not exist
```

#### **Cause**
Les migrations n'ont **pas été appliquées** à la base de données.

#### **✅ Solution**
```bash
# Appliquer les migrations
npm run prisma:migrate

# Ou pour une nouvelle base de données
npm run prisma:migrate:deploy
```

### 🚨 **Erreur : "Environment variable not found"**

#### **Symptômes**
```
Environment variable not found: DATABASE_URL
```

#### **Cause**
Le fichier `.env` est manquant ou mal configuré.

#### **✅ Solution**
```bash
# 1. Vérifier que .env existe
ls -la .env

# 2. Vérifier le contenu
cat .env

# 3. Exemple de configuration correcte
DATABASE_URL="postgresql://user:password@localhost:5432/tolotanana_db"
```

---

## 🔄 **Workflow de Développement Prisma**

### **📋 Checklist Complète**

#### **1. Modification du Schéma**
```bash
# Modifier prisma/schema.prisma
# Ajouter/modifier des modèles
```

#### **2. Validation**
```bash
npm run prisma:validate
# ✅ Vérifier qu'il n'y a pas d'erreurs de syntaxe
```

#### **3. Migration**
```bash
npm run prisma:migrate
# ✅ Créer et appliquer la migration
```

#### **4. Génération du Client**
```bash
npm run prisma:generate
# ✅ OBLIGATOIRE après chaque changement de schéma
```

#### **5. Compilation**
```bash
npm run build
# ✅ Vérifier que tout compile
```

#### **6. Test (Optionnel)**
```bash
npm run prisma:seed
# ✅ Peupler avec des données de test
```

---

## 🚀 **Commandes de Récupération Rapide**

### **🔧 Reset Complet**
```bash
# En cas de problème majeur
npm run prisma:migrate:reset  # ⚠️ SUPPRIME TOUTES LES DONNÉES
npm run prisma:generate
npm run prisma:seed
npm run build
```

### **🔄 Mise à Jour Standard**
```bash
# Après pull/merge avec changements de schéma
npm run prisma:generate
npm run prisma:migrate
npm run build
```

### **🆕 Nouveau Développeur**
```bash
# Setup initial
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run build
```

---

## 🎯 **Erreurs Spécifiques et Solutions**

### **TypeScript : "implicitly has 'any' type"**

#### **Problème**
```typescript
Parameter 'stat' implicitly has an 'any' type
```

#### **Solution**
```typescript
// ❌ Incorrect
stats.forEach(stat => {

// ✅ Correct
stats.forEach((stat: any) => {
// ou mieux avec un type spécifique
stats.forEach((stat: { role: string; _count: number }) => {
```

### **Import/Export : "Cannot find module"**

#### **Problème**
```typescript
Cannot find module '@prisma/client'
```

#### **Solution**
```bash
# Réinstaller les dépendances
npm install
npm run prisma:generate
```

---

## 🛡️ **Prévention des Erreurs**

### **✅ Bonnes Pratiques**

#### **1. Toujours Régénérer Après Modification**
```bash
# Après CHAQUE modification de schema.prisma
npm run prisma:generate
```

#### **2. Valider Avant de Migrer**
```bash
npm run prisma:validate
npm run prisma:migrate
```

#### **3. Tester Après Changements**
```bash
npm run build
npm run prisma:seed  # Si applicable
```

#### **4. Versionner les Migrations**
```bash
# Les migrations sont dans prisma/migrations/
# ✅ Les commiter dans Git
# ❌ Ne jamais les modifier manuellement
```

### **❌ Erreurs à Éviter**

#### **1. Oublier de Régénérer**
```bash
# ❌ Modifier schema.prisma puis directement build
# ✅ Modifier schema.prisma → generate → build
```

#### **2. Modifier les Migrations**
```bash
# ❌ Éditer les fichiers dans prisma/migrations/
# ✅ Créer une nouvelle migration
```

#### **3. Ignorer les Erreurs de Validation**
```bash
# ❌ Forcer la migration malgré les erreurs
# ✅ Corriger les erreurs puis migrer
```

---

## 🔍 **Diagnostic des Problèmes**

### **🩺 Commandes de Diagnostic**

#### **1. Vérifier l'État du Schéma**
```bash
npm run prisma:validate
# Affiche les erreurs de syntaxe
```

#### **2. Vérifier la Base de Données**
```bash
npm run prisma:studio
# Interface graphique pour explorer la DB
```

#### **3. Vérifier les Migrations**
```bash
ls prisma/migrations/
# Lister toutes les migrations
```

#### **4. Vérifier le Client Généré**
```bash
ls node_modules/@prisma/client/
# Vérifier que le client existe
```

### **📊 Informations Système**
```bash
# Version de Prisma
npx prisma --version

# État de la base
npx prisma db pull --print

# Différences avec le schéma
npx prisma db diff
```

---

## 🚨 **Situations d'Urgence**

### **🔥 Base de Données Corrompue**
```bash
# 1. Sauvegarder les données importantes
npm run prisma:studio  # Exporter manuellement

# 2. Reset complet
npm run prisma:migrate:reset

# 3. Recréer
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
```

### **🔥 Client Prisma Cassé**
```bash
# 1. Supprimer le client
rm -rf node_modules/@prisma/client

# 2. Réinstaller
npm install
npm run prisma:generate
```

### **🔥 Migrations Conflictuelles**
```bash
# 1. Résoudre manuellement les conflits dans schema.prisma
# 2. Créer une nouvelle migration
npm run prisma:migrate
# 3. Régénérer
npm run prisma:generate
```

---

## 📚 **Ressources Utiles**

### **🔗 Documentation Officielle**
- [Prisma Docs](https://www.prisma.io/docs/)
- [Troubleshooting Guide](https://www.prisma.io/docs/guides/other/troubleshooting)
- [Migration Guide](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)

### **🛠️ Outils de Debug**
- `npm run prisma:studio` - Interface graphique
- `npm run prisma:validate` - Validation du schéma
- `npx prisma db diff` - Différences avec la DB

### **📞 Support**
- [Prisma GitHub Issues](https://github.com/prisma/prisma/issues)
- [Prisma Discord](https://pris.ly/discord)

---

## 🎯 **Résumé des Commandes Essentielles**

| Problème | Solution |
|----------|----------|
| **Modèle non reconnu** | `npm run prisma:generate` |
| **Table n'existe pas** | `npm run prisma:migrate` |
| **Erreur de syntaxe** | `npm run prisma:validate` |
| **Client corrompu** | `rm -rf node_modules/@prisma/client && npm install && npm run prisma:generate` |
| **Reset complet** | `npm run prisma:migrate:reset` |
| **Setup initial** | `npm run prisma:generate && npm run prisma:migrate` |

### **🔄 Workflow Standard**
```bash
# Après TOUTE modification de schema.prisma :
npm run prisma:validate
npm run prisma:migrate
npm run prisma:generate
npm run build
```

**Suivez ce workflow et vous éviterez 99% des problèmes Prisma ! 🎯✨**
