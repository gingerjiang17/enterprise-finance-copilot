export type GlExceptionType =
  | "Budget Variance"
  | "Forecast Deviation"
  | "Prior Period Change"
  | "Account Misclassification"
  | "Unusual Journal Entry"
  | "Data Quality Issue";

export type GlSeverity =
  | "Critical"
  | "High"
  | "Medium"
  | "Low";

  export type GlReviewFinding = {
    exceptionType: GlExceptionType;
    relatedRuleChecks: GlExceptionType[];
    finding: string;
    detectionLogic: string[];
    businessImpact: string;
    risk: string;
    recommendedAction: string;
    severity: GlSeverity;
  };

export type GlReviewResult = {
  reviewStatus: "需要复核" | "正常" | "数据不足";
  keyFindings: GlReviewFinding[];
  riskFlags: string[];
  recommendedActions: string[];
  confidenceLevel: "High" | "Medium" | "Low";
};

type GlIssue = {
  exceptionType: GlExceptionType;
  message: string;
  detectionLogic: string[];
  businessImpact: string;
  risk: string;
  recommendedAction: string;
  severity: GlSeverity;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const num = Number(value.replace(/,/g, ""));

    return Number.isFinite(num) ? num : 0;
  }

  return 0;
}

function getValue(row: Record<string, unknown>, keys: string[]) {
  const matchedKey = Object.keys(row).find((key) =>
    keys.some((target) =>
      key.toLowerCase().includes(target.toLowerCase())
    )
  );

  return matchedKey ? row[matchedKey] : undefined;
}

function getSeverity(
  variance: number,
  type: "variance" | "classification"
): GlSeverity {
  if (type === "classification") {
    return "Critical";
  }

  const absVariance = Math.abs(variance);

  if (absVariance >= 1) {
    return "High";
  }

  if (absVariance >= 0.5) {
    return "Medium";
  }

  return "Low";
}

function getHighestSeverity(items: GlIssue[]): GlSeverity {
  const priority: Record<GlSeverity, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return items.reduce<GlSeverity>((highest, item) => {
    return priority[item.severity] > priority[highest]
      ? item.severity
      : highest;
  }, "Low");
}

function getPrimaryIssue(items: GlIssue[]): GlIssue {
  const priority: Record<GlSeverity, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return [...items].sort(
    (a, b) => priority[b.severity] - priority[a.severity]
  )[0];
}

