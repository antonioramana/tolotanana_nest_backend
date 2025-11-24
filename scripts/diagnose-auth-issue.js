const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de la configuration backend...\n');

// 1. Vérifier les variables d'environnement
console.log('📄 1. Vérification des variables d\'environnement:');
const envPath = path.join(__dirname, '../.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Fichier .env trouvé');
} else {
  console.log('❌ Fichier .env non trouvé');
}

// Extraire les variables importantes
const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
const jwtSecret = jwtSecretMatch ? jwtSecretMatch[1].trim() : null;

console.log(`📝 JWT_SECRET: ${jwtSecret ? jwtSecret.substring(0, 10) + '...' : 'NON_DEFINI'}`);

// 2. Vérifier la configuration JWT
console.log('\n📄 2. Vérification de la configuration JWT:');
const jwtStrategyPath = path.join(__dirname, '../src/auth/strategies/jwt.strategy.ts');
if (fs.existsSync(jwtStrategyPath)) {
  console.log('✅ JwtStrategy trouvé');
  const jwtStrategyContent = fs.readFileSync(jwtStrategyPath, 'utf8');
  
  const hasExtractJwt = jwtStrategyContent.includes('ExtractJwt.fromAuthHeaderAsBearerToken()');
  const hasSecretKey = jwtStrategyContent.includes('secretOrKey: configService.get<string>(\'JWT_SECRET\')');
  const hasValidation = jwtStrategyContent.includes('async validate(payload: any)');
  
  console.log(`📝 ExtractJwt configuré: ${hasExtractJwt ? '✓' : '✗'}`);
  console.log(`📝 Secret key configuré: ${hasSecretKey ? '✓' : '✗'}`);
  console.log(`📝 Validation configurée: ${hasValidation ? '✓' : '✗'}`);
} else {
  console.log('❌ JwtStrategy non trouvé');
}

// 3. Vérifier les contrôleurs de campagnes
console.log('\n📄 3. Vérification des contrôleurs de campagnes:');
const campaignsControllerPath = path.join(__dirname, '../src/campaigns/campaigns.controller.ts');
if (fs.existsSync(campaignsControllerPath)) {
  console.log('✅ CampaignsController trouvé');
  const controllerContent = fs.readFileSync(campaignsControllerPath, 'utf8');
  
  const hasJwtGuard = controllerContent.includes('@UseGuards(JwtAuthGuard)');
  const hasFindAll = controllerContent.includes('findAll');
  const hasPublicController = fs.existsSync(path.join(__dirname, '../src/campaigns/public-campaigns.controller.ts'));
  
  console.log(`📝 JwtAuthGuard utilisé: ${hasJwtGuard ? '✓' : '✗'}`);
  console.log(`📝 Méthode findAll présente: ${hasFindAll ? '✓' : '✗'}`);
  console.log(`📝 PublicCampaignsController: ${hasPublicController ? '✓' : '✗'}`);
} else {
  console.log('❌ CampaignsController non trouvé');
}

// 4. Vérifier la base de données
console.log('\n📄 4. Vérification de la base de données:');
const prismaSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
if (fs.existsSync(prismaSchemaPath)) {
  console.log('✅ Schema Prisma trouvé');
  const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
  
  const hasUserModel = schemaContent.includes('model User');
  const hasCampaignModel = schemaContent.includes('model Campaign');
  const hasJwtFields = schemaContent.includes('id') && schemaContent.includes('email');
  
  console.log(`📝 Modèle User: ${hasUserModel ? '✓' : '✗'}`);
  console.log(`📝 Modèle Campaign: ${hasCampaignModel ? '✓' : '✗'}`);
  console.log(`📝 Champs JWT (id, email): ${hasJwtFields ? '✓' : '✗'}`);
} else {
  console.log('❌ Schema Prisma non trouvé');
}

// 5. Diagnostic du problème
console.log('\n🔍 5. Diagnostic du problème:');

if (!jwtSecret) {
  console.log('❌ PROBLÈME IDENTIFIÉ: JWT_SECRET non défini');
  console.log('💡 SOLUTION: Ajoutez JWT_SECRET dans le fichier .env');
} else if (jwtSecret.length < 32) {
  console.log('❌ PROBLÈME IDENTIFIÉ: JWT_SECRET trop court');
  console.log('💡 SOLUTION: Utilisez une clé d\'au moins 32 caractères');
} else {
  console.log('✅ JWT_SECRET correctement configuré');
}

// 6. Solutions recommandées
console.log('\n💡 6. Solutions recommandées:');
console.log('1. Vérifiez que le backend est démarré (npm run start:dev)');
console.log('2. Vérifiez que JWT_SECRET est défini et identique partout');
console.log('3. Vérifiez que l\'utilisateur existe dans la base de données');
console.log('4. Testez avec la page /debug-auth pour diagnostiquer');
console.log('5. Vérifiez les logs du backend pour plus de détails');

console.log('\n✅ Diagnostic terminé !');







