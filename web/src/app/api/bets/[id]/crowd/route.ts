import { api, ApiError, type Crowd } from "@/lib/api";

// the crowd sheet loads on tap, so the feed never pays for it up front
export async function GET(_req: Request, ctx: RouteContext<"/api/bets/[id]/crowd">) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Bad bet id" }, { status: 400 });
  try {
    return Response.json(await api<Crowd>(`/bets/${id}/crowd`, undefined, { guest: true }));
  } catch (e) {
    return Response.json({ error: "Could not load who is in" }, { status: e instanceof ApiError ? e.status : 502 });
  }
}
