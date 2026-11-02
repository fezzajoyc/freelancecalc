"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/site";
import { ToolPanel } from "@/components/ui";
import { Field, NumIn, TextIn, Note, Stats, TableBox, ErrorNote, fmt, fmtMoney, pick, num } from "./freelance-ui";
import { requiredRate } from "../_lib/freelance";

/**
 * Hourly Rate Calculator on top of freelance.requiredRate(): a target annual
 * salary plus business expenses, divided by the billable hours you will
 * actually sell (46 weeks × 25 h by default — the freelance reality, not 40),
 * then grossed up by a profit margin. Shows the math and a capacity table.
 * props: none.
 */

const S = {
  salary: { en: "Target annual salary", zh: "目标年薪", ja: "目標年収", es: "Sueldo anual objetivo", pt: "Salário anual alvo" },
  expenses: { en: "Business expenses / year", zh: "年度业务开支", ja: "年間経費", es: "Gastos del negocio / año", pt: "Despesas do negócio / ano" },
  weeks: { en: "Billable weeks / year", zh: "每年可计费周数", ja: "年間請求可能週数", es: "Semanas facturables / año", pt: "Semanas faturáveis / ano" },
  hours: { en: "Billable hours / week", zh: "每周可计费小时", ja: "週あたり請求可能時間", es: "Horas facturables / semana", pt: "Horas faturáveis / semana" },
  margin: { en: "Profit margin %", zh: "利润率 %", ja: "利益マージン %", es: "Margen de beneficio %", pt: "Margem de lucro %" },
  currency: { en: "Currency symbol", zh: "货币符号", ja: "通貨記号", es: "Símbolo de moneda", pt: "Símbolo da moeda" },
  rate: { en: "Required hourly rate", zh: "所需小时费率", ja: "必要な時間単価", es: "Tarifa por hora necesaria", pt: "Valor-hora necessário" },
  breakEven: { en: "Break-even rate (no margin)", zh: "保本费率(不计利润)", ja: "損益分岐単価(マージンなし)", es: "Tarifa de equilibrio (sin margen)", pt: "Taxa de equilíbrio (sem margem)" },
  billableHours: { en: "Billable hours / year", zh: "每年可计费小时", ja: "年間請求可能時間", es: "Horas facturables / año", pt: "Horas faturáveis / ano" },
  totalCover: { en: "Total to cover / year", zh: "每年需覆盖总额", ja: "年間で賄うべき総額", es: "Total a cubrir / año", pt: "Total a cobrir / ano" },
  tableTitle: {
    en: "Required rate at different weekly capacities",
    zh: "不同每周工时下的所需费率",
    ja: "週の稼働時間別の必要単価",
    es: "Tarifa necesaria según la capacidad semanal",
    pt: "Valor-hora necessário por capacidade semanal",
  },
  thHours: { en: "Billable h/week", zh: "每周计费小时", ja: "週の請求時間", es: "h fact./semana", pt: "h fat./semana" },
  thYearHours: { en: "Hours/year", zh: "年小时数", ja: "年間時間", es: "Horas/año", pt: "Horas/ano" },
  thRate: { en: "Rate needed", zh: "所需费率", ja: "必要単価", es: "Tarifa necesaria", pt: "Taxa necessária" },
  error: {
    en: "Enter non-negative numbers. Billable weeks and hours per week must be above zero — with no billable time there is no rate.",
    zh: "请输入非负数字。计费周数和每周小时数必须大于零——没有可计费时间,就没有费率。",
    ja: "0 以上の数値を入力してください。請求可能週数と週あたり時間は 0 より大きい必要があります。請求可能な時間がなければ単価は算出できません。",
    es: "Introduce números no negativos. Las semanas y horas facturables deben ser mayores que cero: sin tiempo facturable no hay tarifa.",
    pt: "Informe números não negativos. Semanas e horas faturáveis devem ser maiores que zero — sem tempo faturável não há taxa.",
  },
  formula: {
    en: "Rate = (salary + expenses) ÷ (billable weeks × hours/week) × (1 + margin). Weeks and hours are the honest ones — vacations, sick days, sales and admin are unpaid, so only time you actually bill belongs here.",
    zh: "费率 =(年薪 + 开支)÷(计费周 × 每周小时)×(1 + 利润率)。周数和小时数要按真实值填——假期、病假、销售和行政时间都不赚钱,只有真正能计费的时间才算数。",
    ja: "単価 =(年収 + 経費)÷(請求可能週数 × 週の時間)×(1 + マージン)。週数と時間は正直な値を——休暇・病気・営業・事務作業は無給なので、実際に請求できる時間だけを数えます。",
    es: "Tarifa = (sueldo + gastos) ÷ (semanas facturables × horas/semana) × (1 + margen). Usa semanas y horas honestas: vacaciones, bajas, ventas y administración no se facturan; cuenta solo el tiempo que realmente cobras.",
    pt: "Taxa = (salário + despesas) ÷ (semanas faturáveis × horas/semana) × (1 + margem). Use semanas e horas honestas — férias, licenças, vendas e administração não são faturadas; conte só o tempo que você realmente cobra.",
  },
};

