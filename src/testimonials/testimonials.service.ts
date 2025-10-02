import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateTestimonialDto, adminId: string) {
    return this.prisma.testimonial.create({
      data: {
        ...createDto,
        createdBy: adminId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    
    return this.prisma.testimonial.findMany({
      where,
      orderBy: [
        { isHighlight: 'desc' }, // Témoignages mis en avant en premier
        { createdAt: 'desc' },   // Puis par date de création
      ],
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findPublic() {
    // Pour l'affichage public : seulement les témoignages actifs
    return this.prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [
        { isHighlight: 'desc' }, // Témoignages mis en avant en premier
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
        content: true,
        campaign: true,
        rating: true,
        isHighlight: true,
        createdAt: true,
      },
    });
  }

  async findHighlighted() {
    // Pour la page d'accueil : témoignages mis en avant
    return this.prisma.testimonial.findMany({
      where: { 
        isActive: true,
        isHighlight: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 6, // Limiter à 6 témoignages
      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
        content: true,
        campaign: true,
        rating: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const testimonial = await this.prisma.testimonial.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!testimonial) {
      throw new NotFoundException('Témoignage non trouvé');
    }

    return testimonial;
  }

  async update(id: string, updateDto: UpdateTestimonialDto, adminId: string) {
    await this.findOne(id); // Vérifier que le témoignage existe

    return this.prisma.testimonial.update({
      where: { id },
      data: {
        ...updateDto,
        createdBy: adminId, // Mettre à jour l'admin qui modifie
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async toggleActive(id: string, adminId: string) {
    const testimonial = await this.findOne(id);
    
    return this.prisma.testimonial.update({
      where: { id },
      data: {
        isActive: !testimonial.isActive,
        createdBy: adminId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async toggleHighlight(id: string, adminId: string) {
    const testimonial = await this.findOne(id);
    
    return this.prisma.testimonial.update({
      where: { id },
      data: {
        isHighlight: !testimonial.isHighlight,
        createdBy: adminId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Vérifier que le témoignage existe
    
    await this.prisma.testimonial.delete({
      where: { id },
    });

    return { message: 'Témoignage supprimé avec succès' };
  }

  async getStats() {
    const [total, active, highlighted, byRole] = await Promise.all([
      this.prisma.testimonial.count(),
      this.prisma.testimonial.count({ where: { isActive: true } }),
      this.prisma.testimonial.count({ where: { isHighlight: true } }),
      this.prisma.testimonial.groupBy({
        by: ['role'],
        _count: true,
        where: { isActive: true },
      }),
    ]);

    // Calculer la note moyenne
    const avgRating = await this.prisma.testimonial.aggregate({
      where: { isActive: true },
      _avg: { rating: true },
    });

    return {
      total,
      active,
      highlighted,
      averageRating: avgRating._avg.rating || 0,
      byRole: byRole.map(item => ({
        role: item.role,
        count: item._count,
      })),
    };
  }
}