export function analyzeGlReviewAgent(
  rows: Record<string, unknown>[]
): GlReviewResult {
  if (!rows || rows.length === 0) {
    return {
      reviewStatus: "数据不足",
      keyFindings: [],
      riskFlags: ["未检测到可审核的 GL 数据。"],
      recommendedActions: ["请上传有效 GL Actuals 文件。"],
      confidenceLevel: "Low",
    };
  }

  const findingMap = new Map<string, GlReviewFinding>();

  rows.forEach((row) => {
    const accountCode = String(
      getValue(row, ["account code"]) ?? ""
    );

    const accountName = String(
      getValue(row, ["account name"]) ?? "Unknown Account"
    );

    const plLine = String(
      getValue(row, ["p&l line", "pl line"]) ?? ""
    );

    const costCenter = String(
      getValue(row, ["cost center"]) ?? ""
    );

    const actual = toNumber(getValue(row, ["actual"]));
    const budget = toNumber(getValue(row, ["budget"]));
    const forecast = toNumber(getValue(row, ["forecast"]));
    const priorYear = toNumber(getValue(row, ["prior year"]));

    const accountLabel = `${accountName} (${accountCode}) / ${costCenter}`;
    const accountKey = `${accountCode}-${costCenter}`;

    const issues: GlIssue[] = [];

    /*
      1. Account Misclassification
    */
    if (
      actual > 0 &&
      plLine.toLowerCase().includes("revenue") &&
      accountName.toLowerCase().includes("expense")
    ) {
      issues.push({
        exceptionType: "Account Misclassification",

        message: "费用类科目被归入收入报表分类",

        detectionLogic: [
          "P&L Line 被识别为 Revenue 类别。",
          "Account Name 包含 Expense 相关关键词。",
          "费用类科目与收入类报表分类不一致。",
        ],

        businessImpact:
          "该异常可能导致收入、费用及利润分类不准确，影响管理报表的可靠性。",

        risk:
          "存在潜在会计分类错误风险，需要检查科目映射。",

        recommendedAction:
          "检查 GL 科目映射关系以及财务报表分类规则。",

        severity: getSeverity(1, "classification"),
      });
    }

    /*
      2. Budget Variance
    */
    if (
      !plLine.toLowerCase().includes("revenue") &&
      budget !== 0
    ) {
      const variance =
        (Math.abs(actual) - Math.abs(budget)) / Math.abs(budget);

      if (variance > 0.2) {
        issues.push({
          exceptionType: "Budget Variance",

          message: `实际发生金额超过预算 ${(variance * 100).toFixed(1)}%`,

          detectionLogic: [
            "Actual amount 高于 Budget amount。",
            `Budget variance rate 为 ${(variance * 100).toFixed(1)}%。`,
            "Variance rate 超过 20% 预算复核阈值。",
          ],

          businessImpact:
            "该异常可能导致部门费用超出预算，并影响月度经营利润表现。",

          risk:
            "存在预算超支风险，需要确认费用发生是否经过审批及是否符合预算控制要求。",

          recommendedAction:
            "复核预算执行情况，检查支持性文件、审批记录以及费用发生原因。",

          severity: getSeverity(variance, "variance"),
        });
      }
    }

    /*
      3. Forecast Deviation
    */
    if (forecast !== 0) {
      const variance =
        (Math.abs(actual) - Math.abs(forecast)) / Math.abs(forecast);

      if (Math.abs(variance) > 0.25) {
        const isHigherThanForecast = variance > 0;

        issues.push({
          exceptionType: "Forecast Deviation",

          message: isHigherThanForecast
            ? `实际金额高于预测 ${(variance * 100).toFixed(1)}%`
            : `实际金额低于预测 ${(Math.abs(variance) * 100).toFixed(1)}%`,

          detectionLogic: [
            "Actual amount 与 Forecast amount 存在明显偏离。",
            `Forecast deviation rate 为 ${(variance * 100).toFixed(1)}%。`,
            "Deviation rate 超过 25% 预测偏差复核阈值。",
          ],

          businessImpact:
            "该异常可能影响滚动预测准确性，说明 forecast assumptions 可能需要更新。",

          risk:
            "存在预测偏差风险，需要进一步确认业务变化是否已经反映在预测模型中。",

          recommendedAction:
            "复核 forecast assumptions，并与业务部门确认实际发生金额偏离预测的原因。",

          severity: getSeverity(variance, "variance"),
        });
      }
    }

    /*
      4. Prior Period Change
    */
    if (priorYear !== 0) {
      const variance =
        (Math.abs(actual) - Math.abs(priorYear)) /
        Math.abs(priorYear);

      if (variance > 0.3) {
        issues.push({
          exceptionType: "Prior Period Change",

          message: `相比去年同期增加 ${(variance * 100).toFixed(1)}%`,

          detectionLogic: [
            "Current actual amount 高于 Prior Year amount。",
            `Prior year change rate 为 ${(variance * 100).toFixed(1)}%。`,
            "Change rate 超过 30% 同比波动复核阈值。",
          ],

          businessImpact:
            "该异常可能说明费用结构发生变化，或存在一次性费用、重分类、补提或跨期入账情况。",

          risk:
            "存在异常同比波动风险，需要进一步审核业务原因。",

          recommendedAction:
            "检查支持性文件、审批记录以及业务发生原因，并确认是否存在一次性项目或跨期调整。",

          severity: getSeverity(variance, "variance"),
        });
      }
    }

    /*
      5. Data Quality Issue
    */
    if (!costCenter) {
      issues.push({
        exceptionType: "Data Quality Issue",

        message: "缺少 Cost Center 信息",

        detectionLogic: [
          "Cost Center 字段为空。",
          "GL 记录缺少费用归属维度。",
        ],

        businessImpact:
          "该异常可能影响部门费用归集、成本中心分析以及后续管理报表维度拆分。",

        risk:
          "存在数据质量风险，可能导致费用无法正确分摊到责任部门。",

        recommendedAction:
          "补充 Cost Center 信息，并检查 Excel 源数据或 ERP 导出字段是否完整。",

        severity: "Medium",
      });
    }

    if (issues.length > 0) {
      const primaryIssue = getPrimaryIssue(issues);
      const finalSeverity = getHighestSeverity(issues);

      const relatedRuleChecks = Array.from(
        new Set(
          issues
            .map((item) => item.exceptionType)
            .filter((type) => type !== primaryIssue.exceptionType)
        )
      );
      
      findingMap.set(accountKey, {
        exceptionType: primaryIssue.exceptionType,
      
        relatedRuleChecks,
      
        finding: `${accountLabel} 触发 ${primaryIssue.exceptionType} 检查，存在需要进一步复核的 GL 异常项目。`,
      
        detectionLogic: issues.flatMap(
          (item) => item.detectionLogic
        ),
      
        businessImpact: primaryIssue.businessImpact,
      
        risk: primaryIssue.risk,
      
        recommendedAction: primaryIssue.recommendedAction,
      
        severity: finalSeverity,
      });
    }
  });

  const priority: Record<GlSeverity, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const findings = Array.from(findingMap.values())
    .sort(
      (a, b) =>
        priority[b.severity] - priority[a.severity]
    )
    .slice(0, 5);

  return {
    reviewStatus: findings.length > 0 ? "需要复核" : "正常",

    keyFindings: findings,

    riskFlags: findings.map((item) => item.risk),

    recommendedActions: findings.map(
      (item) => item.recommendedAction
    ),

    confidenceLevel: rows.length >= 50 ? "High" : "Medium",
  };
}