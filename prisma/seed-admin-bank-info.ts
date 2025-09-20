import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdminBankInfo() {
  try {
    console.log('🌱 Seeding admin bank info...');

    // Trouver l'utilisateur admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (!admin) {
      console.log('❌ Utilisateur admin@example.com non trouvé');
      return;
    }

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

    console.log('🎉 Seed admin bank info terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seed
seedAdminBankInfo()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
