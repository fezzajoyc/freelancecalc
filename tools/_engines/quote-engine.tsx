"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/site";
import { ToolPanel } from "@/components/ui";
import { Field, NumIn, TextIn, Sel, Note, Stats, TableBox, ErrorNote, fmt, fmtMoney, pick, num } from "./freelance-ui";
import { projectQuote } from "../_lib/freelance";

/**
 * Project Quote engine on top of freelance.projectQuote(): hours × rate with
 * a rush multiplier applied to the hours, revision rounds priced at +10% of
 * the base each, expenses added last, and the total split into milestone
 * payments (50/25/25 by default, percentages editable).
 * props: none.
 */

const RUSH_OPTIONS = [
  { value: "1", key: "rushNone" },
  { value: "1.25", key: "rush125" },
  { value: "1.5", key: "rush150" },
  { value: "2", key: "rush200" },
] as const;

const S = {
  hours: { en: "Estimated hours", zh: "预估工时", ja: "見積工数", es: "Horas estimadas", pt: "Horas estimadas" },
  rate: { en: "Hourly rate", zh: "小时费率", ja: "時間単価", es: "Tarifa por hora", pt: "Valor por hora" },
  rush: { en: "Rush multiplier", zh: "加急系数", ja: "特急倍率", es: "Multiplicador por urgencia", pt: "Multiplicador de urgência" },
  rushNone: { en: "No rush (×1)", zh: "不加急(×1)", ja: "通常(×1)", es: "Sin urgencia (×1)", pt: "Sem urgência (×1)" },
  rush125: { en: "Rush +25% (×1.25)", zh: "加急 +25%(×1.25)", ja: "特急 +25%(×1.25)", es: "Urgencia +25% (×1.25)", pt: "Urgência +25% (×1.25)" },
  rush150: { en: "Rush +50% (×1.5)", zh: "加急 +50%(×1.5)", ja: "特急 +50%(×1.5)", es: "Urgencia +50% (×1.5)", pt: "Urgência +50% (×1.5)" },
  rush200: { en: "Rush ×2", zh: "双倍加急(×2)", ja: "特急 ×2", es: "Urgencia ×2", pt: "Urgência ×2" },
  revisions: { en: "Revision rounds", zh: "修改轮数", ja: "修正回数", es: "Rondas de revisión", pt: "Rodadas de revisão" },
  expenses: { en: "Project expenses", zh: "项目开支", ja: "プロジェクト経費", es: "Gastos del proyecto", pt: "Despesas do projeto" },
  currency: { en: "Currency symbol", zh: "货币符号", ja: "通貨記号", es: "Símbolo de moneda", pt: "Símbolo da moeda" },
  splitTitle: { en: "Milestone split (%)", zh: "里程碑付款比例(%)", ja: "マイルストーン配分 (%)", es: "Reparto por hitos (%)", pt: "Divisão por marcos (%)" },
  payment: { en: "Payment", zh: "付款", ja: "入金", es: "Pago", pt: "Pagamento" },
  total: { en: "Quote total", zh: "报价总额", ja: "見積総額", es: "Total del presupuesto", pt: "Total do orçamento" },
  labor: { en: "Labor (with rush)", zh: "工时费(含加急)", ja: "工賃(特急込み)", es: "Mano de obra (con urgencia)", pt: "Mão de obra (com urgência)" },
  revisionFee: { en: "Revision fees", zh: "修改费用", ja: "修正費用", es: "Coste de revisiones", pt: "Custo de revisões" },
  expensesOut: { en: "Expenses", zh: "开支", ja: "経費", es: "Gastos", pt: "Despesas" },
  baseOut: { en: "Base (before rush)", zh: "基础价(未加急)", ja: "基本額(特急前)", es: "Base (sin urgencia)", pt: "Base (sem urgência)" },
  thPct: { en: "Share", zh: "比例", ja: "割合", es: "Porcentaje", pt: "Porcentagem" },
  thAmount: { en: "Amount", zh: "金额", ja: "金額", es: "Importe", pt: "Valor" },
  unassigned: { en: "Unassigned by the split", zh: "比例未覆盖的余额", ja: "配分で未割り当て", es: "Sin asignar por el reparto", pt: "Não atribuído pela divisão" },
  splitWarning: {
    en: "The milestone percentages do not add up to 100% — the remainder is listed below the split.",
    zh: "里程碑比例之和不是 100%——差额列在拆分表下方。",
    ja: "マイルストーンの割合の合計が 100% ではありません。残額は配分表の下に表示します。",
    es: "Los porcentajes de los hitos no suman 100% — el resto se lista bajo el reparto.",
    pt: "As porcentagens dos marcos não somam 100% — o restante aparece abaixo da divisão.",
  },
  error: {
    en: "Enter non-negative numbers. Hours and rate can be zero for a freebie, but the rush multiplier must be above zero and cannot be negative anywhere.",
    zh: "请输入非负数字。工时和费率可以为零(做免费项目),但加急系数必须大于零,任何输入都不能为负。",
    ja: "0 以上の数値を入力してください。工数と単価は 0(無料案件)でも構いませんが、特急倍率は 0 より大きく、どの入力も負にはできません。",
    es: "Introduce números no negativos. Horas y tarifa pueden ser cero en un favor, pero el multiplicador de urgencia debe ser mayor que cero y nada puede ser negativo.",
    pt: "Informe números não negativos. Horas e valor podem ser zero num favor, mas o multiplicador de urgência deve ser maior que zero e nada pode ser negativo.",
  },
  formula: {
    en: "Total = hours × rush × rate + revisions + expenses. Each revision round adds 10% of the base (hours × rate); the rush multiplier applies to the hours before the rate. Milestones split the total — 50% to start, 25% midway, 25% on delivery.",
    zh: "总额 = 工时 × 加急 × 费率 + 修改费 + 开支。每轮修改按基础价(工时 × 费率)的 10% 计费;加急系数作用在工时上,再乘费率。里程碑对总额做拆分——50% 启动、25% 中期、25% 交付。",
    ja: "合計 = 工数 × 特急倍率 × 単価 + 修正費 + 経費。修正 1 回につき基本額(工数 × 単価)の 10% を加算。特急倍率は単価の前に工数へ掛かります。マイルストーンは合計を 50%(着手)/ 25%(中間)/ 25%(納品)に分割。",
    es: "Total = horas × urgencia × tarifa + revisiones + gastos. Cada ronda de revisión añade 10% de la base (horas × tarifa); la urgencia se aplica a las horas antes de la tarifa. Los hitos reparten el total: 50% al empezar, 25% a mitad, 25% al entregar.",
    pt: "Total = horas × urgência × valor + revisões + despesas. Cada rodada de revisão acrescenta 10% da base (horas × valor); a urgência se aplica às horas antes do valor. Os marcos dividem o total: 50% no início, 25% no meio, 25% na entrega.",
  },
};

