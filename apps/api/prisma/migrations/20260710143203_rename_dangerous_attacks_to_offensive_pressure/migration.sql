/*
  Warnings:

  - The values [DANGEROUS_ATTACKS] on the enum `Indicator` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Indicator_new" AS ENUM ('GOALS', 'CORNERS', 'OFFENSIVE_PRESSURE', 'SHOTS_ON_GOAL', 'CARDS', 'FOULS', 'OFFSIDES', 'BALL_POSSESSION');
ALTER TABLE "StrategyCondition" ALTER COLUMN "indicator" TYPE "Indicator_new" USING ("indicator"::text::"Indicator_new");
ALTER TYPE "Indicator" RENAME TO "Indicator_old";
ALTER TYPE "Indicator_new" RENAME TO "Indicator";
DROP TYPE "Indicator_old";
COMMIT;
