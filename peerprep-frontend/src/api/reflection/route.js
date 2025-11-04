import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { pipeline } from '@xenova/transformers';

// Singleton for sentiment analyzer (loads once, reuses for performance)
class SentimentAnalyzer {
  static instance = null;
  
  static async getInstance() {
    if (this.instance === null) {
      console.log('🔄 Initializing NLP sentiment model...');
      this.instance = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      console.log('✅ Sentiment model ready');
    }
    return this.instance;
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { problem_id, progress_id, content, rating } = body;
    const userId = session.user.id;

    if (!problem_id || !content) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return Response.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // ✨ REAL NLP SENTIMENT ANALYSIS (CHANGED FROM KEYWORD MATCHING)
    const analyzer = await SentimentAnalyzer.getInstance();
    const sentimentResult = await analyzer(content);
    
    const sentimentScore = sentimentResult[0].label === 'POSITIVE' 
      ? sentimentResult[0].score 
      : -sentimentResult[0].score;
    
    const sentimentLabel = sentimentResult[0].label;

    const keywords = extractKeywords(content);
    const confidenceScore = extractConfidenceScore(content);

    // Insert reflection with all sentiment data
    const result = await sql`
      INSERT INTO reflections (
        user_id, problem_id, progress_id, content, 
        sentiment_score, sentiment_label, keywords, 
        confidence_score, rating
      )
      VALUES (
        ${userId}, ${problem_id}, ${progress_id || null}, ${content}, 
        ${sentimentScore}, ${sentimentLabel}, ${keywords}, 
        ${confidenceScore}, ${rating || null}
      )
      RETURNING *
    `;

    // Update daily sentiment trend
    const today = new Date().toISOString().split("T")[0];
    await sql`
      INSERT INTO sentiment_trends (user_id, date, avg_sentiment, problem_count)
      VALUES (${userId}, ${today}, ${sentimentScore}, 1)
      ON CONFLICT (user_id, date)
      DO UPDATE SET 
        avg_sentiment = (sentiment_trends.avg_sentiment * sentiment_trends.problem_count + ${sentimentScore}) / (sentiment_trends.problem_count + 1),
        problem_count = sentiment_trends.problem_count + 1
    `;

    return Response.json({ 
      reflection: result[0],
      sentiment: {
        label: sentimentLabel,
        score: sentimentScore
      }
    });

  } catch (error) {
    console.error("Error creating reflection:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const problemId = url.searchParams.get("problem_id");

    if (problemId) {
      const reflections = await sql`
        SELECT r.*, p.title, p.difficulty, p.category
        FROM reflections r
        JOIN problems p ON r.problem_id = p.id
        WHERE r.user_id = ${userId} AND r.problem_id = ${problemId}
        ORDER BY r.created_at DESC
      `;
      return Response.json({ reflections });
    } else {
      const reflections = await sql`
        SELECT r.*, p.title, p.difficulty, p.category
        FROM reflections r
        JOIN problems p ON r.problem_id = p.id
        WHERE r.user_id = ${userId}
        ORDER BY r.created_at DESC
        LIMIT 50
      `;
      return Response.json({ reflections });
    }
  } catch (error) {
    console.error("Error fetching reflections:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function extractKeywords(text) {
  const commonWords = [
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "is", "was", "are", "were", "this", "that", "i", "me", "my",
  ];
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.includes(word));

  return [...new Set(words)].slice(0, 5);
}

function extractConfidenceScore(text) {
  const confidenceWords = [
    "confident", "sure", "certain", "understand", "clear", "easy",
  ];
  const uncertainWords = [
    "confused", "unsure", "difficult", "hard", "stuck", "lost",
  ];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0.5;

  words.forEach((word) => {
    if (confidenceWords.includes(word)) score += 0.1;
    if (uncertainWords.includes(word)) score -= 0.1;
  });

  return Math.max(0, Math.min(1, score));
}
