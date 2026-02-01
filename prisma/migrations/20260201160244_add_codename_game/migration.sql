-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "role" TEXT;

-- CreateTable
CREATE TABLE "CodenameWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodenameWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodenameGame" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "currentTeam" TEXT NOT NULL DEFAULT 'red',
    "redRemaining" INTEGER NOT NULL DEFAULT 9,
    "blueRemaining" INTEGER NOT NULL DEFAULT 8,
    "gameOver" BOOLEAN NOT NULL DEFAULT false,
    "winner" TEXT,
    "currentClue" TEXT,
    "currentNumber" INTEGER,
    "guessesLeft" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodenameGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodenameCard" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "revealed" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,

    CONSTRAINT "CodenameCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodenameWord_word_key" ON "CodenameWord"("word");

-- CreateIndex
CREATE UNIQUE INDEX "CodenameGame_roomId_key" ON "CodenameGame"("roomId");

-- CreateIndex
CREATE INDEX "CodenameCard_gameId_idx" ON "CodenameCard"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "CodenameCard_gameId_position_key" ON "CodenameCard"("gameId", "position");

-- AddForeignKey
ALTER TABLE "CodenameGame" ADD CONSTRAINT "CodenameGame_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodenameCard" ADD CONSTRAINT "CodenameCard_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "CodenameGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;
