import { PrismaClient, Prisma, UserRole, BankInfoType, CampaignStatus, DonationStatus, WithdrawalStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
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
      title: "Fournitures scolaires pour l'année",
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
      { campaignId: campaignA.id, title: 'Progression', content: 'Nous avons atteint 10% de l’objectif.' },
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
        justification: 'Payer l’hôpital',
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

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


