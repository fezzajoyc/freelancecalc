"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/site";
import { ToolPanel } from "@/components/ui";
import { Field, NumIn, TextIn, Note, Stats, ErrorNote, fmt, fmtMoney, pick, num } from "./freelance-ui";
import { rateHealth } from "../_lib/freelance";

/**
 * Rate Health Check engine on top of freelance.rateHealth(): last month's
 * billable hours at your current rate versus a monthly income target —
 * utilization, shortfall/surplus, and the rate that would hit the target at
 * the same billable volume.
 * props: none.
 */

const S = {
  rate: { en: "Current hourly rate", zh: "当前小时费率", ja: "現在の時間単価", es: "Tarifa por hora actual", pt: "Valor por hora atual" },
  billable: { en: "Billable hours last month", zh: "上月计费小时", ja: "先月の請求可能時間", es: "Horas facturadas el mes pasado", pt: "Horas faturáveis no mês passado" },
  worked: { en: "Total hours worked last month", zh: "上月总工作小时", ja: "先月の総稼働時間", es: "Horas totales trabajadas el mes pasado", pt: "Horas trabalhadas no mês passado" },
  target: { en: "Target monthly income", zh: "月收入目标", ja: "月間収入目標", es: "Ingreso mensual objetivo", pt: "Meta de renda mensal" },
  currency: { en: "Currency symbol", zh: "货币符号", ja: "通貨記号", es: "Símbolo de moneda", pt: "Símbolo da moeda" },
  income: { en: "Income last month", zh: "上月收入", ja: "先月の収入", es: "Ingresos del mes pasado", pt: "Renda do mês passado" },
  utilization: { en: "Utilization (billable ÷ worked)", zh: "利用率(计费 ÷ 总工时)", ja: "稼働率(請求 ÷ 総稼働)", es: "Utilización (facturadas ÷ trabajadas)", pt: "Utilização (faturáveis ÷ trabalhadas)" },
  gapShortfall: { en: "Shortfall vs target", zh: "距目标的缺口", ja: "目標との不足額", es: "Faltante vs objetivo", pt: "Falta para a meta" },
  gapSurplus: { en: "Surplus vs target", zh: "超目标的盈余", ja: "目標を超えた余裕", es: "Excedente vs objetivo", pt: "Excedente para a meta" },
  neededRate: { en: "Rate to hit the target", zh: "达标所需费率", ja: "目標達成に必要な単価", es: "Tarifa para alcanzar el objetivo", pt: "Taxa para bater a meta" },
  zeroBillable: {
    en: "With 0 billable hours no rate can reach the target — income is zero no matter the price. Check whether the unbilled hours (sales, admin, revisions) can be converted into billable work.",
    zh: "计费小时为 0 时,任何费率都到不了目标——不管定价多高,收入都是零。想想那些没计费的时间(销售、行政、改稿)能不能转化为计费工作。",
    ja: "請求可能時間が 0 では、どの単価でも目標には届きません。価格をいくら上げても収入はゼロです。請求できていない時間(営業・事務・修正)を請求可能な作業に変えられるか検討してください。",
    es: "Con 0 horas facturadas ninguna tarifa alcanza el objetivo — los ingresos son cero al precio que sea. Considera si las horas no facturadas (ventas, administración, revisiones) pueden convertirse en trabajo facturable.",
    pt: "Com 0 horas faturáveis nenhuma taxa alcança a meta — a renda é zero a qualquer preço. Considere se as horas não faturadas (vendas, administração, revisões) podem virar trabalho faturável.",
  },
  error: {
    en: "Enter non-negative numbers. Total hours worked must be above zero (it is the denominator of utilization), and the rate cannot be negative.",
    zh: "请输入非负数字。总工作小时必须大于零(它是利用率的分母),费率不能为负。",
    ja: "0 以上の数値を入力してください。総稼働時間は利用率の分母なので 0 より大きく、単価は負にできません。",
    es: "Introduce números no negativos. Las horas trabajadas deben ser mayores que cero (son el denominador de la utilización) y la tarifa no puede ser negativa.",
    pt: "Informe números não negativos. As horas trabalhadas devem ser maiores que zero (são o denominador da utilização) e a taxa não pode ser negativa.",
  },
  formula: {
    en: "Income = rate × billable hours. Utilization = billable ÷ total worked — 100% is unrealistic; freelancers typically land between 50% and 70%. Needed rate = target ÷ billable hours: what each billed hour must earn at this month's volume. Above 100% utilization means you billed more hours than you recorded working — worth checking your tracking.",
    zh: "收入 = 费率 × 计费小时。利用率 = 计费小时 ÷ 总工作小时——100% 不现实;自由职业者通常落在 50%–70%。所需费率 = 目标 ÷ 计费小时:按本月的量,每个计费小时必须赚多少。利用率超过 100% 说明计费小时比记录的工作时间还多——值得检查一下计时方式。",
    ja: "収入 = 単価 × 請求可能時間。稼働率 = 請求可能時間 ÷ 総稼働時間 —— 100% は非現実的で、フリーランスは通常 50〜70% に収まります。必要単価 = 目標 ÷ 請求可能時間:今月の量で 1 時間あたりに必要な額。100% 超は記録した稼働より多く請求しているサインなので、計測方法を確認してみてください。",
    es: "Ingresos = tarifa × horas facturadas. Utilización = facturadas ÷ trabajadas — 100% no es realista; los freelancers suelen quedar entre el 50% y el 70%. Tarifa necesaria = objetivo ÷ horas facturadas: lo que debe rendir cada hora facturada con el volumen de este mes. Más del 100% significa que facturaste más horas de las que anotaste: revisa tu registro.",
    pt: "Renda = taxa × horas faturáveis. Utilização = faturáveis ÷ trabalhadas — 100% não é realista; freelancers costumam ficar entre 50% e 70%. Taxa necessária = meta ÷ horas faturáveis: o que cada hora faturada precisa render com o volume deste mês. Acima de 100% você faturou mais horas do que registrou — vale revisar seu controle.",
  },
};

