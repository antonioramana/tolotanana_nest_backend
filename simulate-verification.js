const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simulateVerification() {
  try {
    console.log('🔍 Simulation de la vérification des campagnes...');

    // 1. Vérifier les campagnes avec objectif atteint
    console.log('\n1️⃣ Vérification des objectifs atteints...');
    const completedCampaigns = await prisma.$queryRaw`
      SELECT id, title, "currentAmount", "targetAmount" 
      FROM campaigns 
      WHERE status = 'active' 
      AND "currentAmount" >= "targetAmount"
    `;

    console.log(`🔍 Campagnes trouvées avec objectif atteint: ${completedCampaigns.length}`);
    completedCampaigns.forEach(campaign => {
      console.log(`  - ${campaign.title}: ${campaign.currentAmount}/${campaign.targetAmount}`);
    });

    if (completedCampaigns.length > 0) {
      const campaignIds = completedCampaigns.map(c => c.id);
      await prisma.campaign.updateMany({
        where: {
          id: {
            in: campaignIds,
          },
        },
        data: {
          status: 'completed',
        },
      });
      console.log(`✅ ${campaignIds.length} campagne(s) marquée(s) comme terminée(s)`);
    }

    // 2. Vérifier les campagnes expirées
    console.log('\n2️⃣ Vérification des campagnes expirées...');
    const expiredCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'active',
        deadline: {
          lt: new Date(),
        },
      },
    });

    console.log(`🔍 Campagnes trouvées avec date dépassée: ${expiredCampaigns.length}`);
    expiredCampaigns.forEach(campaign => {
      console.log(`  - ${campaign.title}: deadline ${campaign.deadline}`);
    });

    if (expiredCampaigns.length > 0) {
      const campaignIds = expiredCampaigns.map(c => c.id);
      await prisma.campaign.updateMany({
        where: {
          id: {
            in: campaignIds,
          },
        },
        data: {
          status: 'completed',
        },
      });
      console.log(`✅ ${campaignIds.length} campagne(s) expirée(s) marquée(s) comme terminée(s)`);
    }

    // 3. Vérifier le résultat final
    console.log('\n3️⃣ État final des campagnes:');
    const allCampaigns = await prisma.campaign.findMany({
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

    allCampaigns.forEach(campaign => {
      console.log(`  - ${campaign.title}: ${campaign.status} (${campaign.currentAmount}/${campaign.targetAmount})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateVerification();
