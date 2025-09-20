const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCampaignVerification() {
  try {
    console.log('🧪 Test du système de vérification des campagnes...');

    // Créer une campagne de test qui devrait être marquée comme terminée
    const testCampaign = await prisma.campaign.create({
      data: {
        title: 'Test Campaign - Objectif atteint',
        description: 'Campagne de test pour vérifier la logique de completion',
        targetAmount: 100000,
        currentAmount: 150000, // Montant supérieur à l'objectif
        status: 'active',
        creatorId: 'test-user-id', // Vous devrez remplacer par un ID utilisateur valide
        categoryId: 'test-category-id', // Vous devrez remplacer par un ID catégorie valide
        images: ['https://example.com/test.jpg'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });

    console.log('✅ Campagne de test créée:', testCampaign.id);

    // Créer une campagne de test qui devrait être marquée comme expirée
    const expiredCampaign = await prisma.campaign.create({
      data: {
        title: 'Test Campaign - Expirée',
        description: 'Campagne de test pour vérifier la logique d\'expiration',
        targetAmount: 200000,
        currentAmount: 50000,
        status: 'active',
        creatorId: 'test-user-id',
        categoryId: 'test-category-id',
        images: ['https://example.com/test2.jpg'],
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
      },
    });

    console.log('✅ Campagne expirée de test créée:', expiredCampaign.id);

    // Vérifier les campagnes avant la vérification
    const campaignsBefore = await prisma.campaign.findMany({
      where: {
        id: {
          in: [testCampaign.id, expiredCampaign.id],
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        currentAmount: true,
        targetAmount: true,
        deadline: true,
      },
    });

    console.log('📊 Campagnes avant vérification:');
    campaignsBefore.forEach(campaign => {
      console.log(`- ${campaign.title}: ${campaign.status} (${campaign.currentAmount}/${campaign.targetAmount})`);
    });

    console.log('\n⏰ Attendez que le cron se déclenche (toutes les heures) ou testez manuellement via l\'API...');
    console.log('🔗 Endpoint de vérification manuelle: POST /campaigns/verification/manual');
    console.log('📊 Statistiques: GET /campaigns/verification/stats');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCampaignVerification();