function mk(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

const MATH_LINE: Record<string, string> = {
  en: "The math: ({salary} + {expenses}) ÷ ({weeks} wk × {hours} h) = {total} ÷ {yearHours} h = {base}/h × {mult} margin → {rate}/h",
  zh: "算式:({salary} + {expenses}) ÷ ({weeks} 周 × {hours} 小时)= {total} ÷ {yearHours} 小时 = {base}/小时,再乘 {mult} 利润率 → {rate}/小时",
  ja: "計算式:({salary} + {expenses}) ÷ ({weeks} 週 × {hours} 時間)= {total} ÷ {yearHours} 時間 = {base}/時 × マージン {mult} → {rate}/時",
  es: "La cuenta: ({salary} + {expenses}) ÷ ({weeks} sem × {hours} h) = {total} ÷ {yearHours} h = {base}/h × margen {mult} → {rate}/h",
  pt: "A conta: ({salary} + {expenses}) ÷ ({weeks} sem × {hours} h) = {total} ÷ {yearHours} h = {base}/h × margem {mult} → {rate}/h",
};

const CAPACITY_ROWS = [15, 20, 25, 30, 35, 40];

export function RateEngine() {
  const { locale } = useI18n();
  const [salary, setSalary] = useState("60000");
  const [expenses, setExpenses] = useState("6000");
  const [weeks, setWeeks] = useState("46");
  const [hours, setHours] = useState("25");
  const [margin, setMargin] = useState("10");
  const [symbol, setSymbol] = useState("$");

  const res = useMemo(
    () => requiredRate(num(salary), num(expenses), num(weeks), num(hours), num(margin)),
    [salary, expenses, weeks, hours, margin],
  );
  const invalid = !Number.isFinite(res.requiredHourlyRate);

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={pick(locale, S.salary)}>
          <NumIn value={salary} onChange={setSalary} aria="target annual salary" />
        </Field>
        <Field label={pick(locale, S.expenses)}>
          <NumIn value={expenses} onChange={setExpenses} aria="business expenses per year" />
        </Field>
        <Field label={pick(locale, S.weeks)} hint="46 = 52 − 6 (off, sick, admin)">
          <NumIn value={weeks} onChange={setWeeks} aria="billable weeks per year" />
        </Field>
        <Field label={pick(locale, S.hours)} hint="25 ≈ the freelance reality, not 40">
          <NumIn value={hours} onChange={setHours} aria="billable hours per week" />
        </Field>
        <Field label={pick(locale, S.margin)}>
          <NumIn value={margin} onChange={setMargin} aria="profit margin percent" />
        </Field>
        <Field label={pick(locale, S.currency)}>
          <TextIn value={symbol} onChange={(v) => setSymbol(v)} aria="currency symbol" />
        </Field>
      </div>

      <div className="mt-5">
        <Stats
          items={[
            { label: pick(locale, S.rate), value: fmtMoney(res.requiredHourlyRate, locale, symbol), tone: "accent" },
            { label: pick(locale, S.breakEven), value: fmtMoney(res.baseRate, locale, symbol) },
            { label: pick(locale, S.billableHours), value: fmt(res.billableHours, locale, 0) },
            { label: pick(locale, S.totalCover), value: fmtMoney(res.totalCosts, locale, symbol, 0) },
          ]}
        />
      </div>

      {!invalid && (
        <p className="mono mt-4 text-[13px] leading-5 text-[var(--color-sub)]">
          {mk(pick(locale, MATH_LINE), {
            salary: fmtMoney(num(salary), locale, symbol, 0),
            expenses: fmtMoney(num(expenses), locale, symbol, 0),
            weeks: fmt(num(weeks), locale, 0),
            hours: fmt(num(hours), locale, 0),
            total: fmtMoney(res.totalCosts, locale, symbol, 0),
            yearHours: fmt(res.billableHours, locale, 0),
            base: fmtMoney(res.baseRate, locale, symbol),
            mult: fmt(res.marginMultiplier, locale, 2),
            rate: fmtMoney(res.requiredHourlyRate, locale, symbol),
          })}
        </p>
      )}
      {invalid && (
        <div className="mt-4">
          <ErrorNote>{pick(locale, S.error)}</ErrorNote>
        </div>
      )}

      <div className="mt-3">
        <Note>{pick(locale, S.formula)}</Note>
      </div>

      <div className="mt-7">
        <h3 className="mb-3 text-[15px] font-semibold">{pick(locale, S.tableTitle)}</h3>
        <TableBox
          head={[pick(locale, S.thHours), pick(locale, S.thYearHours), pick(locale, S.thRate)]}
          rows={CAPACITY_ROWS.map((h) => {
            const r = requiredRate(num(salary), num(expenses), num(weeks), h, num(margin));
            return [
              h === num(hours) ? `${h} ●` : h,
              fmt(r.billableHours, locale, 0),
              fmtMoney(r.requiredHourlyRate, locale, symbol),
            ];
          })}
        />
      </div>
    </ToolPanel>
  );
}
