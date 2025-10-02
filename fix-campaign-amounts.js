const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCampaignAmounts() {
  console.log('🔧 Correction des montants collectés des campagnes...');
  
  try {
    // Récupérer toutes les campagnes
    const campaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        title: true,
        currentAmount: true,
      },
    });

    console.log(`📊 ${campaigns.length} campagne(s) trouvée(s)`);

    for (const campaign of campaigns) {
      // Calculer le montant réel basé sur les dons "completed"
      const completedDonations = await prisma.donation.findMany({
        where: {
          campaignId: campaign.id,
          status: 'completed',
        },
        select: {
          amount: true,
        },
      });

      const realAmount = completedDonations.reduce((sum, donation) => {
        return sum + Number(donation.amount);
      }, 0);

      const currentAmount = Number(campaign.currentAmount);

      if (realAmount !== currentAmount) {
        console.log(`🔄 Correction nécessaire pour "${campaign.title}"`);
        console.log(`   Montant actuel: ${currentAmount} Ar`);
        console.log(`   Montant réel: ${realAmount} Ar`);

        // Mettre à jour le montant
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            currentAmount: realAmount,
          },
        });

        console.log(`   ✅ Montant corrigé: ${realAmount} Ar`);
      } else {
        console.log(`✅ "${campaign.title}" - Montant correct: ${currentAmount} Ar`);
      }
    }

    console.log('🎉 Correction terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
fixCampaignAmounts();
