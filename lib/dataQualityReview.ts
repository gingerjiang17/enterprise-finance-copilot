export type DataQualityStatus = "Pass" | "Warning" | "Failed";

export type DataQualityCheck = {
  title: string;
  status: DataQualityStatus;
  message: string;
  affectedRows?: number;
};

export type DataQualityReviewResult = {
  overallStatus: DataQualityStatus;
  totalRows: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  checks: DataQualityCheck[];
};

function getMatchedKey(row: Record<string, unknown>, keys: string[]) {
  return Object.keys(row).find((key) =>
    keys.some((target) =>
      key.toLowerCase().includes(target.toLowerCase())
    )
  );
}

function getValue(row: Record<string, unknown>, keys: string[]) {
  const matchedKey = getMatchedKey(row, keys);
  return matchedKey ? row[matchedKey] : undefined;
}

function isMissing(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  );
}

function isValidNumber(value: unknown) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return false;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "string") {
    const num = Number(value.replace(/,/g, ""));
    return Number.isFinite(num);
  }

  return false;
}

function getOverallStatus(checks: DataQualityCheck[]): DataQualityStatus {
  if (checks.some((check) => check.status === "Failed")) {
    return "Failed";
  }

  if (checks.some((check) => check.status === "Warning")) {
    return "Warning";
  }

  return "Pass";
}

export function reviewDataQuality(
  rows: Record<string, unknown>[]
): DataQualityReviewResult {
  if (!rows || rows.length === 0) {
    const checks: DataQualityCheck[] = [
      {
        title: "Data Availability",
        status: "Failed",
        message: "未检测到可检查的数据记录。",
        affectedRows: 0,
      },
    ];

    return {
      overallStatus: "Failed",
      totalRows: 0,
      passedChecks: 0,
      warningChecks: 0,
      failedChecks: 1,
      checks,
    };
  }

  const firstRow = rows[0];

  const requiredFields = [
    {
      label: "Account Code",
      keys: ["account code"],
    },
    {
      label: "Account Name",
      keys: ["account name"],
    },
    {
      label: "P&L Line",
      keys: ["p&l line", "pl line"],
    },
    {
      label: "Actual",
      keys: ["actual"],
    },
    {
      label: "Budget",
      keys: ["budget"],
    },
    {
      label: "Cost Center",
      keys: ["cost center"],
    },
  ];

  const missingRequiredFields = requiredFields.filter(
    (field) => !getMatchedKey(firstRow, field.keys)
  );

  const checks: DataQualityCheck[] = [];

  checks.push({
    title: "Required Fields",
    status: missingRequiredFields.length > 0 ? "Failed" : "Pass",
    message:
      missingRequiredFields.length > 0
        ? `缺少必要字段：${missingRequiredFields
            .map((field) => field.label)
            .join("、")}。`
        : "必要字段已识别，可支持基础 GL Review 分析。",
    affectedRows: missingRequiredFields.length,
  });

  const missingCostCenterRows = rows.filter((row) =>
    isMissing(getValue(row, ["cost center"]))
  ).length;

  checks.push({
    title: "Cost Center Completeness",
    status: missingCostCenterRows > 0 ? "Warning" : "Pass",
    message:
      missingCostCenterRows > 0
        ? `检测到 ${missingCostCenterRows} 条记录缺少 Cost Center，可能影响部门费用归集。`
        : "Cost Center 字段完整，可支持费用归属和责任部门分析。",
    affectedRows: missingCostCenterRows,
  });

  const missingAccountNameRows = rows.filter((row) =>
    isMissing(getValue(row, ["account name"]))
  ).length;

  checks.push({
    title: "Account Name Completeness",
    status: missingAccountNameRows > 0 ? "Warning" : "Pass",
    message:
      missingAccountNameRows > 0
        ? `检测到 ${missingAccountNameRows} 条记录缺少 Account Name，可能影响科目识别。`
        : "Account Name 字段完整，可支持科目分类和异常识别。",
    affectedRows: missingAccountNameRows,
  });

  const invalidActualRows = rows.filter((row) => {
    const actual = getValue(row, ["actual"]);
    return !isValidNumber(actual);
  }).length;

  checks.push({
    title: "Amount Format Validation",
    status: invalidActualRows > 0 ? "Failed" : "Pass",
    message:
      invalidActualRows > 0
        ? `检测到 ${invalidActualRows} 条记录的 Actual 金额格式无效。`
        : "Actual 金额格式校验通过，可用于数值计算。",
    affectedRows: invalidActualRows,
  });

  const duplicateKeys = new Set<string>();

const duplicatedRows = rows.filter((row) => {
  const period = String(
    getValue(row, ["period", "month", "date"]) ?? ""
  );

  const entity = String(
    getValue(row, ["entity"]) ?? ""
  );

  const accountCode = String(
    getValue(row, ["account code"]) ?? ""
  );

  const costCenter = String(
    getValue(row, ["cost center"]) ?? ""
  );

  const plLine = String(
    getValue(row, ["p&l line", "pl line"]) ?? ""
  );

  const actual = String(
    getValue(row, ["actual"]) ?? ""
  );

  const key = [
    period,
    entity,
    accountCode,
    costCenter,
    plLine,
    actual,
  ].join("|");

  if (!period && !entity && !accountCode && !costCenter && !plLine && !actual) {
    return false;
  }

  if (duplicateKeys.has(key)) {
    return true;
  }

  duplicateKeys.add(key);
  return false;
}).length;

  checks.push({
    title: "Duplicate Record Check",
    status: duplicatedRows > 0 ? "Warning" : "Pass",
    message:
      duplicatedRows > 0
      ? `检测到 ${duplicatedRows} 条疑似完全重复记录，建议复核是否为重复导出或重复入账。`
      : "未发现明显完全重复的 GL 记录。",
    affectedRows: duplicatedRows,
  });

  const overallStatus = getOverallStatus(checks);

  return {
    overallStatus,
    totalRows: rows.length,
    passedChecks: checks.filter((check) => check.status === "Pass").length,
    warningChecks: checks.filter((check) => check.status === "Warning").length,
    failedChecks: checks.filter((check) => check.status === "Failed").length,
    checks,
  };
}