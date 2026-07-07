export type GlReviewFinding = {
    finding: string;
    risk: string;
    recommendedAction: string;
    severity: "Critical" | "High" | "Medium" | "Low";
  };
  
  
  export type GlReviewResult = {
    reviewStatus: "需要复核" | "正常" | "数据不足";
    keyFindings: GlReviewFinding[];
    riskFlags: string[];
    recommendedActions: string[];
    confidenceLevel: "High" | "Medium" | "Low";
  };
  
  
  
  function toNumber(value: unknown): number {
  
    if (typeof value === "number") {
      return value;
    }
  
  
    if (typeof value === "string") {
  
      const num = Number(
        value.replace(/,/g, "")
      );
  
      return Number.isFinite(num)
        ? num
        : 0;
    }
  
  
    return 0;
  }
  
  
  
  
  function getValue(
    row: Record<string, unknown>,
    keys: string[]
  ) {
  
    const matchedKey = Object.keys(row).find(
      (key) =>
        keys.some(
          (target) =>
            key
              .toLowerCase()
              .includes(target.toLowerCase())
        )
    );
  
  
    return matchedKey
      ? row[matchedKey]
      : undefined;
  
  }
  
  
  
  
  function getSeverity(
    variance: number,
    type: "variance" | "classification"
  ):
  "Critical" | "High" | "Medium" | "Low" {
  
  
    // 会计分类错误最高等级
    if(type === "classification") {
      return "Critical";
    }
  
  
  
    const absVariance =
      Math.abs(variance);
  
  
  
    if(absVariance >= 1) {
      return "High";
    }
  
  
    if(absVariance >= 0.5) {
      return "Medium";
    }
  
  
    return "Low";
  
  }
  
  
  
  
  
  export function analyzeGlReviewAgent(
    rows: Record<string, unknown>[]
  ): GlReviewResult {
  
  
  
    if(!rows || rows.length === 0) {
  
      return {
  
        reviewStatus:"数据不足",
  
        keyFindings:[],
  
        riskFlags:[
          "未检测到可审核的 GL 数据。"
        ],
  
        recommendedActions:[
          "请上传有效 GL Actuals 文件。"
        ],
  
        confidenceLevel:"Low"
  
      };
  
    }
  
  
  
  
    const findingMap =
      new Map<string, GlReviewFinding>();
  
  
  
  
  
    rows.forEach((row)=>{
  
  
      const accountCode =
        String(
          getValue(row,[
            "account code"
          ]) ?? ""
        );
  
  
  
      const accountName =
        String(
          getValue(row,[
            "account name"
          ]) ?? "Unknown Account"
        );
  
  
  
      const plLine =
        String(
          getValue(row,[
            "p&l line",
            "pl line"
          ]) ?? ""
        );
  
  
  
      const costCenter =
        String(
          getValue(row,[
            "cost center"
          ]) ?? ""
        );
  
  
  
      const actual =
        toNumber(
          getValue(row,[
            "actual"
          ])
        );
  
  
  
      const budget =
        toNumber(
          getValue(row,[
            "budget"
          ])
        );
  
  
  
      const forecast =
        toNumber(
          getValue(row,[
            "forecast"
          ])
        );
  
  
  
      const priorYear =
        toNumber(
          getValue(row,[
            "prior year"
          ])
        );
  
  
  
      const accountLabel =
        `${accountName} (${accountCode}) / ${costCenter}`;
  
  
  
      const accountKey =
        `${accountCode}-${costCenter}`;
  
  
  
      const issues:string[] = [];
  
  
  
      let severity:
      "Critical" |
      "High" |
      "Medium" |
      "Low" = "Low";
  
  
  
      function updateSeverity(
        current:
        "Critical" |
        "High" |
        "Medium" |
        "Low"
      ){
  
        const rank = {
          Critical:4,
          High:3,
          Medium:2,
          Low:1
        };
  
  
        if(rank[current] > rank[severity]) {
  
          severity = current;
  
        }
  
      }
  
  
  
  
  
      /*
        1. Account Misclassification
      */
  
  
      if(
        actual > 0 &&
        plLine.toLowerCase()
          .includes("revenue") &&
        accountName.toLowerCase()
          .includes("expense")
      ){
  
  
        issues.push(
          "费用类科目被归入收入报表分类"
        );
  
  
        updateSeverity(
          getSeverity(
            1,
            "classification"
          )
        );
  
  
      }
  
  
  
  
  
      /*
        2. Budget Variance
      */
  
  
      if(
        !plLine.toLowerCase()
          .includes("revenue")
        &&
        budget !== 0
      ){
  
  
        const variance =
          (
            Math.abs(actual)
            -
            Math.abs(budget)
          )
          /
          Math.abs(budget);
  
  
  
        if(variance > 0.2){
  
  
          issues.push(
            `实际发生金额超过预算 ${(variance * 100).toFixed(1)}%`
          );
  
  
          updateSeverity(
            getSeverity(
              variance,
              "variance"
            )
          );
  
  
        }
  
  
      }
  
  
  
  
  
      /*
        3. Forecast Variance
      */
  
  
      if(
        forecast !== 0
      ){
  
  
        const variance =
          (
            Math.abs(actual)
            -
            Math.abs(forecast)
          )
          /
          Math.abs(forecast);
  
  
  
        if(
          Math.abs(variance) > 0.25
        ){
  
  
          if(variance > 0){
  
            issues.push(
              `实际金额高于预测 ${(variance * 100).toFixed(1)}%`
            );
  
          }
          else{
  
            issues.push(
              `实际金额低于预测 ${(Math.abs(variance)*100).toFixed(1)}%`
            );
  
          }
  
  
  
          updateSeverity(
            getSeverity(
              variance,
              "variance"
            )
          );
  
  
        }
  
      }
  
  
  
  
  
      /*
        4. Prior Year Movement
      */
  
  
      if(
        priorYear !== 0
      ){
  
  
        const variance =
          (
            Math.abs(actual)
            -
            Math.abs(priorYear)
          )
          /
          Math.abs(priorYear);
  
  
  
        if(
          variance > 0.3
        ){
  
  
          issues.push(
            `相比去年同期增加 ${(variance*100).toFixed(1)}%`
          );
  
  
          updateSeverity(
            getSeverity(
              variance,
              "variance"
            )
          );
  
  
        }
  
      }
  
  
  
  
  
  
  
      if(issues.length > 0){
  
  
        findingMap.set(
          accountKey,
          {
  
            finding:
            `${accountLabel} 存在异常情况：${issues.join("；")}`,
  
  
  
            risk:
  
            severity === "Critical"
  
            ?
  
            "存在潜在会计分类错误风险，需要检查科目映射。"
  
            :
  
            "存在异常费用波动，需要进一步审核业务原因。",
  
  
  
  
            recommendedAction:
  
            severity === "Critical"
  
            ?
  
            "检查 GL 科目映射关系以及财务报表分类规则。"
  
            :
  
            "检查支持性文件、审批记录以及业务发生原因。",
  
  
  
  
            severity
  
          }
        );
  
  
      }
  
  
    });
  
  
  
  
  
    const priority = {
  
      Critical:4,
  
      High:3,
  
      Medium:2,
  
      Low:1
  
    };
  
  
  
  
    const findings =
  
      Array.from(
        findingMap.values()
      )
  
      .sort(
        (a,b)=>
          priority[b.severity]
          -
          priority[a.severity]
      )
  
      .slice(0,5);
  
  
  
  
  
    return {
  
  
      reviewStatus:
  
        findings.length > 0
  
        ?
  
        "需要复核"
  
        :
  
        "正常",
  
  
  
  
      keyFindings:
        findings,
  
  
  
  
      riskFlags:
  
        findings.map(
          item=>item.risk
        ),
  
  
  
  
      recommendedActions:
  
        findings.map(
          item=>item.recommendedAction
        ),
  
  
  
  
      confidenceLevel:
  
        rows.length >= 50
  
        ?
  
        "High"
  
        :
  
        "Medium"
  
  
    };
  
  }