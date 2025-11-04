import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch recent reflections
    const recentActivity = await sql`
      SELECT 
        r.sentiment_label,
        r.confidence_score,
        r.rating,
        p.difficulty,
        p.title,
        p.category
      FROM reflections r
      JOIN problems p ON r.problem_id = p.id
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC
      LIMIT 5
    `;

    // Fetch user statistics
    const stats = await sql`
      SELECT 
        COUNT(DISTINCT CASE WHEN up.status = 'solved' THEN up.problem_id END) as solved_count,
        COUNT(DISTINCT CASE WHEN up.status = 'attempted' THEN up.problem_id END) as attempted_count,
        COUNT(DISTINCT CASE WHEN p.difficulty = 'Easy' AND up.status = 'solved' THEN up.problem_id END) as easy_solved,
        COUNT(DISTINCT CASE WHEN p.difficulty = 'Medium' AND up.status = 'solved' THEN up.problem_id END) as medium_solved,
        COUNT(DISTINCT CASE WHEN p.difficulty = 'Hard' AND up.status = 'solved' THEN up.problem_id END) as hard_solved
      FROM user_progress up
      JOIN problems p ON up.problem_id = p.id
      WHERE up.user_id = ${userId}
    `;

    const userStats = stats[0] || { 
      solved_count: 0, 
      attempted_count: 0,
      easy_solved: 0,
      medium_solved: 0,
      hard_solved: 0
    };

    const nudge = generateNudge(recentActivity, userStats);

    return Response.json({ nudge });

  } catch (error) {
    console.error("Error fetching daily nudge:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function generateNudge(recentActivity, stats) {
  const { solved_count, easy_solved, medium_solved, hard_solved } = stats;

  if (recentActivity.length === 0) {
    return {
      title: "Welcome! 🎯",
      message: "Start solving problems to get personalized motivational tips!"
    };
  }

  const lastReflection = recentActivity[0];
  const avgConfidence = recentActivity.reduce((sum, r) => sum + (r.confidence_score || 0.5), 0) / recentActivity.length;
  const positiveCount = recentActivity.filter(r => r.sentiment_label === 'POSITIVE').length;

  if (avgConfidence > 0.7 && positiveCount >= 3) {
    if (medium_solved === 0 && easy_solved >= 3) {
      return {
        title: "Ready for a challenge? 💪",
        message: `You've mastered ${easy_solved} easy problems! Time to tackle medium-difficulty problems.`
      };
    }
    return {
      title: "Keep the momentum! 🔥",
      message: `Reflecting on your '${lastReflection.title}' solution showed great confidence!`
    };
  }

  if (avgConfidence < 0.4) {
    return {
      title: "Take it step by step 🌱",
      message: "Review solution patterns and try similar problems to build confidence."
    };
  }

  return {
    title: "Keep it up! 👏",
    message: `${solved_count} problems solved! Every problem makes you stronger.`
  };
}
