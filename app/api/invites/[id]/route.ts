import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const invite = await prisma.invite.findUnique({
      where: { id },
      include: {
        dates: { orderBy: { sortOrder: "asc" } },
        locations: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!invite) {
      return Response.json({ error: "邀请不存在" }, { status: 404 });
    }

    return Response.json({
      id: invite.id,
      girlName: invite.girlName,
      dates: invite.dates,
      locations: invite.locations,
      createdAt: invite.createdAt,
    });
  } catch (error) {
    console.error("Get invite error:", error);
    return Response.json({ error: "获取失败" }, { status: 500 });
  }
}
