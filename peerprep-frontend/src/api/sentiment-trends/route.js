import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await sql`
      SELECT 
        date,
        avg_sentiment,
        problem_count
      FROM sentiment_trends
      WHERE user_id = ${userId}
        AND date >= ${startDate.toISOString().split('T')[0]}
        AND date <= ${endDate.toISOString().split('T')[0]}
      ORDER BY date ASC
    `;

    const filledTrends = fillMissingDates(trends, startDate, endDate);

    return Response.json({ trends: filledTrends });

  } catch (error) {
    console.error("Error fetching sentiment trends:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function fillMissingDates(trends, startDate, endDate) {
  const result = [];
  const trendMap = new Map(trends.map(t => [t.date, t]));
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (trendMap.has(dateStr)) {
      result.push(trendMap.get(dateStr));
    } else {
      result.push({
        date: dateStr,
        avg_sentiment: 0,
        problem_count: 0
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}
