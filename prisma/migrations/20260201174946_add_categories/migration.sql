-- AlterTable
ALTER TABLE "CodenameCard" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "selectedCategories" TEXT[] DEFAULT ARRAY[]::TEXT[];
