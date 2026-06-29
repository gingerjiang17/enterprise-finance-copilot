# Enterprise Finance Copilot

A modern enterprise finance dashboard built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **Recharts**, and **xlsx**.

This is an **AI-assisted learning and portfolio project** created to practice frontend development, financial data processing, and enterprise-style finance analysis workflows.

The project turns raw Excel financial data into dashboard-based financial analysis, including KPI cards, budget variance analysis, trend charts, business unit performance, region performance, and rule-based executive finance insights.

---

## 中文简介

**Enterprise Finance Copilot** 是一个 AI 辅助完成的企业财务分析 Dashboard 学习型 Portfolio 项目，使用 **Next.js、React、TypeScript、Tailwind CSS、Recharts 和 xlsx** 构建。

这个项目的目标不是声称完全独立手写所有代码，而是通过真实项目流程学习和练习：

* 财务分析需求拆解
* Excel 财务数据处理
* KPI / Budget vs Actual / Gross Margin / Revenue Share 分析逻辑
* React 组件化开发
* TypeScript 类型检查
* Dashboard UI 结构设计
* Git / GitHub 版本管理
* 使用 AI 作为 coding coach 辅助学习和开发

项目核心思路是将原始 Excel 财务数据转化为管理层可读的分析结果：

```text
Raw Excel Data
→ Financial Data Processing
→ KPI Calculation
→ Budget Variance Analysis
→ Business Unit / Region Breakdown
→ Executive Finance Insights
```

换句话说，它不是一个普通 Excel Viewer，而是一个模拟企业财务分析场景的 Finance Dashboard / Finance Copilot Portfolio 项目。

---

## Development Note

This project was developed through an AI-assisted workflow.

I used AI as a coding coach and technical guide during the development process. My focus was on:

* Defining the finance dashboard requirements
* Designing the analysis flow from company-level KPIs to business dimensions
* Providing and testing the Excel dataset
* Reviewing the output in the browser
* Identifying UI and logic issues
* Running local development and production builds
* Debugging TypeScript and runtime errors with guidance
* Managing Git commits and GitHub pushes
* Understanding the separation between UI components and business logic

The purpose of this project is not to claim full independent production-level development experience. Instead, it is a learning portfolio project that demonstrates how I practiced combining finance knowledge, frontend development, data processing, and AI-assisted software development workflow.

---

## Overview

**Enterprise Finance Copilot** is a portfolio project designed to simulate a real-world finance analytics workflow.

Instead of only displaying uploaded Excel data, the dashboard parses financial datasets, detects relevant columns, calculates financial metrics, aggregates performance by business dimensions, and generates rule-based executive insights.

The project helped me practice:

* Frontend development with Next.js and React
* Type-safe development with TypeScript
* Component-based UI architecture
* Financial data processing logic
* Enterprise-style dashboard design
* Git / GitHub version control workflow
* Separation of UI components and business logic

---

## Key Features

### Excel Upload

Users can upload `.xlsx`, `.xls`, or `.csv` files directly into the dashboard.

### Multi-Sheet Support

The dashboard supports Excel workbooks with multiple worksheets and allows users to switch between sheets.

### Preview Table

Displays a preview of the selected worksheet so users can verify the uploaded data.

### KPI Cards

Automatically calculates and displays key financial metrics:

* Revenue
* Gross Profit
* Gross Margin
* Net Profit

### Budget vs Actual Analysis

Compares actual revenue against budget revenue and calculates:

* Budget
* Actual
* Variance
* Variance %
* Favorable / Unfavorable / On Target status

The module also supports friendly empty states when required columns are missing.

### Trend Charts

Uses Recharts to visualize:

* Revenue Trend
* Gross Margin Trend

### Business Unit Performance

Breaks down performance by business unit:

* Revenue
* Gross Profit
* Gross Margin
* Revenue Share

This helps answer questions such as:

* Which business unit contributes the most revenue?
* Which business unit has the strongest gross margin?
* How much revenue share does each business unit represent?

### Region Performance

Breaks down performance by region:

* Revenue
* Gross Profit
* Gross Margin
* Revenue Share

This extends the dashboard from company-level analysis into geographic performance analysis.

### Executive Finance Insights

Generates rule-based executive insights from the uploaded dataset, such as:

* Revenue overview
* Budget variance commentary
* Gross margin performance
* Top business unit contribution
* Business unit margin comparison

This moves the project closer to a finance copilot experience instead of being only a static dashboard.

---

## Finance Analysis Logic

The dashboard is designed around common enterprise finance analysis workflows:

```text
Company Total
→ Budget vs Actual
→ Trend Analysis
→ Business Unit Performance
→ Region Performance
→ Raw Data Review
```

The current analysis modules support:

* Column detection
* Numeric parsing
* KPI calculation
* Budget variance analysis
* Revenue and gross profit aggregation
* Gross margin calculation
* Revenue share calculation
* Empty state handling for incomplete datasets
* Rule-based executive commentary

---

## Tech Stack

* **Next.js** - App Router based React framework
* **React** - Component-based UI development
* **TypeScript** - Type-safe frontend development
* **Tailwind CSS** - Utility-first styling
* **Recharts** - Data visualization
* **xlsx** - Excel parsing
* **Git / GitHub** - Version control and portfolio hosting

---

## Project Architecture

The project follows a simple but scalable separation between UI and business logic.

