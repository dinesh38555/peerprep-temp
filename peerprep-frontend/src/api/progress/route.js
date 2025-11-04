import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const totalProblems = await sql`
      SELECT COUNT(*) as total FROM problems
    `;

    const userProgress = await sql`
      SELECT 
        COUNT(DISTINCT CASE WHEN status = 'solved' THEN problem_id END) as solved,
        COUNT(DISTINCT CASE WHEN status = 'attempted' THEN problem_id END) as attempted
      FROM user_progress
      WHERE user_id = ${userId}
    `;

    const progress = {
      solved: parseInt(userProgress[0]?.solved || 0),
      attempted: parseInt(userProgress[0]?.attempted || 0),
      total: parseInt(totalProblems[0]?.total || 37)
    };

    return Response.json({ progress });

  } catch (error) {
    console.error("Error fetching progress:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
