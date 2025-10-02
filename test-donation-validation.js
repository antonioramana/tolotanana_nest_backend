const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDonationValidation() {
  console.log('🧪 Test de validation des dons et mise à jour des montants...');
  
  try {
    // 1. Trouver une campagne active avec des dons en attente
    const campaignWithPendingDonations = await prisma.campaign.findFirst({
      where: {
        status: 'active',
        donations: {
          some: {
            status: 'pending'
          }
        }
      },
      include: {
        donations: {
          where: {
            status: 'pending'
          },
          take: 1
        }
      }
    });

    if (!campaignWithPendingDonations || campaignWithPendingDonations.donations.length === 0) {
      console.log('❌ Aucune campagne avec des dons en attente trouvée');
      console.log('💡 Créons un don de test...');
      
      // Créer un don de test
      const activeCampaign = await prisma.campaign.findFirst({
        where: { status: 'active' }
      });
      
      if (!activeCampaign) {
        console.log('❌ Aucune campagne active trouvée');
        return;
      }

      const testDonation = await prisma.donation.create({
        data: {
          campaignId: activeCampaign.id,
          amount: 50000, // 50,000 Ar
          message: 'Don de test pour validation',
          isAnonymous: false,
          paymentMethod: 'test',
          status: 'pending'
        }
      });

      console.log(`✅ Don de test créé: ${testDonation.id} (${testDonation.amount} Ar)`);
      
      // Utiliser ce don pour le test
      campaignWithPendingDonations.id = activeCampaign.id;
      campaignWithPendingDonations.currentAmount = activeCampaign.currentAmount;
      campaignWithPendingDonations.donations = [testDonation];
    }

    const campaign = campaignWithPendingDonations;
    const pendingDonation = campaign.donations[0];

    console.log(`📊 Campagne: ${campaign.id}`);
    console.log(`💰 Montant actuel: ${campaign.currentAmount} Ar`);
    console.log(`🎁 Don en attente: ${pendingDonation.id} (${pendingDonation.amount} Ar)`);

    // 2. Valider le don (changer le statut à 'completed')
    console.log('\n🔄 Validation du don...');
    
    const updatedDonation = await prisma.donation.update({
      where: { id: pendingDonation.id },
      data: { status: 'completed' }
    });

    console.log(`✅ Don validé: ${updatedDonation.status}`);

    // 3. Vérifier que le montant de la campagne a été mis à jour
    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id: campaign.id }
    });

    const expectedAmount = Number(campaign.currentAmount) + Number(pendingDonation.amount);
    const actualAmount = Number(updatedCampaign.currentAmount);

    console.log(`\n📈 Résultats:`);
    console.log(`   Montant avant: ${campaign.currentAmount} Ar`);
    console.log(`   Montant du don: ${pendingDonation.amount} Ar`);
    console.log(`   Montant attendu: ${expectedAmount} Ar`);
    console.log(`   Montant actuel: ${actualAmount} Ar`);

    if (actualAmount === expectedAmount) {
      console.log(`🎉 ✅ SUCCESS: Le montant a été correctement mis à jour !`);
    } else {
      console.log(`❌ ÉCHEC: Le montant n'a pas été mis à jour correctement`);
      console.log(`   Différence: ${actualAmount - expectedAmount} Ar`);
    }

    // 4. Test d'annulation (optionnel)
    console.log(`\n🔄 Test d'annulation du don...`);
    
    const cancelledDonation = await prisma.donation.update({
      where: { id: pendingDonation.id },
      data: { status: 'failed' }
    });

    const campaignAfterCancellation = await prisma.campaign.findUnique({
      where: { id: campaign.id }
    });

    const expectedAmountAfterCancel = Number(campaign.currentAmount);
    const actualAmountAfterCancel = Number(campaignAfterCancellation.currentAmount);

    console.log(`📉 Après annulation:`);
    console.log(`   Montant attendu: ${expectedAmountAfterCancel} Ar`);
    console.log(`   Montant actuel: ${actualAmountAfterCancel} Ar`);

    if (actualAmountAfterCancel === expectedAmountAfterCancel) {
      console.log(`🎉 ✅ SUCCESS: L'annulation a correctement mis à jour le montant !`);
    } else {
      console.log(`❌ ÉCHEC: L'annulation n'a pas correctement mis à jour le montant`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
testDonationValidation();
