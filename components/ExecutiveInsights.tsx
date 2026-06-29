import {
    generateExecutiveInsights,
    type ExecutiveInsightTone,
  } from "@/lib/insights";
  
  type ExecutiveInsightsProps = {
    rows: Record<string, unknown>[];
  };
  
  const toneStyles: Record<
    ExecutiveInsightTone,
    {
      label: string;
      cardClassName: string;
      badgeClassName: string;
    }
  > = {
    positive: {
      label: "Positive",
      cardClassName: "border-emerald-200 bg-emerald-50",
      badgeClassName: "bg-emerald-100 text-emerald-700",
    },
    warning: {
      label: "Attention",
      cardClassName: "border-amber-200 bg-amber-50",
      badgeClassName: "bg-amber-100 text-amber-700",
    },
    neutral: {
      label: "Insight",
      cardClassName: "border-slate-200 bg-slate-50",
      badgeClassName: "bg-slate-200 text-slate-700",
    },
  };
  
  export default function ExecutiveInsights({ rows }: ExecutiveInsightsProps) {
    const result = generateExecutiveInsights(rows);
  
    if (!result.hasData) {
      return (
        <section className="mt-6 w-full max-w-6xl rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-left shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Executive Finance Insights
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Automated management-level commentary based on the uploaded
              financial data.
            </p>
          </div>
  
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800">
              Insights are not available for this sheet.
            </p>
            <p className="mt-1">{result.message}</p>
          </div>
        </section>
      );
    }
  
    return (
      <section className="mt-6 w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Executive Finance Insights
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Automated management-level commentary based on the uploaded financial
            data.
          </p>
        </div>
  
        <div className="grid gap-3 md:grid-cols-2">
          {result.insights.map((insight) => {
            const style = toneStyles[insight.tone];
  
            return (
              <article
                key={`${insight.title}-${insight.description}`}
                className={`rounded-xl border p-4 ${style.cardClassName}`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {insight.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${style.badgeClassName}`}
                  >
                    {style.label}
                  </span>
                </div>
  
                <p className="text-sm leading-6 text-slate-600">
                  {insight.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    );
  }