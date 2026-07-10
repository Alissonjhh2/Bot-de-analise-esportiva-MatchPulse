/*
  Warnings:

  - The values [DANGEROUS_ATTACKS] on the enum `Indicator` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- Since OFFENSIVE_PRESSURE was already added manually, we just need to remove DANGEROUS_ATTACKS
-- PostgreSQL doesn't support removing enum values directly, so we need to recreate the enum
BEGIN;
-- First, ensure no records use DANGEROUS_ATTACKS (should already be done)
-- Then recreate the enum without DANGEROUS_ATTACKS
ALTER TYPE "Indicator" RENAME TO "Indicator_old";
CREATE TYPE "Indicator" AS ENUM ('GOALS', 'CORNERS', 'OFFENSIVE_PRESSURE', 'SHOTS_ON_GOAL', 'CARDS', 'FOULS', 'OFFSIDES', 'BALL_POSSESSION');
ALTER TABLE "StrategyCondition" ALTER COLUMN "indicator" TYPE "Indicator" USING ("indicator"::text::"Indicator");
DROP TYPE "Indicator_old";
COMMIT;
