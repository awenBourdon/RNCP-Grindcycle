import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

class UsedBoardController {
  async create(req: NextRequest) {
    try {
      const body = await req.json();
      const { userId, boardCondition, description, image } = body;

      if (!userId || !boardCondition) {
        return NextResponse.json({ error: "Erreur." }, { status: 400 });
      }

      const board = await prisma.usedBoard.create({
        data: {
          userId,
          boardCondition,
          description: description || null,
          image: image || null,
        },
      });

      return NextResponse.json(board, { status: 201 });
    } catch (error) {
      console.error("Erreur API /used-board:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  }
}

const controller = new UsedBoardController();

export async function POST(req: NextRequest) {
  return controller.create(req);
}
