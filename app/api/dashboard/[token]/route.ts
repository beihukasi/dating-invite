import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    const invite = await prisma.invite.findUnique({
      where: { dashboardToken: token },
      include: {
        dates: { orderBy: { sortOrder: "asc" } },
        locations: { orderBy: { sortOrder: "asc" } },
        responses: {
          include: {
            date: true,
            location: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!invite) {
      return Response.json({ error: "管理链接无效" }, { status: 404 });
    }

    return Response.json({
      girlName: invite.girlName,
      createdAt: invite.createdAt,
      dates: invite.dates,
      locations: invite.locations,
      responses: invite.responses,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return Response.json({ error: "获取失败" }, { status: 500 });
  }
}
