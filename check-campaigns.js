const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCampaigns() {
  try {
    console.log('🔍 Vérification des campagnes en base de données...');

    // Vérifier les campagnes de test
    const testCampaigns = await prisma.campaign.findMany({
      where: {
        id: {
          in: ['test-completed-campaign', 'test-expired-campaign'],
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

    console.log('📊 Campagnes de test:');
    testCampaigns.forEach(campaign => {
      console.log(`  - ${campaign.title}: ${campaign.status} (${campaign.currentAmount}/${campaign.targetAmount})`);
    });

    // Vérifier toutes les campagnes actives
    const activeCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'active',
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

    console.log(`\n📊 Campagnes actives (${activeCampaigns.length}):`);
    activeCampaigns.forEach(campaign => {
      const isExpired = new Date(campaign.deadline) < new Date();
      const isCompleted = campaign.currentAmount >= campaign.targetAmount;
      console.log(`  - ${campaign.title}: ${campaign.status} (${campaign.currentAmount}/${campaign.targetAmount}) ${isExpired ? '⏰ EXPIRÉ' : ''} ${isCompleted ? '🎯 COMPLÉTÉ' : ''}`);
    });

    // Vérifier les campagnes terminées
    const completedCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'completed',
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

    console.log(`\n📊 Campagnes terminées (${completedCampaigns.length}):`);
    completedCampaigns.forEach(campaign => {
      console.log(`  - ${campaign.title}: ${campaign.status} (${campaign.currentAmount}/${campaign.targetAmount})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCampaigns();

