import { defineTool } from "../_lib/types";
import { InvoiceEngine } from "../_engines/invoice-engine";

export default defineTool({
  slug: "invoice-line-calculator",
  category: "utility",
  icon: "file",
  engine: { component: InvoiceEngine, props: {} },
  copy: {
    en: {
      name: "Invoice Line Calculator",
      tagline:
        "Add up invoice line items with discounts and tax done in the right order — percent or fixed discount applied before tax, inclusive or exclusive.",
      intro: [
        "Invoice mistakes are quiet money leaks: a discount applied after tax, a tax computed twice on a discounted line, a fixed fee that turns the total negative. The order of operations on an invoice is not negotiable — discount first, then tax — yet most spreadsheets leave the order to whatever formula was typed first.",
        "This calculator locks the correct order: subtotal from your line items (qty × unit price), discount — percent, fixed, or both — subtracted before tax and capped at the subtotal, then tax either added on top (exclusive) or backed out of the total (inclusive, as when your rates already contain VAT). Every intermediate number is shown.",
      ],
      steps: [
        "Add your line items — description optional, quantity and unit price required.",
        "Enter the tax rate and choose whether prices already include it (inclusive) or tax is added on top (exclusive).",
        "Optionally add a percentage discount, a fixed amount, or both — they combine and apply before tax.",
        "Read the subtotal, discount, tax and total; use the per-line table to double-check the invoice you are about to send.",
      ],
      faqs: [
        {
          q: "Does the discount apply before or after tax?",
          a: "Before, always. The discount (percent + fixed, capped at the subtotal) reduces the taxable base, and tax is computed on what remains. A 10% discount followed by 10% tax gives 198 on a 200 subtotal — not 200, and not the same as taxing first.",
        },
        {
          q: "What does inclusive tax mean here?",
          a: "That your unit prices already contain the tax, so the total stays the discounted subtotal and the tax is backed out of it: tax = total × rate ÷ (100 + rate). On a 180 base with 10% inclusive tax, the tax is 16.36 and the net is 163.64 — the client still pays exactly 180.",
        },
        {
          q: "Can the discount push the total below zero?",
          a: "No — the combined discount is capped at the subtotal, so the total can reach zero but never go negative. If you need to issue a credit or refund, that belongs on a separate credit note, not as a discount larger than the invoice.",
        },
      ],
    },
    zh: {
      name: "发票行金额计算器",
      tagline: "按正确顺序累计发票行金额与折扣、税费——百分比或固定折扣先于计税,支持含税与价外税两种模式。",
      intro: [
        "发票算错是安静的金钱流失:折扣在税后才打、折后行又算了一遍税、固定减免把总额算成负数。发票的运算顺序没有商量余地——先折扣、后计税——但多数表格把顺序交给最早敲进去的那条公式。",
        "这个计算器锁死了正确顺序:先由行项目算小计(数量 × 单价),折扣——百分比、固定额或两者——在计税前减掉且不超过小计,然后计税:价外税加在顶部,价内税则从总额里反推(当你的报价本身已含税)。每个中间数字都展示出来。",
      ],
      steps: [
        "添加行项目——描述可留空,数量和单价必填。",
        "输入税率,并选择价格是已含税(价内)还是税要另加(价外)。",
        "可选:加百分比折扣、固定减免,或两者都加——它们合并后在计税前生效。",
        "读取小计、折扣、税额和总额;用逐行明细表核对即将发出的发票。",
      ],
      faqs: [
        {
          q: "折扣是在税前还是税后?",
          a: "永远在税前。折扣(百分比 + 固定,上限为小计)先减少计税基数,税再按剩余金额计算。小计 200 打 9 折再收 10% 的税是 198——不是 200,也和先收税再打折不同。",
        },
        {
          q: "价内税是什么意思?",
          a: "即你的单价本身已经含税,总额就是折后金额,税额从中反推:税 = 总额 × 税率 ÷(100 + 税率)。基数 180 按 10% 价内税,税额 16.36、净额 163.64——客户仍然只付 180。",
        },
        {
          q: "折扣会把总额算成负数吗?",
          a: "不会——合并折扣的上限是小计,总额可以到零但不会为负。如果需要开退款或贷记,应该单独开贷项通知单,而不是在发票上开一个超过发票金额的折扣。",
        },
      ],
    },
    ja: {
      name: "請求書明細計算機",
      tagline:
        "請求書の明細合計を正しい順序で:率・定額の割引は税の前に適用、内税・外税の両モードに対応します。",
      intro: [
        "請求書の計算ミスは静かにお金を漏らします:税後に掛けられた割引、割引済み明細に二重にかかった税、合計をマイナスにする定額値引き。請求書の計算順序は交渉の余地がありません——割引が先、税が後——なのに多くの表計算は、最初に打ち込まれた数式の順序に依存したままです。",
        "この計算機は正しい順序を固定します:明細(数量 × 単価)から小計、割引——率・定額・両方——は税の前に差し引き小計を上限とし、その後で税を計算。外税なら上乗せ、内税(単価に既に税が含まれる場合)なら合計から逆算します。中間値はすべて表示されます。",
      ],
      steps: [
        "明細を追加します——説明は任意、数量と単価は必須です。",
        "税率を入力し、価格に税が含まれる(内税)か税を上乗せする(外税)かを選びます。",
        "必要なら割引率・定額値引き・または両方を追加——合算され、税の前に適用されます。",
        "小計・割引・税額・合計を確認し、明細表で送りかけの請求書をダブルチェックします。",
      ],
      faqs: [
        {
          q: "割引は税の前と後、どちらに効きますか?",
          a: "常に前です。割引(率 + 定額、小計が上限)が課税基数を減らし、税は残りに対して計算されます。小計 200 に 10% 割引の後に 10% の税で 198 —— 200 にはならず、税が先の場合とも異なります。",
        },
        {
          q: "内税とはここではどういう意味ですか?",
          a: "単価に既に税が含まれているということです。合計は割引後の金額のまま、税額はそこから逆算します:税 = 合計 × 税率 ÷(100 + 税率)。基数 180・内税 10% なら税 16.36、税抜 163.64 —— クライアントが払うのは変わらず 180 です。",
        },
        {
          q: "割引で合計がマイナスになりますか?",
          a: "なりません——合算した割引は小計が上限で、合計はゼロにはなれてもマイナスにはできません。返金やクレジットは、請求書より大きい割引ではなく、別のクレジットノートで発行するものです。",
        },
      ],
    },
    es: {
      name: "Calculadora de líneas de factura",
      tagline:
        "Suma las líneas de la factura con descuentos e impuestos en el orden correcto — descuento porcentual o fijo antes del impuesto, inclusive o excluido.",
      intro: [
        "Los errores de factura son fugas silenciosas de dinero: un descuento aplicado tras el impuesto, un impuesto calculado dos veces sobre una línea ya descontada, un importe fijo que vuelve el total negativo. El orden de operaciones de una factura no se negocia — primero el descuento, después el impuesto — pero muchas hojas de cálculo dejan el orden a la primera fórmula que se tecleó.",
        "Esta calculadora fija el orden correcto: subtotal desde tus líneas (cantidad × precio unitario), descuento — porcentual, fijo o ambos — restado antes del impuesto y limitado al subtotal, y luego el impuesto añadido arriba (excluido) o extraído del total (inclusive, cuando tus precios ya llevan IVA). Cada número intermedio se muestra.",
      ],
      steps: [
        "Añade tus líneas — la descripción es opcional; cantidad y precio unitario, obligatorios.",
        "Introduce el tipo de impuesto y elige si los precios ya lo incluyen (inclusive) o se añade encima (excluido).",
        "Opcionalmente añade un descuento porcentual, un importe fijo o ambos — se combinan y se aplican antes del impuesto.",
        "Lee subtotal, descuento, impuesto y total; usa la tabla por línea para revisar la factura antes de enviarla.",
      ],
      faqs: [
        {
          q: "¿El descuento se aplica antes o después del impuesto?",
          a: "Antes, siempre. El descuento (porcentual + fijo, limitado al subtotal) reduce la base imponible, y el impuesto se calcula sobre lo que queda. Un 10% de descuento seguido de un 10% de impuesto da 198 sobre un subtotal de 200 — no 200, ni lo mismo que tributar primero.",
        },
        {
          q: "¿Qué significa impuesto inclusive aquí?",
          a: "Que tus precios unitarios ya contienen el impuesto: el total sigue siendo el subtotal con descuento y el impuesto se extrae de él — impuesto = total × tasa ÷ (100 + tasa). Sobre una base de 180 con 10% inclusive, el impuesto es 16,36 y lo neto 163,64 — el cliente paga exactamente 180.",
        },
        {
          q: "¿Puede el descuento dejar el total en negativo?",
          a: "No — el descuento combinado está limitado al subtotal, así que el total puede llegar a cero pero nunca ser negativo. Si necesitas emitir una devolución o abono, va en un documento de abono aparte, no como un descuento mayor que la factura.",
        },
      ],
    },
    pt: {
      name: "Calculadora de linhas de fatura",
      tagline:
        "Soma as linhas da fatura com descontos e impostos na ordem certa — desconto percentual ou fixo antes do imposto, inclusivo ou por fora.",
      intro: [
        "Erros de fatura são vazamentos silenciosos de dinheiro: um desconto aplicado depois do imposto, um imposto calculado duas vezes numa linha já descontada, um valor fixo que torna o total negativo. A ordem das operações numa fatura não é negociável — primeiro o desconto, depois o imposto — mas muitas planilhas deixam a ordem para a primeira fórmula digitada.",
        "Esta calculadora trava a ordem correta: subtotal a partir das suas linhas (qtd × preço unitário), desconto — percentual, fixo ou ambos — subtraído antes do imposto e limitado ao subtotal, e então o imposto acrescido (por fora) ou extraído do total (inclusivo, quando seus preços já contêm o tributo). Cada número intermediário é mostrado.",
      ],
      steps: [
        "Adicione suas linhas — a descrição é opcional; quantidade e preço unitário são obrigatórios.",
        "Informe a alíquota e escolha se os preços já a incluem (inclusivo) ou se o imposto é acrescido (por fora).",
        "Opcionalmente acrescente desconto percentual, valor fixo ou ambos — eles se combinam e valem antes do imposto.",
        "Leia subtotal, desconto, imposto e total; use a tabela por linha para conferir a fatura antes de enviar.",
      ],
      faqs: [
        {
          q: "O desconto vale antes ou depois do imposto?",
          a: "Antes, sempre. O desconto (percentual + fixo, limitado ao subtotal) reduz a base tributável, e o imposto é calculado sobre o que resta. Um desconto de 10% seguido de 10% de imposto dá 198 sobre um subtotal de 200 — não 200, nem o mesmo que tributar primeiro.",
        },
        {
          q: "O que significa imposto inclusivo aqui?",
          a: "Que seus preços unitários já contêm o imposto: o total continua sendo o subtotal com desconto e o imposto é extraído dele — imposto = total × taxa ÷ (100 + taxa). Sobre uma base de 180 com 10% inclusivo, o imposto é 16,36 e o líquido 163,64 — o cliente paga exatamente 180.",
        },
        {
          q: "O desconto pode deixar o total negativo?",
          a: "Não — o desconto combinado é limitado ao subtotal, então o total pode chegar a zero mas nunca fica negativo. Se você precisa emitir reembolso ou crédito, isso vai numa carta de crédito separada, não num desconto maior que a fatura.",
        },
      ],
    },
  },
  related: ["project-quote", "rate-health-check", "hourly-rate-calculator"],
});
