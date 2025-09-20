const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🔄 Création des données de test...');

    // Créer un utilisateur admin de test
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@tolotanana.com' },
      update: {},
      create: {
        email: 'admin@tolotanana.com',
        firstName: 'Admin',
        lastName: 'TOLOTANANA',
        role: 'admin',
        isVerified: true,
        password: '$2b$10$example', // Mot de passe hashé
      },
    });

    // Créer un utilisateur demandeur de test
    const demandeurUser = await prisma.user.upsert({
      where: { email: 'demandeur@test.com' },
      update: {},
      create: {
        email: 'demandeur@test.com',
        firstName: 'Jean',
        lastName: 'Rakoto',
        role: 'demandeur',
        isVerified: true,
        password: '$2b$10$example',
      },
    });

    // Créer un utilisateur donateur de test
    const donateurUser = await prisma.user.upsert({
      where: { email: 'donateur@test.com' },
      update: {},
      create: {
        email: 'donateur@test.com',
        firstName: 'Marie',
        lastName: 'Rasoa',
        role: 'donateur',
        isVerified: true,
        password: '$2b$10$example',
      },
    });

    // Créer une catégorie de test
    const category = await prisma.category.upsert({
      where: { name: 'Santé' },
      update: {},
      create: {
        name: 'Santé',
        description: 'Campagnes liées à la santé',
      },
    });

    // Créer une campagne de test
    const campaign = await prisma.campaign.upsert({
      where: { id: 'test-campaign-1' },
      update: {},
      create: {
        id: 'test-campaign-1',
        title: 'Aide médicale urgente',
        description: 'Collecte de fonds pour une opération médicale urgente',
        targetAmount: 5000000,
        currentAmount: 0,
        status: 'active',
        creatorId: demandeurUser.id,
        categoryId: category.id,
        images: ['https://example.com/image1.jpg'],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      },
    });

    // Créer des dons de test
    const donations = await Promise.all([
      prisma.donation.create({
        data: {
          amount: 100000,
          message: 'Bon courage pour votre opération',
          paymentMethod: 'mobile_money',
          status: 'completed',
          donorId: donateurUser.id,
          campaignId: campaign.id,
          donorName: 'Marie Rasoa',
        },
      }),
      prisma.donation.create({
        data: {
          amount: 250000,
          message: 'J\'espère que tout ira bien',
          paymentMethod: 'bank_transfer',
          status: 'completed',
          donorId: donateurUser.id,
          campaignId: campaign.id,
          donorName: 'Marie Rasoa',
        },
      }),
      prisma.donation.create({
        data: {
          amount: 50000,
          message: 'Don anonyme',
          paymentMethod: 'cash',
          status: 'pending',
          donorId: null,
          campaignId: campaign.id,
          donorName: 'Anonyme',
          isAnonymous: true,
        },
      }),
    ]);

    // Mettre à jour le montant de la campagne
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { currentAmount: totalDonations },
    });

    // Créer une demande de retrait de test
    const withdrawalRequest = await prisma.withdrawalRequest.create({
      data: {
        amount: 200000,
        status: 'pending',
        notes: 'Retrait pour frais médicaux',
        requesterId: demandeurUser.id,
        campaignId: campaign.id,
        bankInfoId: null, // Pas de banque configurée pour le test
      },
    });

    console.log('✅ Données de test créées avec succès !');
    console.log(`👤 Admin: ${adminUser.email}`);
    console.log(`👤 Demandeur: ${demandeurUser.email}`);
    console.log(`👤 Donateur: ${donateurUser.email}`);
    console.log(`📋 Campagne: ${campaign.title}`);
    console.log(`💰 Dons créés: ${donations.length}`);
    console.log(`💸 Demande de retrait: ${withdrawalRequest.id}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
