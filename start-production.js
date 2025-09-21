const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function startProduction() {
  try {
    console.log('🚀 Démarrage de l\'application en production...');
    
    // Vérifier la connexion à la base de données
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');
    
    // Vérifier si l'utilisateur admin existe
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!admin) {
      console.log('⚠️  Utilisateur admin non trouvé, exécution du seed...');
      try {
        execSync('npm run prisma:seed', { stdio: 'inherit' });
        console.log('✅ Seed exécuté avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de l\'exécution du seed:', error.message);
      }
    } else {
      console.log('✅ Utilisateur admin trouvé');
    }
    
    await prisma.$disconnect();
    
    // Démarrer l'application
    console.log('🎯 Démarrage de l\'application NestJS...');
    require('./dist/src/main');
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

startProduction();

