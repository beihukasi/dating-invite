import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { girlName, dates, locations } = body;

    if (!girlName || !dates || dates.length === 0 || !locations || locations.length === 0) {
      return Response.json({ error: "请填写完整信息" }, { status: 400 });
    }

    const invite = await prisma.invite.create({
      data: {
        id: uuid(),
        girlName,
        dashboardToken: uuid(),
        dates: {
          create: dates.map((d: { dateLabel: string; dateValue: string }, i: number) => ({
            id: uuid(),
            dateLabel: d.dateLabel,
            dateValue: d.dateValue,
            sortOrder: i,
          })),
        },
        locations: {
          create: locations.map((l: { name: string; note?: string }, i: number) => ({
            id: uuid(),
            name: l.name,
            note: l.note || null,
            createdBy: "host",
            sortOrder: i,
          })),
        },
      },
      include: {
        dates: true,
        locations: true,
      },
    });

    return Response.json({
      id: invite.id,
      dashboardToken: invite.dashboardToken,
      inviteUrl: `/invite/${invite.id}`,
      dashboardUrl: `/dashboard/${invite.dashboardToken}`,
    });
  } catch (error) {
    console.error("Create invite error:", error);
    return Response.json({ error: "创建失败，请重试" }, { status: 500 });
  }
}
