# Enterprise Finance Copilot

## AI-Assisted Finance Automation Project

Enterprise Finance Copilot 是一个使用 **AI-assisted development（AI辅助开发）** 完成的财务分析自动化作品项目。

这个项目更侧重于展示我如何借助 AI 工具，将财务工作中常见的 Excel 分析流程转化为一个可运行、可展示、可交互的 Dashboard。

---

## Live Demo

Live Demo：

https://enterprise-finance-copilot.vercel.app/

GitHub Repository：

https://github.com/gingerjiang17/enterprise-finance-copilot

---

## 项目目的

在财务工作中，很多分析仍然依赖 Excel，例如：

* 月度经营数据整理
* Budget vs Actual 分析
* KPI 汇总
* Business Unit 分析
* Region 分析
* GL Actuals 检查
* 管理层汇报摘要

这个项目尝试用 AI-assisted coding 的方式，把这些重复性的 Excel-based 财务分析流程做成一个自动化 Dashboard。

我想通过这个作品展示：

* 我能理解财务分析场景
* 我能把财务需求拆解成清楚的功能模块
* 我能使用 AI 辅助完成代码实现
* 我能把 Excel 数据转化成可视化分析结果
* 我具备使用 AI 提升财务工作效率的意识和能力

---

## 使用方式

### 方式一：直接体验示例数据

打开 Live Demo 后，点击：

```text
Try Sample Dataset
```

即可直接加载内置示例数据，不需要准备 Excel 文件。

### 方式二：上传自己的 Excel 文件

支持上传：

* `.xlsx`
* `.xls`
* `.csv`

上传后可以选择不同 worksheet，并查看对应分析结果。

---

## 目前实现的自动化分析流程

### 1. Excel 数据读取

系统可以读取 Excel workbook，并显示不同 worksheet 的 preview table。

---

### 2. Sheet 自动识别

系统会根据栏位判断当前 worksheet 类型：

| Sheet 类型         | 显示内容                               |
| ---------------- | ---------------------------------- |
| P&L Sheet        | 完整财务分析 Dashboard                   |
| GL Actuals Sheet | GL Actuals Summary + Preview Table |
| Unknown Sheet    | Preview Table Only                 |

页面会显示 Sheet Type Badge：

* P&L Analysis
* GL Actuals
* Preview Only

这样可以避免把不适合的数据强行套入错误的分析模块。

---

### 3. KPI 自动汇总

针对 P&L 数据，系统会自动计算：

* Revenue
* Gross Profit
* Gross Margin
* Operating Expense
* Operating Income

---

### 4. Budget vs Actual 自动分析

系统会从 Excel 数据中读取 Actual 与 Budget，并计算：

* Variance
* Variance %
* Favorable / Unfavorable

这是财务分析、FP&A 和管理会计中常见的分析场景。

---

### 5. 趋势图分析

系统会把财务数据转成趋势图，包括：

* Revenue Trend
* Gross Margin Trend

用于观察不同期间的业绩变化。

---

### 6. Business Unit 分析

系统会按 Business Unit 汇总：

* Revenue
* Gross Profit
* Gross Margin
* Revenue Share

用于查看不同业务单元的贡献。

---

### 7. Region 分析

系统会按 Region 汇总：

* Revenue
* Gross Profit
* Gross Margin
* Revenue Share

用于查看不同区域的经营表现。

---

### 8. Rule-based Management Insights

系统会根据数据自动生成 rule-based management insights，用来模拟财务分析人员对管理层汇报时提炼重点。

目前 insights 主要覆盖：

* 收入表现
* 毛利率变化
* 预算差异
* 业务单元贡献
* 区域表现

---

### 9. GL Actuals Summary

针对 GL Actuals sheet，系统会显示专门的 GL Actuals Summary，而不是强行显示 P&L Dashboard。

这样更接近真实财务工作中对不同数据源进行分类处理的场景。

---

## AI / Vibe Coding 体现在哪里

这个项目是通过 AI-assisted coding 的方式逐步完成的。

我的工作方式包括：

* 把财务分析需求拆成一个个小模块
* 用 AI 协助规划功能和代码结构
* 根据报错信息逐步 debug
* 通过小版本迭代完成 dashboard
* 不断调整页面展示，使其更适合财务作品展示

项目从 v0.1 到 v1.1 是逐步迭代完成的，而不是一次性生成。

---

## Version History

### v0.1 Initial Finance Dashboard

* Excel Upload
* Sheet selector
* Preview Table
* KPI Cards

### v0.2 Trend Charts

* Revenue Trend
* Gross Margin Trend

### v0.3 Budget vs Actual

* Budget vs Actual analysis
* Variance / Variance % / Favorable / Unfavorable

### v0.4 Business Unit Performance

* 按 Business Unit 汇总 Revenue / Gross Profit / Gross Margin / Revenue Share

### v0.5 Executive Finance Insights

* 根据数据自动生成 rule-based management insights

### v0.6 Region Performance

* 按 Region 汇总 Revenue / Gross Profit / Gross Margin / Revenue Share

### v0.7 Portfolio README Documentation

* 初版 README 文档

### v0.8 Deployment & Live Demo

* 部署到 Vercel
* 完成线上 Demo

### v0.9 Sample Dataset Demo Mode

* 新增 sample dataset
* 新增 Try Sample Dataset 按钮
* 支持一键体验 demo

### v1.0 Sheet Type Rendering + GL Actuals Summary

* 新增 Sheet Type Detection
* 新增 GL Actuals Summary
* P&L / GL / Unknown sheet 分流显示

### v1.1 Portfolio Polish

* 首页标题改为 Enterprise Finance Copilot
* 项目定位改为 AI-Assisted Finance Analytics Project
* 新增 Sheet Type Badge
* 优化首页展示和 worksheet 类型说明

---

## Tools Used

这个项目使用了以下工具和技术作为实现手段：

| Area                    | Tool / Technology     |
| ----------------------- | --------------------- |
| AI-assisted development | ChatGPT / Vibe Coding |
| Framework               | Next.js               |
| UI                      | React                 |
| Language                | TypeScript            |
| Styling                 | Tailwind CSS          |
| Excel parsing           | SheetJS / xlsx        |
| Charts                  | Recharts              |
| Deployment              | Vercel                |

这些技术不是项目的核心目的，而是我用来实现财务自动化想法的工具。

---

## Project Structure

```text
app/
  page.tsx

components/
  BudgetVsActual.tsx
  BusinessUnitPerformance.tsx
  ExecutiveInsights.tsx
  GlActualsSummary.tsx
  KpiCards.tsx
  PreviewTable.tsx
  RegionPerformance.tsx
  SheetTypeBadge.tsx
  TrendCharts.tsx

lib/
  budget.ts
  charts.ts
  excel.ts
  glActuals.ts
  insights.ts
  kpi.ts
  sheetType.ts

public/
  sample-data/
    enterprise-finance-sample.xlsx
```

---

## Local Development

```bash
npm install
npm run dev
```

Build：

```bash
npm run build
```

---

## Limitations

这是一个作品项目，不是正式生产系统。

当前限制包括：

* 暂无后端数据库
* 暂无用户登录系统
* Sheet 识别依赖固定栏位
* Insights 是 rule-based，不是实时调用 AI API
* 上传数据仅在浏览器端使用

---

## Future Improvements

后续可以继续扩展：

* 更灵活的 column mapping
* Cash Flow 分析
* Balance Sheet 分析
* 更完整的 variance explanation
* PDF export
* Dashboard screenshot export
* AI-generated commentary
* 多公司 / 多期间比较
