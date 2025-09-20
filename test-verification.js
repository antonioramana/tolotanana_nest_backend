const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testVerification() {
  try {
    console.log('🧪 Test du système de vérification...');

    // Créer un utilisateur de test
    const testUser = await prisma.user.upsert({
      where: { email: 'test-verification@example.com' },
      update: {},
      create: {
        email: 'test-verification@example.com',
        firstName: 'Test',
        lastName: 'Verification',
        role: 'demandeur',
        isVerified: true,
        password: '$2b$10$example',
      },
    });

    // Créer une catégorie de test
    const testCategory = await prisma.category.upsert({
      where: { name: 'Test Verification' },
      update: {},
      create: {
        name: 'Test Verification',
      },
    });

    // Créer une campagne qui a atteint son objectif
    const completedCampaign = await prisma.campaign.upsert({
      where: { id: 'test-completed-campaign' },
      update: {},
      create: {
        id: 'test-completed-campaign',
        title: 'Campagne Objectif Atteint',
        description: 'Cette campagne a atteint son objectif',
        targetAmount: 100000,
        currentAmount: 150000, // Supérieur à l'objectif
        status: 'active',
        createdBy: testUser.id,
        categoryId: testCategory.id,
        images: ['https://example.com/test.jpg'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });

    // Créer une campagne expirée
    const expiredCampaign = await prisma.campaign.upsert({
      where: { id: 'test-expired-campaign' },
      update: {},
      create: {
        id: 'test-expired-campaign',
        title: 'Campagne Expirée',
        description: 'Cette campagne a dépassé sa date limite',
        targetAmount: 200000,
        currentAmount: 50000,
        status: 'active',
        createdBy: testUser.id,
        categoryId: testCategory.id,
        images: ['https://example.com/test2.jpg'],
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
      },
    });

    console.log('✅ Campagnes de test créées:');
    console.log(`  - Objectif atteint: ${completedCampaign.title} (${completedCampaign.currentAmount}/${completedCampaign.targetAmount})`);
    console.log(`  - Expirée: ${expiredCampaign.title} (deadline: ${expiredCampaign.deadline})`);

    // Vérifier les campagnes avant
    const campaignsBefore = await prisma.campaign.findMany({
      where: {
        id: {
          in: [completedCampaign.id, expiredCampaign.id],
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

    console.log('\n📊 Avant vérification:');
    campaignsBefore.forEach(campaign => {
      console.log(`  - ${campaign.title}: ${campaign.status}`);
    });

    console.log('\n⏰ Le cron se déclenchera automatiquement toutes les heures...');
    console.log('🔧 Ou testez manuellement via: POST /campaigns/verification/manual');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVerification();
