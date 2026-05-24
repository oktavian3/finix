import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { financialSummary } = body;

    // TODO: Replace with actual DeepSeek/Claude API call
    // const response = await anthropic.messages.create({ ... });
    
    const mockAnalysis = `## 📊 Monthly Financial Analysis

**Income:** $${financialSummary?.totalIncome || 0}
**Expenses:** $${financialSummary?.totalExpense || 0}
**Saving Rate:** ${financialSummary?.savingRate || 0}%

### Key Insights
- Your saving rate of ${financialSummary?.savingRate || 0}% is ${(financialSummary?.savingRate || 0) >= 30 ? 'healthy' : 'below the 30% target'}
- Largest expense category: ${financialSummary?.topCategory || 'N/A'}
- ${financialSummary?.totalExpense < financialSummary?.totalIncome ? 'You are living within your means.' : 'You are spending more than you earn.'}

### Recommendations
1. Try to save at least 30% of your income each month
2. Review your largest spending categories for potential cuts
3. Set up automatic savings for your active goals`;

    return NextResponse.json({ analysis: mockAnalysis });
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
