const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function recalculateTotalRaised() {
  try {
    console.log('🔄 Recalcul du montant total collecté pour toutes les campagnes...');

    // Récupérer toutes les campagnes
    const campaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        title: true,
        currentAmount: true,
        totalRaised: true,
      },
    });

    console.log(`📊 ${campaigns.length} campagnes trouvées`);

    const results = [];

    for (const campaign of campaigns) {
      try {
        // Calculer le montant total des retraits approuvés
        const approvedWithdrawals = await prisma.withdrawalRequest.findMany({
          where: {
            campaignId: campaign.id,
            status: 'approved',
          },
          select: {
            amount: true,
          },
        });

        const totalWithdrawals = approvedWithdrawals.reduce((sum, withdrawal) => {
          return sum + Number(withdrawal.amount);
        }, 0);

        // Calculer le montant total collecté (actuel + retraits)
        const totalRaised = Number(campaign.currentAmount) + totalWithdrawals;

        // Mettre à jour le montant total collecté
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            totalRaised: totalRaised,
          },
        });

        results.push({
          campaignId: campaign.id,
          title: campaign.title,
          success: true,
          previousTotalRaised: Number(campaign.totalRaised || 0),
          newTotalRaised: totalRaised,
          currentAmount: Number(campaign.currentAmount),
          totalWithdrawals: totalWithdrawals,
          difference: totalRaised - Number(campaign.totalRaised || 0),
        });

        console.log(`✅ ${campaign.title}: ${totalRaised} Ar (${totalWithdrawals} Ar de retraits)`);
      } catch (error) {
        results.push({
          campaignId: campaign.id,
          title: campaign.title,
          success: false,
          error: error.message,
        });
        console.error(`❌ Erreur pour ${campaign.title}:`, error.message);
      }
    }

    console.log('\n📈 Résumé du recalcul:');
    console.log(`   Total campagnes: ${campaigns.length}`);
    console.log(`   Succès: ${results.filter(r => r.success).length}`);
    console.log(`   Erreurs: ${results.filter(r => !r.success).length}`);

    const totalDifference = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.difference, 0);
    
    if (totalDifference !== 0) {
      console.log(`   Différence totale: ${totalDifference} Ar`);
    }

    console.log('\n✨ Recalcul terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du recalcul:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
recalculateTotalRaised()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