export function QuoteEngine() {
  const { locale } = useI18n();
  const [hours, setHours] = useState("20");
  const [rate, setRate] = useState("50");
  const [rush, setRush] = useState("1.5");
  const [revisions, setRevisions] = useState("2");
  const [expenses, setExpenses] = useState("100");
  const [symbol, setSymbol] = useState("$");
  const [m1, setM1] = useState("50");
  const [m2, setM2] = useState("25");
  const [m3, setM3] = useState("25");

  const res = useMemo(
    () => projectQuote(num(hours), num(rate), num(rush), num(revisions), num(expenses), [num(m1), num(m2), num(m3)]),
    [hours, rate, rush, revisions, expenses, m1, m2, m3],
  );
  const invalid = !Number.isFinite(res.total);
  const splitWarn = Number.isFinite(res.milestonePctSum) && Math.abs(res.milestonePctSum - 100) > 1e-9;
  const rushLabel = (key: (typeof RUSH_OPTIONS)[number]["key"]) => pick(locale, S[key]);

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={pick(locale, S.hours)}>
          <NumIn value={hours} onChange={setHours} aria="estimated hours" />
        </Field>
        <Field label={pick(locale, S.rate)}>
          <NumIn value={rate} onChange={setRate} aria="hourly rate" />
        </Field>
        <Field label={pick(locale, S.rush)}>
          <Sel value={rush} onChange={setRush} aria="rush multiplier">
            {RUSH_OPTIONS.map((o) => (
              <option key={o.key} value={o.value}>
                {rushLabel(o.key)}
              </option>
            ))}
          </Sel>
        </Field>
        <Field label={pick(locale, S.revisions)}>
          <NumIn value={revisions} onChange={setRevisions} aria="revision rounds" />
        </Field>
        <Field label={pick(locale, S.expenses)}>
          <NumIn value={expenses} onChange={setExpenses} aria="project expenses" />
        </Field>
        <Field label={pick(locale, S.currency)}>
          <TextIn value={symbol} onChange={(v) => setSymbol(v)} aria="currency symbol" />
        </Field>
      </div>

      <div className="mt-5">
        <Stats
          items={[
            { label: pick(locale, S.total), value: fmtMoney(res.total, locale, symbol), tone: "accent" },
            { label: pick(locale, S.labor), value: fmtMoney(res.laborTotal, locale, symbol) },
            { label: pick(locale, S.revisionFee), value: fmtMoney(res.revisionFee, locale, symbol) },
            { label: pick(locale, S.expensesOut), value: fmtMoney(res.expenses, locale, symbol) },
            { label: pick(locale, S.baseOut), value: fmtMoney(res.base, locale, symbol), tone: undefined },
            { label: pick(locale, S.unassigned), value: fmtMoney(res.unassigned, locale, symbol), tone: splitWarn ? "bad" : undefined },
          ]}
        />
      </div>
      {invalid && (
        <div className="mt-4">
          <ErrorNote>{pick(locale, S.error)}</ErrorNote>
        </div>
      )}
      {!invalid && splitWarn && (
        <div className="mt-4">
          <ErrorNote>{pick(locale, S.splitWarning)}</ErrorNote>
        </div>
      )}

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {[m1, m2, m3].map((v, i) => (
          <Field key={i} label={`${pick(locale, S.payment)} ${i + 1}`}>
            <NumIn value={v} onChange={(nv) => (i === 0 ? setM1 : i === 1 ? setM2 : setM3)(nv)} aria={`milestone ${i + 1} percent`} />
          </Field>
        ))}
      </div>
      <p className="mt-2 text-[13px] font-medium text-[var(--color-sub)]">{pick(locale, S.splitTitle)}</p>

      {!invalid && res.milestones.length > 0 && (
        <div className="mt-3">
          <TableBox
            head={[pick(locale, S.payment), pick(locale, S.thPct), pick(locale, S.thAmount)]}
            rows={res.milestones.map((m, i) => [`${pick(locale, S.payment)} ${i + 1}`, `${fmt(m.pct, locale, 2)}%`, fmtMoney(m.amount, locale, symbol)])}
          />
        </div>
      )}

      <div className="mt-4">
        <Note>{pick(locale, S.formula)}</Note>
      </div>
    </ToolPanel>
  );
}