export function HealthEngine() {
  const { locale } = useI18n();
  const [rate, setRate] = useState("50");
  const [billable, setBillable] = useState("100");
  const [worked, setWorked] = useState("160");
  const [target, setTarget] = useState("6000");
  const [symbol, setSymbol] = useState("$");

  const res = useMemo(() => rateHealth(num(rate), num(billable), num(worked), num(target)), [rate, billable, worked, target]);
  const invalid = !Number.isFinite(res.income);
  const zeroBillable = Number.isFinite(res.income) && num(billable) === 0;

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={pick(locale, S.rate)}>
          <NumIn value={rate} onChange={setRate} aria="current hourly rate" />
        </Field>
        <Field label={pick(locale, S.billable)}>
          <NumIn value={billable} onChange={setBillable} aria="billable hours last month" />
        </Field>
        <Field label={pick(locale, S.worked)}>
          <NumIn value={worked} onChange={setWorked} aria="total hours worked last month" />
        </Field>
        <Field label={pick(locale, S.target)}>
          <NumIn value={target} onChange={setTarget} aria="target monthly income" />
        </Field>
        <Field label={pick(locale, S.currency)}>
          <TextIn value={symbol} onChange={(v) => setSymbol(v)} aria="currency symbol" />
        </Field>
      </div>

      <div className="mt-5">
        <Stats
          items={[
            { label: pick(locale, S.income), value: fmtMoney(res.income, locale, symbol), tone: "accent" },
            { label: pick(locale, S.utilization), value: `${fmt(res.utilizationPct, locale, 1)}%` },
            {
              label: res.gap > 0 ? pick(locale, S.gapSurplus) : pick(locale, S.gapShortfall),
              value: fmtMoney(res.gap, locale, symbol),
              tone: res.gap > 0 ? "good" : res.gap < 0 ? "bad" : undefined,
            },
            {
              label: pick(locale, S.neededRate),
              value: Number.isFinite(res.neededRate) ? fmtMoney(res.neededRate, locale, symbol) : "—",
              tone: Number.isFinite(res.neededRate) ? undefined : "good",
            },
          ]}
        />
      </div>
      {invalid && (
        <div className="mt-4">
          <ErrorNote>{pick(locale, S.error)}</ErrorNote>
        </div>
      )}
      {zeroBillable && (
        <div className="mt-4">
          <ErrorNote>{pick(locale, S.zeroBillable)}</ErrorNote>
        </div>
      )}

      <div className="mt-4">
        <Note>{pick(locale, S.formula)}</Note>
      </div>
    </ToolPanel>
  );
}
