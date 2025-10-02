-- CreateTable
CREATE TABLE "platform_fees" (
    "id" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_fees_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "platform_fees" ADD CONSTRAINT "platform_fees_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
