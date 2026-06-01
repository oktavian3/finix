import { NextRequest, NextResponse } from "next/server";

interface FinancialData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingRate: number;
  topCategory: string;
  topCategoryAmount: number;
  topSource: string;
  topSourceAmount: number;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
}

interface GoalData {
  name: string;
  targetAmount: number;
  savedAmount: number;
  progress: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { financialSummary, goals, trendData }: {
      financialSummary: FinancialData;
      goals: GoalData[];
      trendData: { month: string; income: number; expense: number }[];
    } = body;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service is not configured" }, { status: 500 });
    }

    const prompt = buildAnalysisPrompt(financialSummary, goals, trendData);

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are Finix AI Advisor, a financial insights assistant for a global personal finance app built on Sui.
Analyze the provided financial summary and return clear, practical, concise insights in English.
Focus on spending patterns, saving rate, goal progress, risks, and concrete next steps.
Do not ask for more information. Work only from the provided data.
Do not make guarantees or investment advice. Keep the response under 5 short paragraphs.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API error:", response.status, errText);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const result = await response.json();
    const analysis = result.choices?.[0]?.message?.content || "Analysis could not be generated.";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}

function buildAnalysisPrompt(
  summary: FinancialData,
  goals: GoalData[],
  trendData: { month: string; income: number; expense: number }[],
): string {
  const catLines = Object.entries(summary.byCategory || {})
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => `  - ${cat}: $${amt.toFixed(2)}`)
    .join("\n");

  const srcLines = Object.entries(summary.bySource || {})
    .sort(([, a], [, b]) => b - a)
    .map(([src, amt]) => `  - ${src}: $${amt.toFixed(2)}`)
    .join("\n");

  const goalLines = (goals || [])
    .map((g) => `  - ${g.name}: $${g.savedAmount} / $${g.targetAmount} (${g.progress}%)`)
    .join("\n");

  const trendLines = (trendData || [])
    .map((t) => `  - ${t.month}: income=$${t.income.toFixed(0)}, expense=$${t.expense.toFixed(0)}`)
    .join("\n");

  return `Provide a financial analysis in English based on this data:

=== CURRENT MONTH SUMMARY ===
- Total Income: $${summary.totalIncome?.toFixed(2) || "0"}
- Total Expense: $${summary.totalExpense?.toFixed(2) || "0"}
- Net Balance: $${summary.netBalance?.toFixed(2) || "0"}
- Saving Rate: ${summary.savingRate || 0}%
- Top Category: ${summary.topCategory || "N/A"} ($${summary.topCategoryAmount?.toFixed(2) || "0"})
- Top Source: ${summary.topSource || "N/A"} ($${summary.topSourceAmount?.toFixed(2) || "0"})

=== EXPENSES BY CATEGORY ===
${catLines || "  (no data)"}

=== INCOME BY SOURCE ===
${srcLines || "  (no data)"}

=== GOALS ===
${goalLines || "  (no goals yet)"}

=== 6-MONTH TREND ===
${trendLines || "  (no trend data)"}

Provide actionable insights in English. Keep it concise, direct, and production-safe. Format with short paragraphs and bullet points where appropriate.`;
}
