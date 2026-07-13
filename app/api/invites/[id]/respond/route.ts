import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { selectedDateId, selectedLocationId, locationName, locationNote } = body;

    if (!selectedDateId) {
      return Response.json({ error: "请选择日期" }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({ where: { id } });
    if (!invite) {
      return Response.json({ error: "邀请不存在" }, { status: 404 });
    }

    const response = await prisma.response.create({
      data: {
        id: uuid(),
        inviteId: id,
        selectedDateId,
        selectedLocationId: selectedLocationId || null,
        locationName: locationName || null,
        locationNote: locationNote || null,
      },
      include: {
        date: true,
        location: true,
      },
    });

    return Response.json({ success: true, response });
  } catch (error) {
    console.error("Submit response error:", error);
    return Response.json({ error: "提交失败" }, { status: 500 });
  }
}
