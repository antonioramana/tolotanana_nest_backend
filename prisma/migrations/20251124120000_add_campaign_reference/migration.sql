-- Add reference column
ALTER TABLE "campaigns" ADD COLUMN "reference" TEXT;

-- Populate existing rows with sequential references
WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS rn
  FROM "campaigns"
)
UPDATE "campaigns" AS c
SET "reference" = 'TAAA' || LPAD(ordered.rn::text, 6, '0')
FROM ordered
WHERE ordered.id = c.id;

-- Ensure the column is required and unique
ALTER TABLE "campaigns" ALTER COLUMN "reference" SET NOT NULL;
ALTER TABLE "campaigns" ADD CONSTRAINT "Campaign_reference_key" UNIQUE ("reference");

