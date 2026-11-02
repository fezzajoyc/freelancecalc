"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/site";
import { ToolPanel } from "@/components/ui";
import { Field, NumIn, TextIn, Check, Note, Stats, TableBox, ErrorNote, fmt, fmtMoney, pick, num } from "./freelance-ui";
import { invoiceTotals } from "../_lib/freelance";

/**
 * Invoice Line Calculator on top of freelance.invoiceTotals(): line items
 * (optional description, qty, unit price), a discount (percent and/or fixed)
 * applied BEFORE tax, and tax that is either added on top (exclusive) or
 * backed out of the totals (inclusive).
 * props: none.
 */

type Line = { desc: string; qty: string; price: string };

const S = {
  desc: { en: "Description (optional)", zh: "描述(可留空)", ja: "説明(任意)", es: "Descripción (opcional)", pt: "Descrição (opcional)" },
  qty: { en: "Qty", zh: "数量", ja: "数量", es: "Cant.", pt: "Qtd." },
  price: { en: "Unit price", zh: "单价", ja: "単価", es: "Precio unitario", pt: "Preço unitário" },
  amount: { en: "Amount", zh: "金额", ja: "金額", es: "Importe", pt: "Valor" },
  addLine: { en: "Add line", zh: "添加一行", ja: "行を追加", es: "Añadir línea", pt: "Adicionar linha" },
  remove: { en: "Remove", zh: "删除", ja: "削除", es: "Quitar", pt: "Remover" },
  removeLine: { en: "Remove line", zh: "删除该行", ja: "この行を削除", es: "Quitar línea", pt: "Remover linha" },
  taxPct: { en: "Tax %", zh: "税率 %", ja: "税率 %", es: "Impuesto %", pt: "Imposto %" },
  taxInclusive: { en: "Prices already include tax (inclusive)", zh: "价格已含税(含税价)", ja: "価格に税込み(内税)", es: "Los precios ya incluyen impuesto (inclusive)", pt: "Preços já com imposto (inclusivo)" },
  currency: { en: "Currency symbol", zh: "货币符号", ja: "通貨記号", es: "Símbolo de moneda", pt: "Símbolo da moeda" },
  discountPct: { en: "Discount %", zh: "折扣 %", ja: "割引 %", es: "Descuento %", pt: "Desconto %" },
  discountFixed: { en: "Fixed discount", zh: "固定减免额", ja: "固定割引額", es: "Descuento fijo", pt: "Desconto fixo" },
  subtotal: { en: "Subtotal", zh: "小计", ja: "小計", es: "Subtotal", pt: "Subtotal" },
  discount: { en: "Discount", zh: "折扣", ja: "割引", es: "Descuento", pt: "Desconto" },
  tax: { en: "Tax", zh: "税额", ja: "税額", es: "Impuesto", pt: "Imposto" },
  net: { en: "Net (before tax)", zh: "税前净额", ja: "税抜額", es: "Neto (sin impuesto)", pt: "Líquido (sem imposto)" },
  total: { en: "Total due", zh: "应付总额", ja: "合計支払額", es: "Total a pagar", pt: "Total a pagar" },
  error: {
    en: "Line quantities, prices, tax and discounts must be non-negative numbers. Empty or invalid lines are ignored only if both fields are cleared.",
    zh: "行数量、单价、税率和折扣都必须是非负数字。只有当一行的两个字段都清空时,该行才会被忽略。",
    ja: "行の数量・単価・税率・割引は 0 以上の数値で入力してください。両フィールドを空にした行のみ無視されます。",
    es: "Cantidades, precios, impuesto y descuentos deben ser números no negativos. Una línea solo se ignora si ambos campos están vacíos.",
    pt: "Quantidades, preços, imposto e descontos devem ser números não negativos. Uma linha só é ignorada se os dois campos estiverem vazios.",
  },
  formula: {
    en: "Subtotal = Σ qty × unit price. The discount (percent + fixed) applies BEFORE tax and is capped at the subtotal. Exclusive tax: total = base × (1 + rate). Inclusive tax: the total stays the discounted base and the tax is backed out of it — tax = total × rate/(100 + rate).",
    zh: "小计 = Σ 数量 × 单价。折扣(百分比 + 固定)在计税之前应用,且不会把总额减成负数。价外税:总额 = 基数 ×(1 + 税率);价内税:总额就是折后基数,税额从中反推——税 = 总额 × 税率/(100 + 税率)。",
    ja: "小計 = Σ 数量 × 単価。割引(率 + 定額)は税の前に適用され、小計を上限とします。外税:合計 = 基準額 ×(1 + 税率)。内税:合計は割引後の基準額のまま、税額はそこから逆算 — 税 = 合計 × 税率 ÷(100 + 税率)。",
    es: "Subtotal = Σ cantidad × precio unitario. El descuento (porcentaje + fijo) se aplica ANTES del impuesto y no puede superar el subtotal. Impuesto excluido: total = base × (1 + tasa). Impuesto incluido: el total es la base con descuento y el impuesto se extrae de él — impuesto = total × tasa/(100 + tasa).",
    pt: "Subtotal = Σ qtd × preço unitário. O desconto (percentual + fixo) é aplicado ANTES do imposto e limitado ao subtotal. Imposto por fora: total = base × (1 + taxa). Imposto inclusivo: o total é a base com desconto e o imposto é extraído dele — imposto = total × taxa/(100 + taxa).",
  },
  order: {
    en: "Order of operations: discount first, then tax — a 10% discount followed by 10% tax is not the same as the reverse.",
    zh: "运算顺序:先折扣,后计税——先打 9 折再收 10% 的税,与先收税再打折结果不同。",
    ja: "計算順序:割引が先、税が後 —— 10% 割引の後に 10% の税を課すのと逆順では結果が異なります。",
    es: "Orden de operaciones: primero el descuento, después el impuesto — un 10% de descuento seguido de un 10% de impuesto no es lo mismo que al revés.",
    pt: "Ordem das operações: primeiro o desconto, depois o imposto — 10% de desconto seguido de 10% de imposto não é o mesmo que o inverso.",
  },
};