```text
app/
  page.tsx

components/
  KpiCards.tsx
  PreviewTable.tsx
  ChartCard.tsx
  TrendCharts.tsx
  TrendLineChart.tsx
  BudgetVsActual.tsx
  BusinessUnitPerformance.tsx
  RegionPerformance.tsx
  ExecutiveInsights.tsx

lib/
  excel.ts
  kpi.ts
  format.ts
  columns.ts
  charts.ts
  budget.ts
  businessUnit.ts
  dimensionPerformance.ts
  insights.ts
```

### Components Layer

The `components/` folder is responsible for UI rendering.

Examples:

* KPI cards
* Tables
* Chart sections
* Dashboard modules
* Empty states

### Lib Layer

The `lib/` folder is responsible for business logic and data transformation.

Examples:

* Excel parsing
* KPI calculation
* Column detection
* Budget analysis
* Business unit aggregation
* Region aggregation
* Executive insight generation

This separation keeps the UI cleaner and makes the financial logic easier to understand, maintain, and extend.

---

## Dataset

The project is tested with a sample enterprise finance dataset:

```text
Enterprise_Finance_Dashboard_Dataset.xlsx
```

Main worksheet used for dashboard analysis:

```text
P&L_Monthly_Upload
```

Example columns include:

* Period
* Business Unit
* Region
* Revenue
* Gross Profit
* Gross Margin
* Net Profit
* Budget Revenue

The dashboard also handles sheets that do not contain all required columns by showing friendly empty states instead of crashing.

---

## Version History

### v0.1 Initial Finance Dashboard

* Added Excel upload
* Added selected file display
* Added multi-sheet selector
* Added preview table
* Added KPI cards
* Added Excel parsing logic
* Initialized Git / GitHub repository

### v0.2 Revenue and Gross Margin Trend Charts

* Added Revenue Trend by period
* Added Gross Margin Trend by period
* Integrated Recharts
* Extracted chart logic into reusable components and lib functions

### v0.3 Budget vs Actual Analysis

* Added Budget vs Actual module
* Added actual revenue and budget revenue comparison
* Added variance and variance percentage calculation
* Integrated module into the dashboard

### v0.3.1 Read Budget Data from Excel

* Replaced hardcoded budget value
* Read budget revenue directly from Excel
* Added budget analysis logic in `lib/budget.ts`

### v0.3.2 Finalize Budget vs Actual Module

* Added support for multiple budget and actual column names
* Added professional empty state handling
* Added compact number formatting
* Added Favorable / Unfavorable / On Target status
* Added Budget vs Actual comparison bar
* Added column mapping display

### v0.4 Business Unit Performance

* Added business unit performance analysis
* Added revenue, gross profit, gross margin, and revenue share by business unit
* Added reusable business unit aggregation logic
* Added empty state handling for sheets without required business unit columns

### v0.5 Executive Finance Insights

* Added automated executive-level financial insights
* Added revenue overview, budget variance, gross margin, and business unit commentary
* Added Positive / Attention / Insight status labels
* Added empty state handling for sheets without required financial columns

### v0.6 Region Performance Analysis

* Added region-level performance analysis
* Added reusable dimension performance aggregation logic
* Added revenue, gross profit, gross margin, and revenue share by region
* Reordered dashboard sections for a better executive review flow

### v0.7 Portfolio README Documentation

* Added professional README documentation
* Added Chinese project summary for HR and non-technical reviewers
* Added AI-assisted development note
* Documented project overview, features, tech stack, architecture, and roadmap
* Prepared the project for GitHub portfolio presentation

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/gingerjiang17/enterprise-finance-copilot.git
```

### 2. Navigate to the project folder

```bash
cd enterprise-finance-copilot
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

### 5. Open the app

Open the local development URL shown in the terminal.

Usually:

```text
http://localhost:3000
```

---

## Available Scripts

### Run development server

```bash
npm run dev
```

### Create production build

```bash
npm run build
```

---

## Portfolio Highlights

This project is mainly a learning portfolio project, but it demonstrates practical understanding across finance analysis and frontend development.

From a finance and analytics perspective, the project covers:

* KPI design
* Budget variance logic
* Margin analysis
* Revenue contribution analysis
* Business unit performance review
* Regional performance review
* Executive summary generation

From a frontend engineering perspective, the project covers:

* Component decomposition
* Reusable data transformation functions
* Clean separation between UI and logic
* Empty state handling
* TypeScript type checking
* Production build validation
* Iterative version-based development

---

## What I Learned

Through this project, I practiced:

* How Excel data can be parsed and transformed into usable frontend data
* How to separate UI components from financial calculation logic
* How to calculate common finance metrics such as gross margin and revenue share
* How to design empty states for incomplete datasets
* How to use Git commits to manage incremental versions
* How to debug TypeScript errors during production build
* How to use AI assistance responsibly as a learning and development tool

---

## Future Roadmap

Potential future improvements:

* Add product-level performance analysis
* Add customer-level revenue concentration analysis
* Add exportable executive summary
* Add scenario analysis
* Add AI-powered commentary using an LLM API
* Add charts for business unit and region performance
* Add Vercel deployment
* Add screenshots and demo video
* Add unit tests for financial calculation logic

---

## Project Status

Current version:

```text
v0.7 Portfolio README Documentation
```

The dashboard currently supports Excel-based financial analysis from company-level KPIs down to business unit and region-level performance.
