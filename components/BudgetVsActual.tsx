"use client";

type Props = {
  data: any[];
};

export default function BudgetVsActual({ data }: Props) {
  // 模拟 Budget（因为 Excel 可能没有）
  const budget = 100000000;

  // 从数据里算 Actual
  const actual = data.reduce((sum, row) => {
    return sum + (Number(row.Revenue) || 0);
  }, 0);

  const variance = actual - budget;
  const variancePct = budget ? (variance / budget) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">
        Budget vs Actual (Revenue)
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-gray-500">Budget</p>
          <p className="text-xl font-bold">
            {budget.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Actual</p>
          <p className="text-xl font-bold">
            {actual.toLocaleString()}
          </p>
        </div>

        <div>
          <p className={variance >= 0 ? "text-green-600" : "text-red-600"}>
            Variance {variance.toLocaleString()} ({variancePct.toFixed(1)}%)
          </p>
        </div>
      </div>
    </div>
  );
}