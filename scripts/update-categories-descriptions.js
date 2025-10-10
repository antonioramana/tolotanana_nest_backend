const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCategoriesDescriptions() {
  try {
    console.log('🔄 Mise à jour des descriptions des catégories...');

    // Définir les descriptions pour chaque catégorie
    const categoryDescriptions = {
      'Santé': 'Campagnes liées à la santé, aux soins médicaux et au bien-être',
      'Éducation': 'Campagnes pour l\'éducation, la formation et le développement des compétences',
      'Environnement': 'Campagnes pour la protection de l\'environnement et le développement durable',
      'Entrepreneuriat': 'Campagnes pour soutenir l\'entrepreneuriat et l\'innovation',
    };

    const results = [];

    for (const [name, description] of Object.entries(categoryDescriptions)) {
      try {
        const updated = await prisma.category.update({
          where: { name },
          data: { description },
        });

        results.push({
          name,
          success: true,
          description,
        });

        console.log(`✅ ${name}: Description ajoutée`);
      } catch (error) {
        if (error.code === 'P2025') {
          console.log(`⚠️  ${name}: Catégorie non trouvée`);
        } else {
          console.error(`❌ Erreur pour ${name}:`, error.message);
        }
        results.push({
          name,
          success: false,
          error: error.message,
        });
      }
    }

    console.log('\n📈 Résumé de la mise à jour:');
    console.log(`   Total catégories: ${Object.keys(categoryDescriptions).length}`);
    console.log(`   Succès: ${results.filter(r => r.success).length}`);
    console.log(`   Erreurs: ${results.filter(r => !r.success).length}`);

    console.log('\n✨ Mise à jour terminée!');

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
updateCategoriesDescriptions()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
