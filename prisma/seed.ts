import { PrismaClient, Prisma, UserRole, BankInfoType, CampaignStatus, DonationStatus, WithdrawalStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==================== SEED PRINCIPAL ====================
async function seedMain() {
  console.log('🌱 Seeding main data...');

  // Users
  const passwordAdmin = await bcrypt.hash('Admin@123', 10);
  const passwordDonor = await bcrypt.hash('Donor@123', 10);
  const passwordRequester = await bcrypt.hash('Requester@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      password: passwordAdmin,
      role: UserRole.admin,
      isVerified: true,
      phone: '+261340000000',
    },
  });

  const donor = await prisma.user.upsert({
    where: { email: 'donor@example.com' },
    update: {},
    create: {
      email: 'donor@example.com',
      firstName: 'Dona',
      lastName: 'Teur',
      password: passwordDonor,
      role: UserRole.donateur,
      isVerified: true,
      phone: '+261331111111',
    },
  });

  const requester = await prisma.user.upsert({
    where: { email: 'requester@example.com' },
    update: {},
    create: {
      email: 'requester@example.com',
      firstName: 'Reques',
      lastName: 'Teur',
      password: passwordRequester,
      role: UserRole.demandeur,
      isVerified: true,
      phone: '+261321222222',
    },
  });

  // Categories
  const categoryNames = ['Santé', 'Éducation', 'Environnement', 'Entrepreneuriat'];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // Bank Infos for requester
  const requesterMomo = await prisma.bankInfo.upsert({
    where: { id: 'seed-momo' },
    update: {},
    create: {
      id: 'seed-momo',
      userId: requester.id,
      type: BankInfoType.mobile_money,
      accountNumber: '0341234567',
      accountName: 'Requester Momo',
      provider: 'Orange Money',
      isDefault: true,
    },
  });

  const requesterBank = await prisma.bankInfo.upsert({
    where: { id: 'seed-bank' },
    update: {},
    create: {
      id: 'seed-bank',
      userId: requester.id,
      type: BankInfoType.bank_account,
      accountNumber: '000123456789',
      accountName: 'Requester Bank',
      provider: 'BOA',
      isDefault: false,
    },
  });

  // Campaigns
  const [sante, education] = categories;
  const campaignA = await prisma.campaign.upsert({
    where: { id: 'seed-camp-a' },
    update: {},
    create: {
      id: 'seed-camp-a',
      title: 'Opération chirurgicale urgente',
      description: 'Aider à financer une opération vitale.',
      targetAmount: new Prisma.Decimal('5000.00'),
      currentAmount: new Prisma.Decimal('0'),
      categoryId: sante.id,
      images: ['https://picsum.photos/seed/campA/800/400'],
      video: null,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: CampaignStatus.active,
      createdBy: requester.id,
      rating: new Prisma.Decimal('4.50'),
      totalDonors: 0,
      isVerified: true,
    },
  });

  const campaignB = await prisma.campaign.upsert({
    where: { id: 'seed-camp-b' },
    update: {},
    create: {
      id: 'seed-camp-b',
      title: "Fournitures scolaires pour l\'année",
      description: "Aider des élèves à obtenir des fournitures scolaires.",
      targetAmount: new Prisma.Decimal('2000.00'),
      currentAmount: new Prisma.Decimal('0'),
      categoryId: education.id,
      images: ['https://picsum.photos/seed/campB/800/400'],
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: CampaignStatus.active,
      createdBy: requester.id,
      rating: new Prisma.Decimal('4.20'),
      totalDonors: 0,
      isVerified: true,
    },
  });

  // Donations
  const donation1 = await prisma.donation.create({
    data: {
      campaignId: campaignA.id,
      donorId: donor.id,
      amount: new Prisma.Decimal('150.00'),
      message: 'Bon rétablissement !',
      isAnonymous: false,
      paymentMethod: 'card',
      status: DonationStatus.completed,
    },
  });

  const donation2 = await prisma.donation.create({
    data: {
      campaignId: campaignA.id,
      donorId: null,
      amount: new Prisma.Decimal('75.50'),
      isAnonymous: true,
      paymentMethod: 'mobile_money',
      status: DonationStatus.completed,
    },
  });

  const donation3 = await prisma.donation.create({
    data: {
      campaignId: campaignB.id,
      donorId: donor.id,
      amount: new Prisma.Decimal('50.00'),
      message: 'Bon courage !',
      isAnonymous: false,
      paymentMethod: 'card',
      status: DonationStatus.completed,
    },
  });

  // Update campaign amounts based on donations
  await prisma.campaign.update({
    where: { id: campaignA.id },
    data: {
      currentAmount: new Prisma.Decimal('225.50'),
      totalDonors: 2,
    },
  });
  await prisma.campaign.update({
    where: { id: campaignB.id },
    data: {
      currentAmount: new Prisma.Decimal('50.00'),
      totalDonors: 1,
    },
  });

  // Favorites
  await prisma.favorite.upsert({
    where: { userId_campaignId: { userId: donor.id, campaignId: campaignA.id } },
    update: {},
    create: { userId: donor.id, campaignId: campaignA.id },
  });

  // Campaign Updates
  await prisma.campaignUpdate.createMany({
    data: [
      { campaignId: campaignA.id, title: 'Première mise à jour', content: 'Merci pour vos premiers dons !' },
      { campaignId: campaignA.id, title: 'Progression', content: 'Nous avons atteint 10% de l\'objectif.' },
      { campaignId: campaignB.id, title: 'Démarrage', content: 'La campagne démarre bien, merci !' },
    ],
    skipDuplicates: true,
  });

  // Thank You Messages
  await prisma.thankYouMessage.createMany({
    data: [
      { campaignId: campaignA.id, donationId: donation1.id, message: 'Merci pour votre générosité !' },
      { campaignId: campaignA.id, donationId: donation2.id, message: 'Merci pour votre don anonyme.' },
      { campaignId: campaignB.id, donationId: donation3.id, message: 'Votre aide compte beaucoup.' },
    ],
    skipDuplicates: true,
  });

  // Withdrawal Requests
  await prisma.withdrawalRequest.createMany({
    data: [
      {
        campaignId: campaignA.id,
        requestedBy: requester.id,
        amount: new Prisma.Decimal('100.00'),
        bankInfoId: requesterMomo.id,
        justification: 'Payer l\'hôpital',
        documents: ['invoice-001.pdf'],
        status: WithdrawalStatus.pending,
      },
      {
        campaignId: campaignB.id,
        requestedBy: requester.id,
        amount: new Prisma.Decimal('40.00'),
        bankInfoId: requesterBank.id,
        justification: 'Achat de fournitures',
        documents: ['quote-abc.pdf'],
        status: WithdrawalStatus.approved,
        processedBy: admin.id,
        processedAt: new Date(),
        notes: 'Approuvé par admin',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Main seed completed');
  return { admin, donor, requester };
}

// ==================== SEED ADMIN BANK INFO ====================
async function seedAdminBankInfo(admin: any) {
  try {
    console.log('🌱 Seeding admin bank info...');

    console.log(`✅ Utilisateur admin trouvé: ${admin.firstName} ${admin.lastName}`);

    // Mettre à jour le téléphone de l'admin
    const updatedAdmin = await prisma.user.update({
      where: { id: admin.id },
      data: {
        phone: '0341234567'
      }
    });

    console.log(`✅ Téléphone mis à jour: ${updatedAdmin.phone}`);

    // Supprimer les anciennes informations bancaires s'il y en a
    await prisma.bankInfo.deleteMany({
      where: { userId: admin.id }
    });

    // Ajouter les informations bancaires de l'admin
    const bankInfos = [
      {
        userId: admin.id,
        type: 'mobile_money' as const,
        accountNumber: '0341234567',
        accountName: 'Admin Tolotanana',
        provider: 'Orange Money',
        isDefault: true
      },
      {
        userId: admin.id,
        type: 'mobile_money' as const,
        accountNumber: '0321234567',
        accountName: 'Admin Tolotanana',
        provider: 'Mvola',
        isDefault: false
      },
      {
        userId: admin.id,
        type: 'bank_account' as const,
        accountNumber: '1234567890123456',
        accountName: 'Admin Tolotanana',
        provider: 'Bank of Africa',
        isDefault: false
      },
      {
        userId: admin.id,
        type: 'bank_account' as const,
        accountNumber: '9876543210987654',
        accountName: 'Admin Tolotanana',
        provider: 'BNI Madagascar',
        isDefault: false
      }
    ];

    for (const bankInfo of bankInfos) {
      const created = await prisma.bankInfo.create({
        data: bankInfo
      });
      console.log(`✅ Info bancaire créée: ${created.provider} - ${created.accountNumber}`);
    }

    console.log('✅ Admin bank info seed completed');
  } catch (error) {
    console.error('❌ Erreur lors du seed admin bank info:', error);
    throw error;
  }
}

// ==================== SEED PLATFORM FEES ====================
async function seedPlatformFees(admin: any) {
  try {
    console.log('🌱 Seeding platform fees...');

    // Vérifier si des frais existent déjà
    const existingFees = await prisma.platformFees.findFirst();
    
    if (existingFees) {
      console.log('✅ Des frais de plateforme existent déjà.');
      return;
    }

    // Créer les frais par défaut
    const defaultFees = await prisma.platformFees.create({
      data: {
        percentage: 5.0,
        description: 'Frais de plateforme par défaut pour couvrir les coûts opérationnels',
        isActive: true,
        createdBy: admin.id,
      },
    });

    console.log('✅ Frais de plateforme créés avec succès:', {
      id: defaultFees.id,
      percentage: defaultFees.percentage,
      description: defaultFees.description,
      isActive: defaultFees.isActive,
    });

  } catch (error) {
    console.error('❌ Erreur lors du seeding des frais de plateforme:', error);
    throw error;
  }
}

// ==================== SEED TESTIMONIALS ====================
async function seedTestimonials(admin: any) {
  console.log('🌱 Seeding testimonials...');

  try {
    // Vérifier si des témoignages existent déjà
    const existingTestimonials = await prisma.testimonial.findFirst();
    if (existingTestimonials) {
      console.log('✅ Des témoignages existent déjà.');
      return;
    }

    // Témoignages de test basés sur l'image fournie
    const testimonials = [
      {
        name: 'Marie Rasoanirina',
        role: 'Bénéficiaire',
        avatar: null,
        content: 'Grâce à TOLOTANANA, j\'ai pu collecter les fonds nécessaires pour l\'opération de ma fille. La plateforme est simple à utiliser et la communauté est incroyablement généreuse. Merci à tous !',
        campaign: 'Aide pour les frais médicaux de ma fille',
        rating: 5,
        isActive: true,
        isHighlight: true,
        createdBy: admin.id,
      },
      {
        name: 'Jean Rakotomalala',
        role: 'Créateur de campagne',
        avatar: null,
        content: 'TOLOTANANA m\'a permis de réaliser mon rêve de construire une école dans mon village. Le processus est transparent et l\'équipe est très professionnelle. Je recommande vivement !',
        campaign: 'Construction d\'une école rurale à Antsirabe',
        rating: 5,
        isActive: true,
        isHighlight: true,
        createdBy: admin.id,
      },
      {
        name: 'Sarah Andriamalala',
        role: 'Donatrice',
        avatar: null,
        content: 'J\'adore utiliser TOLOTANANA pour soutenir des causes qui me tiennent à cœur. C\'est rassurant de voir l\'impact direct de mes dons et de suivre les progrès des campagnes.',
        campaign: 'Donatrice régulière',
        rating: 5,
        isActive: true,
        isHighlight: true,
        createdBy: admin.id,
      },
      {
        name: 'Pierre Randrianarivo',
        role: 'Bénéficiaire',
        avatar: null,
        content: 'Après le cyclone, TOLOTANANA nous a aidés à reconstruire notre maison. La solidarité de la communauté malgache est extraordinaire. Cette plateforme change vraiment des vies.',
        campaign: 'Reconstruction après cyclone',
        rating: 5,
        isActive: true,
        isHighlight: true,
        createdBy: admin.id,
      },
      {
        name: 'Lucie Ratsimba',
        role: 'Donatrice',
        avatar: null,
        content: 'Je donne régulièrement sur TOLOTANANA car je sais que chaque ariary va directement aux personnes dans le besoin. La transparence et la confiance sont essentielles pour moi.',
        campaign: 'Donatrice fidèle',
        rating: 5,
        isActive: true,
        isHighlight: true,
        createdBy: admin.id,
      },
      {
        name: 'Marc Ravelojaona',
        role: 'Créateur de campagne',
        avatar: null,
        content: 'TOLOTANANA m\'a aidé à financer mon projet de bibliothèque mobile. L\'équipe m\'a accompagné à chaque étape et les donateurs sont très engagés. Une expérience exceptionnelle !',
        campaign: 'Bibliothèque mobile pour enfants',
        rating: 5,
        isActive: true,
        isHighlight: true,
        createdBy: admin.id,
      },
      // Témoignages supplémentaires (non mis en avant)
      {
        name: 'Hery Andriamanantsoa',
        role: 'Donateur',
        avatar: null,
        content: 'Excellente plateforme pour aider les autres. Interface claire et processus de don sécurisé.',
        campaign: null,
        rating: 4,
        isActive: true,
        isHighlight: false,
        createdBy: admin.id,
      },
      {
        name: 'Naina Rakotovao',
        role: 'Bénéficiaire',
        avatar: null,
        content: 'Merci à TOLOTANANA pour m\'avoir aidé à financer mes études. Grâce à vous, je peux maintenant aider d\'autres jeunes.',
        campaign: 'Financement études supérieures',
        rating: 5,
        isActive: true,
        isHighlight: false,
        createdBy: admin.id,
      },
    ];

    // Créer les témoignages
    for (const testimonial of testimonials) {
      await prisma.testimonial.create({
        data: testimonial,
      });
    }

    console.log(`✅ ${testimonials.length} témoignages ajoutés avec succès !`);
    
    // Afficher les statistiques
    const stats = await prisma.testimonial.groupBy({
      by: ['role', 'isHighlight'],
      _count: true,
    });

    console.log('📊 Statistiques des témoignages :');
    stats.forEach(stat => {
      const highlight = stat.isHighlight ? ' (Mis en avant)' : '';
      console.log(`   ${stat.role}${highlight}: ${stat._count}`);
    });

    // Calculer la note moyenne
    const avgRating = await prisma.testimonial.aggregate({
      _avg: { rating: true },
    });

    console.log(`⭐ Note moyenne : ${avgRating._avg.rating}/5`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des témoignages:', error);
    throw error;
  }
}

// ==================== SEED CONTACT MESSAGES ====================
async function seedContactMessages(admin: any) {
  console.log('🌱 Seeding contact messages...');

  try {
    // Vérifier si des messages existent déjà
    const existingMessages = await prisma.contactMessage.findFirst();
    if (existingMessages) {
      console.log('✅ Des messages de contact existent déjà.');
      return;
    }

    // Messages de test
    const testMessages = [
      {
        name: 'Marie Rakoto',
        email: 'marie.rakoto@email.com',
        subject: 'Question sur les frais de plateforme',
        message: 'Bonjour,\n\nJ\'aimerais avoir plus d\'informations sur les frais appliqués lors des donations. Sont-ils fixes ou variables ?\n\nMerci pour votre réponse.',
        isRead: false,
      },
      {
        name: 'Jean Randria',
        email: 'jean.randria@email.com',
        subject: 'Problème avec ma campagne',
        message: 'Salut,\n\nMa campagne n\'apparaît pas dans les résultats de recherche. Pouvez-vous vérifier s\'il y a un problème ?\n\nCampagne : "Aide pour l\'école de mon village"\n\nMerci !',
        isRead: true,
        isReplied: true,
        reply: 'Bonjour Jean,\n\nMerci pour votre message. J\'ai vérifié votre campagne et elle est maintenant visible dans les résultats de recherche. Il y avait un petit problème technique qui a été résolu.\n\nN\'hésitez pas si vous avez d\'autres questions.\n\nCordialement,\nL\'équipe Tolotanana',
        repliedBy: admin.id,
        repliedAt: new Date('2024-01-15T10:30:00Z'),
      },
      {
        name: 'Hery Rasolofo',
        email: 'hery.rasolofo@email.com',
        subject: 'Demande de partenariat',
        message: 'Bonjour,\n\nJe représente une ONG locale et nous aimerions explorer une collaboration avec votre plateforme pour nos campagnes de collecte de fonds.\n\nPourriez-vous me mettre en contact avec la personne responsable des partenariats ?\n\nCordialement,\nHery Rasolofo\nDirecteur - ONG Fihavanana',
        isRead: true,
      },
      {
        name: 'Naina Andriamanana',
        email: 'naina.andriamanana@email.com',
        subject: 'Retrait de fonds bloqué',
        message: 'Bonjour,\n\nJ\'ai fait une demande de retrait il y a une semaine mais je n\'ai toujours pas reçu les fonds. Le statut indique "En cours de traitement".\n\nPouvez-vous m\'aider ?\n\nMon ID de demande : WR123456\n\nMerci',
        isRead: false,
      },
      {
        name: 'Tiana Rakotomalala',
        email: 'tiana.rakotomalala@email.com',
        subject: 'Félicitations pour la plateforme',
        message: 'Bonjour,\n\nJe voulais juste vous féliciter pour cette excellente initiative ! J\'ai pu aider plusieurs campagnes grâce à votre plateforme.\n\nL\'interface est intuitive et le processus de don est très simple.\n\nContinuez comme ça !\n\nTiana',
        isRead: true,
        isReplied: true,
        reply: 'Bonjour Tiana,\n\nMerci beaucoup pour ce message très encourageant ! C\'est grâce à des utilisateurs comme vous que notre plateforme peut avoir un impact positif.\n\nN\'hésitez pas à partager Tolotanana autour de vous pour aider encore plus de causes.\n\nMerci encore !\nL\'équipe Tolotanana',
        repliedBy: admin.id,
        repliedAt: new Date('2024-01-10T14:20:00Z'),
      }
    ];

    // Créer les messages
    for (const messageData of testMessages) {
      await prisma.contactMessage.create({ data: messageData });
    }

    console.log(`✅ ${testMessages.length} messages de contact ajoutés avec succès !`);
    
    // Afficher les statistiques
    const stats = await prisma.contactMessage.groupBy({
      by: ['isRead', 'isReplied'],
      _count: true,
    });

    console.log('📊 Statistiques des messages :');
    stats.forEach(stat => {
      const status = stat.isReplied ? 'Répondus' : stat.isRead ? 'Lus' : 'Non lus';
      console.log(`   ${status}: ${stat._count}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des messages:', error);
    throw error;
  }
}

// ==================== FONCTION PRINCIPALE ====================
async function runAllSeeds() {
  try {
    console.log('🚀 Démarrage de tous les seeds...\n');

    // 1. Seed principal (utilisateurs, campagnes, etc.)
    const { admin, donor, requester } = await seedMain();
    console.log('');

    // 2. Seed admin bank info
    await seedAdminBankInfo(admin);
    console.log('');

    // 3. Seed platform fees
    await seedPlatformFees(admin);
    console.log('');

    // 4. Seed testimonials
    await seedTestimonials(admin);
    console.log('');

    // 5. Seed contact messages
    await seedContactMessages(admin);
    console.log('');

    console.log('🎉 Tous les seeds ont été exécutés avec succès!');
    console.log('\n📊 Résumé des données créées :');
    console.log('   👤 Utilisateurs : Admin, Donateur, Demandeur');
    console.log('   🏷️  Catégories : Santé, Éducation, Environnement, Entrepreneuriat');
    console.log('   📋 Campagnes : 2 campagnes de test');
    console.log('   💰 Donations : 3 donations de test');
    console.log('   🏦 Infos bancaires : Admin + Demandeur');
    console.log('   💳 Frais de plateforme : 5% par défaut');
    console.log('   💬 Témoignages : 8 témoignages (6 mis en avant)');
    console.log('   📧 Messages contact : 5 messages de test');
    console.log('\n✨ Votre base de données est prête à être utilisée !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des seeds:', error);
    throw error;
  }
}

// ==================== EXÉCUTION ====================
runAllSeeds()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });