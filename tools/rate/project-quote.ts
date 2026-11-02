import { defineTool } from "../_lib/types";
import { QuoteEngine } from "../_engines/quote-engine";

export default defineTool({
  slug: "project-quote",
  category: "utility",
  icon: "clock",
  engine: { component: QuoteEngine, props: {} },
  copy: {
    en: {
      name: "Project Quote Calculator",
      tagline:
        "Price a freelance project in seconds: estimated hours, rush multiplier, revision rounds and expenses — with a 50/25/25 milestone split ready to send.",
      intro: [
        "A quote is where freelance money is won or lost. Rush jobs deserve a premium, revision rounds are real work that clients request casually, and expenses — stock licenses, plugins, travel — come out of your pocket until you bill them back. Writing these into the quote by hand is how they get forgotten.",
        "This calculator builds the quote from hours and your hourly rate: the rush multiplier applies to the hours, each revision round adds 10% of the base, expenses are added last, and the total is split into milestone payments — 50% to start, 25% midway, 25% on delivery by default, all percentages editable.",
      ],
      steps: [
        "Enter your estimated hours and the hourly rate from the Hourly Rate Calculator.",
        "Pick a rush multiplier — ×1 for normal timelines, ×1.25/×1.5 or ×2 when the client needs it faster than healthy.",
        "Count the revision rounds the contract allows and add any expenses you will advance.",
        "Adjust the milestone percentages if the project needs a different rhythm and copy the split into the proposal.",
      ],
      faqs: [
        {
          q: "How is the rush multiplier applied?",
          a: "To the hours, before the rate: 20 hours at a ×1.5 rush means you price 30 hours at your normal rate. This matches how rush work actually costs you — evenings, weekends and compressed timelines multiply the time you must find, not the value of each hour.",
        },
        {
          q: "How do revisions affect the total?",
          a: "Each revision round adds 10% of the base quote (hours × rate, before rush). Two rounds on a 1,000 base add 200. The percentage prices the common case; anything beyond the contracted rounds should be quoted separately, which is exactly why the number of rounds belongs in the contract.",
        },
        {
          q: "Why 50/25/25 milestones?",
          a: "Half up front filters out non-serious clients and funds the work; a midway payment covers the long middle; the final 25% keeps delivery and final approval honest on both sides. All three percentages are editable — bigger projects often run 40/30/30 or monthly retainers instead.",
        },
      ],
    },
    zh: {
      name: "项目报价计算器",
      tagline: "几秒算清自由职业项目报价:预估工时、加急系数、修改轮数与开支,还带好可发送的 50/25/25 里程碑拆分。",
      intro: [
        "报价是自由职业赚钱或亏钱的分水岭。加急项目理应加价,修改轮数是客户随口就提的真实工作,而开支——素材授权、插件、差旅——在你把它计回来之前都是你自己垫的钱。手工往报价单里加这些,就是它们被漏掉的原因。",
        "这个计算器用工时和你的小时费率生成报价:加急系数作用在工时上,每轮修改加收基础价的 10%,开支最后计入,再把总额拆成里程碑付款——默认 50% 启动、25% 中期、25% 交付,所有比例都可以改。",
      ],
      steps: [
        "输入预估工时和来自小时费率计算器的费率。",
        "选择加急系数——正常工期用 ×1,客户要求超出合理范围的工期时用 ×1.25/×1.5 或 ×2。",
        "填合同允许的修改轮数,加上你要垫付的开支。",
        "如果项目节奏不同,调整里程碑比例,然后把拆分复制进提案。",
      ],
      faqs: [
        {
          q: "加急系数是怎么算的?",
          a: "作用在工时上,再乘费率:20 小时的项目按 ×1.5 加急,就是按 30 小时 × 正常费率计价。这符合加急工作的真实代价——晚间、周末和被压缩的工期放大的是你必须挤出来的时间,而不是每小时的价值。",
        },
        {
          q: "修改轮数怎么影响总价?",
          a: "每轮修改加收基础报价(工时 × 费率,未加急)的 10%。1000 的基础价两轮修改就是 +200。这个比例给常见情况定价;超出合同约定轮数的修改应当另行报价——这正是轮数必须写进合同的原因。",
        },
        {
          q: "为什么是 50/25/25?",
          a: "50% 预付款过滤掉不认真的客户,也为项目垫资;中期款覆盖漫长的中段;最后 25% 让交付和验收对双方都保持诚实。三个比例都可修改——更大的项目常用 40/30/30,或改成按月的固定顾问费。",
        },
      ],
    },
    ja: {
      name: "プロジェクト見積計算機",
      tagline:
        "フリーランス案件の見積を数秒で:見積工数・特急倍率・修正回数・経費を含め、送れる状態の 50/25/25 マイルストーン配分付き。",
      intro: [
        "見積もりはフリーランスの収益が決まる場所です。特急案件には割増が当然、修正回数はクライアントが気軽に頼む本物の作業で、経費——素材ライセンス・プラグイン・交通費——は請求し返すまで自分の立て替えです。これらを手作業で見積書に書き足すから漏れるのです。",
        "この計算機は工数と時間単価から見積を組み立てます:特急倍率は工数に掛かり、修正 1 回につき基本額の 10% を加算、経費は最後に加算。合計はマイルストーン支払いに分割——既定は着手 50%・中間 25%・納品 25% で、割合はすべて編集できます。",
      ],
      steps: [
        "見積工数と、時間単価計算機で出した時間単価を入力します。",
        "特急倍率を選びます——通常の納期なら ×1、クライアントの要望が無理な速さなら ×1.25/×1.5 または ×2。",
        "契約で認める修正回数を数え、立て替える経費を加えます。",
        "プロジェクトの進め方が違えばマイルストーンの割合を調整し、提案書にその配分を写します。",
      ],
      faqs: [
        {
          q: "特急倍率はどう掛かりますか?",
          a: "工数に掛けてから単価を掛けます:20 時間の案件が ×1.5 なら、30 時間を通常単価で計算します。これは特急作業の実際のコスト——夜間・週末・圧縮された納期が「見つけなければならない時間」を増やす——に合致します。",
        },
        {
          q: "修正回数は合計にどう影響しますか?",
          a: "修正 1 回につき基本見積(工数 × 単価、特急前)の 10% を加算します。基本額 1,000 で 2 回なら +200。この率は一般的なケースの価格設定であり、契約回数を超える修正は別途見積もるべきです——だからこそ回数を契約に書くのです。",
        },
        {
          q: "なぜ 50/25/25 なのですか?",
          a: "半額の前払いで本気でないクライアントを排除し、作業資金を作る。中間支払いで長い中盤をカバーする。最後の 25% が納品と最終承認を双方に誠実に保つ。3 つの割合はすべて編集可能——大きな案件では 40/30/30 や月額顧問契約にするのが一般的です。",
        },
      ],
    },
    es: {
      name: "Calculadora de presupuesto de proyecto",
      tagline:
        "Presupuesta un proyecto freelance en segundos: horas estimadas, urgencia, rondas de revisión y gastos — con un reparto por hitos 50/25/25 listo para enviar.",
      intro: [
        "En el presupuesto se gana o se pierde el dinero freelance. Los trabajos urgentes merecen un recargo, las rondas de revisión son trabajo real que los clientes piden sin pensarlo, y los gastos — licencias, plugins, viajes — salen de tu bolsillo hasta que los facturas. Añadirlos a mano es exactamente cómo se olvidan.",
        "Esta calculadora arma el presupuesto desde las horas y tu tarifa: la urgencia multiplica las horas, cada ronda de revisión añade 10% de la base, los gastos entran al final, y el total se reparte en pagos por hitos — 50% al empezar, 25% a mitad, 25% al entregar, con los tres porcentajes editables.",
      ],
      steps: [
        "Introduce las horas estimadas y la tarifa por hora de la Calculadora de tarifa por hora.",
        "Elige el multiplicador de urgencia — ×1 para plazos normales, ×1.25/×1.5 o ×2 cuando el cliente lo necesita más rápido de lo sano.",
        "Cuenta las rondas de revisión que permite el contrato y suma los gastos que vas a adelantar.",
        "Ajusta los porcentajes de los hitos si el proyecto pide otro ritmo y copia el reparto en la propuesta.",
      ],
      faqs: [
        {
          q: "¿Cómo se aplica el multiplicador de urgencia?",
          a: "A las horas, antes de la tarifa: 20 horas con urgencia ×1,5 se cobran como 30 horas a tu tarifa normal. Así funciona el coste real de la prisa — noches, fines de semana y plazos comprimidos multiplican el tiempo que tienes que encontrar, no el valor de cada hora.",
        },
        {
          q: "¿Cómo afectan las revisiones al total?",
          a: "Cada ronda añade 10% del presupuesto base (horas × tarifa, sin urgencia). Dos rondas sobre una base de 1.000 suman 200. Ese porcentaje precio el caso común; las revisiones que excedan las rondas contratadas se presupuestan aparte — por eso el número de rondas va en el contrato.",
        },
        {
          q: "¿Por qué 50/25/25?",
          a: "La mitad por adelantado filtra a los clientes no serios y financia el trabajo; el pago intermedio cubre el largo trecho del medio; el 25% final mantiene honesta la entrega y la aprobación para ambos. Los tres porcentajes son editables — los proyectos grandes suelen ir 40/30/30 o con una mensualidad fija.",
        },
      ],
    },
    pt: {
      name: "Calculadora de orçamento de projeto",
      tagline:
        "Orça um projeto freelance em segundos: horas estimadas, urgência, rodadas de revisão e despesas — com divisão por marcos 50/25/25 pronta para enviar.",
      intro: [
        "No orçamento o dinheiro freelance é ganho ou perdido. Trabalhos urgentes merecem um adicional, rodadas de revisão são trabalho real que o cliente pede sem pensar, e as despesas — licenças, plugins, viagem — saem do seu bolso até você faturá-las. Escrever tudo à mão no orçamento é como elas se perdem.",
        "Esta calculadora monta o orçamento a partir das horas e do seu valor por hora: a urgência multiplica as horas, cada rodada de revisão soma 10% da base, as despesas entram por último, e o total é dividido em pagamentos por marcos — 50% no início, 25% no meio, 25% na entrega, com as porcentagens editáveis.",
      ],
      steps: [
        "Informe as horas estimadas e o valor por hora vindo da Calculadora de valor por hora.",
        "Escolha o multiplicador de urgência — ×1 para prazos normais, ×1.25/×1.5 ou ×2 quando o cliente precisa mais rápido do que o saudável.",
        "Conte as rodadas de revisão que o contrato permite e some as despesas que você vai adiantar.",
        "Ajuste as porcentagens dos marcos se o projeto pedir outro ritmo e copie a divisão para a proposta.",
      ],
      faqs: [
        {
          q: "Como o multiplicador de urgência é aplicado?",
          a: "Às horas, antes do valor: 20 horas com urgência ×1,5 são cobradas como 30 horas pelo seu valor normal. É assim que a pressa custa de verdade — noites, fins de semana e prazos comprimidos multiplicam o tempo que você precisa encontrar, não o valor de cada hora.",
        },
        {
          q: "Como as revisões afetam o total?",
          a: "Cada rodada soma 10% do orçamento base (horas × valor, sem urgência). Duas rodadas sobre uma base de 1.000 somam 200. Esse percentual preço o caso comum; revisões além das rodadas contratadas devem ser orçadas à parte — por isso o número de rodadas entra no contrato.",
        },
        {
          q: "Por que 50/25/25?",
          a: "Metade adiantada filtra clientes sem seriedade e financia o trabalho; o pagamento intermediário cobre o meio longo; os 25% finais mantêm entrega e aprovação honestas para os dois lados. As três porcentagens são editáveis — projetos maiores usam 40/30/30 ou retenção mensal.",
        },
      ],
    },
  },
  related: ["hourly-rate-calculator", "invoice-line-calculator", "rate-health-check"],
});
