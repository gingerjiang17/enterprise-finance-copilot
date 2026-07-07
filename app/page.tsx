"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import KpiCards from "@/components/KpiCards";
import BudgetVsActual from "@/components/BudgetVsActual";
import BusinessUnitPerformance from "@/components/BusinessUnitPerformance";
import RegionPerformance from "@/components/RegionPerformance";
import GlActualsSummary from "@/components/GlActualsSummary";
import AiGlReviewAgent from "@/components/AiGlReviewAgent";
import SheetTypeBadge from "@/components/SheetTypeBadge";
import PreviewTable from "@/components/PreviewTable";
import TrendCharts from "@/components/TrendCharts";
import AiFinanceNarrative from "@/components/AiFinanceNarrative";
import { buildTrendChartData } from "@/lib/charts";
import { getSheetRows, type Row } from "@/lib/excel";
import { calculateKpis } from "@/lib/kpi";
import { detectSheetType } from "@/lib/sheetType";

export default function Home() {
  const workbookRef = useRef<XLSX.WorkBook | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [sheetRows, setSheetRows] = useState<Row[]>([]);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  function resetWorkbook() {
    workbookRef.current = null;
    setFileName(null);
    setSheetNames([]);
    setSelectedSheet(null);
    setSheetRows([]);
  }

  function loadWorkbook(workbook: XLSX.WorkBook, displayFileName: string) {
    workbookRef.current = workbook;
    setFileName(displayFileName);

    const names = workbook.SheetNames;
    setSheetNames(names);

    const preferredSheetName = names.includes("P&L_Monthly_Upload")
      ? "P&L_Monthly_Upload"
      : names[0];

    if (!preferredSheetName) {
      setSelectedSheet(null);
      setSheetRows([]);
      return;
    }

    setSelectedSheet(preferredSheetName);
    setSheetRows(getSheetRows(workbook, preferredSheetName));
  }

  function loadSheet(sheetName: string) {
    const workbook = workbookRef.current;
    if (!workbook) return;

    setSheetRows(getSheetRows(workbook, sheetName));
  }

  function handleSheetChange(sheetName: string) {
    setSelectedSheet(sheetName);
    loadSheet(sheetName);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      resetWorkbook();
      return;
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    loadWorkbook(workbook, file.name);
  }

  async function handleSampleDatasetClick() {
    try {
      setIsLoadingSample(true);

      const response = await fetch(
        "/sample-data/enterprise-finance-sample.xlsx"
      );

      if (!response.ok) {
        throw new Error("Failed to load sample dataset.");
      }

      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      loadWorkbook(workbook, "enterprise-finance-sample.xlsx");
    } catch (error) {
      console.error(error);
      alert("Failed to load the sample dataset. Please check the sample file.");
    } finally {
      setIsLoadingSample(false);
    }
  }

  const previewRows = sheetRows.slice(0, 10);
  const kpis = calculateKpis(sheetRows);
  const trendChartData = buildTrendChartData(sheetRows);
  const sheetType = detectSheetType(sheetRows);
  const financeRows = sheetRows as Record<string, unknown>[];

  return (
    <div className="flex min-h-full flex-1 flex-col items-center bg-[#f5f5f7] px-6 py-16 font-sans">
      <main className="flex w-full max-w-6xl flex-col items-center text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 sm:text-6xl">
          Enterprise Finance Copilot
        </h1>

        <p className="mt-4 text-xl font-normal text-zinc-500 sm:text-2xl">
          AI-powered Financial Analytics & Variance Intelligence
        </p>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-500 sm:text-base">
        这是一个结合 AI 与财务数据分析的作品项目，展示如何将 Excel 数据快速转化为 KPI 汇总、预算差异分析、风险提示和管理层摘要，帮助提升财务分析、信息整理和管理汇报的效率。
        </p>

        <div className="mt-16 flex flex-col items-center gap-3 sm:flex-row">
          <label className="group cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={handleFileChange}
            />

            <span className="inline-flex items-center gap-3 rounded-2xl bg-zinc-900 px-12 py-5 text-lg font-medium text-white shadow-lg shadow-zinc-900/10 transition-all duration-200 hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/15 active:scale-[0.98]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              上传Excel
            </span>
          </label>

          <button
            type="button"
            onClick={handleSampleDatasetClick}
            disabled={isLoadingSample}
            className="inline-flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-10 py-5 text-lg font-medium text-zinc-900 shadow-lg shadow-zinc-900/5 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-xl hover:shadow-zinc-900/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h3.75C8.496 12 9 12.504 9 13.125v6.75C9 20.496 8.496 21 7.875 21h-3.75A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-3.75a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125C16.5 3.504 17.004 3 17.625 3h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
            {isLoadingSample ? "加载中..." : "示例数据"}
          </button>
        </div>

        {fileName ? (
          <p className="mt-6 text-sm font-medium text-zinc-600">
            当前文件：{fileName}
          </p>
        ) : (
          <p className="mt-6 text-sm text-zinc-400">.xlsx, .xls, 或.csv</p>
        )}

        {sheetNames.length > 0 && selectedSheet && (
          <div className="mt-4 w-full max-w-xs">
            <label htmlFor="worksheet" className="sr-only">
              Worksheet
            </label>

            <div className="relative">
              <select
                id="worksheet"
                value={selectedSheet}
                onChange={(event) => handleSheetChange(event.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:border-zinc-300 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              >
                {sheetNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className="mt-3">
              <SheetTypeBadge type={sheetType} />
            </div>
          </div>
        )}

        {selectedSheet && sheetType === "pl" && (
          <>
            <AiFinanceNarrative rows={financeRows} sheetType={sheetType} />

            <KpiCards metrics={kpis} />

            <TrendCharts chartData={trendChartData} />

            <BudgetVsActual data={sheetRows} />

            <section className="mt-8 w-full text-left">
              <div className="mb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
               Segment Performance
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
               Business Unit & Region Analysis
              </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                深入分析各业务单元及运营区域的业绩表现，识别业务集中度、增长趋势及利润率变化。
                </p>
              </div>

              <BusinessUnitPerformance rows={sheetRows} />

              <RegionPerformance rows={sheetRows} />
            </section>
          </>
        )}

        {selectedSheet && sheetType === "gl" && (
          <>
            <GlActualsSummary rows={sheetRows} />

            <AiFinanceNarrative rows={financeRows} sheetType={sheetType} />

            <AiGlReviewAgent rows={sheetRows} />
          </>
        )}

        <PreviewTable rows={previewRows} />
      </main>
    </div>
  );
}