import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, note } = body;

    if (!name) {
      return Response.json({ error: "请填写地点名称" }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({ where: { id } });
    if (!invite) {
      return Response.json({ error: "邀请不存在" }, { status: 404 });
    }

    const location = await prisma.location.create({
      data: {
        id: uuid(),
        inviteId: id,
        name,
        note: note || null,
        createdBy: "guest",
        sortOrder: 999,
      },
    });

    return Response.json({ success: true, location });
  } catch (error) {
    console.error("Add location error:", error);
    return Response.json({ error: "添加失败" }, { status: 500 });
  }
}
