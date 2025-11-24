import type { Prisma } from '@prisma/client';

declare module '@prisma/client' {
  interface Campaign {
    reference: string;
  }

  namespace Prisma {
    type SortOrder = 'asc' | 'desc';

    interface CampaignCreateInput {
      reference?: string;
    }

    interface CampaignUncheckedCreateInput {
      reference?: string;
    }

    interface CampaignOrderByWithRelationInput {
      reference?: SortOrder;
    }

    interface CampaignSelect {
      reference?: boolean;
    }
  }
}