const EMPTY: Line = { desc: "", qty: "", price: "" };

export function InvoiceEngine() {
  const { locale } = useI18n();
  const [lines, setLines] = useState<Line[]>([
    { desc: "", qty: "2", price: "50" },
    { desc: "", qty: "1", price: "120" },
  ]);
  const [taxPct, setTaxPct] = useState("10");
  const [inclusive, setInclusive] = useState(false);
  const [discountPct, setDiscountPct] = useState("0");
  const [discountFixed, setDiscountFixed] = useState("0");
  const [symbol, setSymbol] = useState("$");

  const parsed = useMemo(
    () =>
      lines.map((l) => {
        const blank = l.qty.trim() === "" && l.price.trim() === "";
        return {
          desc: l.desc,
          qty: blank ? 0 : num(l.qty),
          unitPrice: blank ? 0 : num(l.price),
        };
      }),
    [lines],
  );
  const res = useMemo(
    () => invoiceTotals(parsed, num(taxPct), inclusive, num(discountPct), num(discountFixed)),
    [parsed, taxPct, inclusive, discountPct, discountFixed],
  );
  const invalid = !Number.isFinite(res.total);

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <ToolPanel>
      <div className="space-y-3">
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_5rem_7rem_auto] items-end gap-2">
            <Field label={i === 0 ? pick(locale, S.desc) : ""}>
              <input
                type="text"
                className="field"
                value={l.desc}
                onChange={(e) => setLine(i, { desc: e.target.value })}
                aria-label={`line ${i + 1} description`}
              />
            </Field>
            <Field label={i === 0 ? pick(locale, S.qty) : ""}>
              <NumIn value={l.qty} onChange={(v) => setLine(i, { qty: v })} aria={`line ${i + 1} quantity`} />
            </Field>
            <Field label={i === 0 ? pick(locale, S.price) : ""}>
              <NumIn value={l.price} onChange={(v) => setLine(i, { price: v })} aria={`line ${i + 1} unit price`} />
            </Field>
            <button
              type="button"
              onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls))}
              disabled={lines.length === 1}
              className="mb-0.5 rounded-full border hairline px-2.5 py-1.5 text-[12px] text-[var(--color-sub)] transition-colors hover:bg-[var(--color-surface)] disabled:opacity-40"
              aria-label={pick(locale, S.removeLine)}
            >
              {pick(locale, S.remove)}
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setLines((ls) => [...ls, { ...EMPTY }])}
        className="mt-3 rounded-full border hairline px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-[var(--color-surface)]"
      >
        + {pick(locale, S.addLine)}
      </button>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label={pick(locale, S.taxPct)}>
          <NumIn value={taxPct} onChange={setTaxPct} aria="tax percent" />
        </Field>
        <Field label={pick(locale, S.currency)}>
          <TextIn value={symbol} onChange={(v) => setSymbol(v)} aria="currency symbol" />
        </Field>
        <Field label={pick(locale, S.discountPct)}>
          <NumIn value={discountPct} onChange={setDiscountPct} aria="discount percent" />
        </Field>
        <Field label={pick(locale, S.discountFixed)}>
          <NumIn value={discountFixed} onChange={setDiscountFixed} aria="fixed discount" />
        </Field>
      </div>
      <div className="mt-3">
        <Check checked={inclusive} onChange={setInclusive} label={pick(locale, S.taxInclusive)} />
      </div>

      <div className="mt-5">
        <Stats
          items={[
            { label: pick(locale, S.total), value: fmtMoney(res.total, locale, symbol), tone: "accent" },
            { label: pick(locale, S.subtotal), value: fmtMoney(res.subtotal, locale, symbol) },
            { label: pick(locale, S.discount), value: fmtMoney(res.discount, locale, symbol), tone: res.discount > 0 ? "good" : undefined },
            { label: pick(locale, S.tax), value: fmtMoney(res.tax, locale, symbol) },
            { label: pick(locale, S.net), value: fmtMoney(res.net, locale, symbol) },
          ]}
        />
      </div>
      {invalid && (
        <div className="mt-4">
          <ErrorNote>{pick(locale, S.error)}</ErrorNote>
        </div>
      )}

      {!invalid && parsed.some((l) => l.qty !== 0 || l.unitPrice !== 0) && (
        <div className="mt-7">
          <TableBox
            head={[pick(locale, S.desc), pick(locale, S.qty), pick(locale, S.price), pick(locale, S.amount)]}
            rows={parsed
              .filter((l) => l.qty !== 0 || l.unitPrice !== 0)
              .map((l, i) => [
                l.desc.trim() === "" ? `#${i + 1}` : l.desc,
                fmt(l.qty, locale, 2),
                fmtMoney(l.unitPrice, locale, symbol),
                fmtMoney(l.qty * l.unitPrice, locale, symbol),
              ])}
          />
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Note>{pick(locale, S.formula)}</Note>
        <Note>{pick(locale, S.order)}</Note>
      </div>
    </ToolPanel>
  );
}
