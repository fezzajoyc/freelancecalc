import { defineTool } from "../_lib/types";
import { RateEngine } from "../_engines/rate-engine";

export default defineTool({
  slug: "hourly-rate-calculator",
  category: "utility",
  icon: "calc",
  featured: true,
  engine: { component: RateEngine, props: {} },
  copy: {
    en: {
      name: "Hourly Rate Calculator",
      tagline:
        "Turn a target annual salary into an honest hourly rate — expenses, real billable hours and profit margin included, with the full math shown.",
      intro: [
        "Most freelance rate calculators divide a salary by 2,080 hours — forty hours a week, fifty-two weeks a year, every hour paid. That number is a fantasy. Vacations, sick days, sales calls, invoicing and bookkeeping are all unpaid, so the only hours that count are the ones a client actually buys.",
        "This calculator starts from what you want to earn, adds your business expenses, divides by the hours you will really bill, and grosses up by a profit margin. The default capacity is 46 billable weeks and 25 billable hours per week — the freelance reality — and every step of the math is shown so you can argue with it.",
      ],
      steps: [
        "Enter the annual salary you want to take home — the equivalent of an employment offer you would accept.",
        "Add your business expenses for the year: software, hardware, insurance, accounting, coworking, equipment.",
        "Set your honest capacity: billable weeks per year (46 by default — six weeks off) and billable hours per week (25 by default, not 40).",
        "Choose a profit margin for slow months and growth, then read the required rate and the capacity table.",
      ],
      faqs: [
        {
          q: "What is the formula for the required hourly rate?",
          a: "Required rate = (target salary + annual expenses) ÷ (billable weeks × billable hours per week) × (1 + profit margin). For example, $60,000 + $6,000 over 46 weeks × 25 hours = $66,000 ÷ 1,150 h ≈ $57.39/h before margin; with a 20% margin, $68.87/h.",
        },
        {
          q: "Why 25 billable hours and not 40?",
          a: "A 40-hour week of billable client work almost never happens. Sales, proposals, admin, marketing and revisions eat the rest, and they are unpaid. Studies and experienced freelancers put sustainable billable capacity around 20–30 hours a week; the field defaults to 25 and is fully editable.",
        },
        {
          q: "What profit margin should I use?",
          a: "The margin is your buffer for unpaid slow months, non-paying clients, equipment replacement and growth. 10–20% is a common range; 0% means every bad month eats your salary. The margin multiplies the break-even rate directly, so 20% on a $57.39 break-even is $68.87.",
        },
      ],
    },
    zh: {
      name: "小时费率计算器",
      tagline: "把目标年薪换算成诚实的小时费率:计入业务开支、真实可计费小时和利润率,完整算式全部展示。",
      intro: [
        "大多数自由职业费率计算器都拿年薪除以 2080 小时——每周 40 小时、每年 52 周、每个小时都收钱。这个数字是幻觉:假期、病假、销售电话、开票和记账都不赚钱,真正算数的只有客户实际购买的那些小时。",
        "这个计算器从你想赚多少开始,加上业务开支,除以你真正能计费的小时,再乘上利润率。默认产能是每年 46 个计费周、每周 25 个计费小时——自由职业的真实水平——而且每一步算式都展示出来,欢迎你对它提出质疑。",
      ],
      steps: [
        "输入你想到手的年薪——相当于一份你愿意接受的正式雇佣邀约。",
        "加上年度业务开支:软件、硬件、保险、会计、联合办公、设备。",
        "填写诚实的产能:每年计费周数(默认 46——留 6 周休息)和每周计费小时(默认 25,不是 40)。",
        "选一个利润率应对淡季和成长,然后读取所需费率和产能对照表。",
      ],
      faqs: [
        {
          q: "所需小时费率的公式是什么?",
          a: "所需费率 =(目标年薪 + 年度开支)÷(计费周 × 每周计费小时)×(1 + 利润率)。例如 60,000 + 6,000,除以 46 周 × 25 小时 = 66,000 ÷ 1,150 小时 ≈ 57.39/小时;再乘 20% 利润率就是 68.87/小时。",
        },
        {
          q: "为什么是 25 个计费小时而不是 40?",
          a: "每周 40 小时全是客户计费工作几乎不可能。销售、提案、行政、营销和返工吃掉了剩余时间,而且都不赚钱。经验和行业共识把可持续的计费产能放在每周 20–30 小时;默认值取 25,随时可以修改。",
        },
        {
          q: "利润率该设多少?",
          a: "利润率是你应对淡季、赖账客户、设备更换和成长的缓冲。常见区间是 10%–20%;设 0% 意味着每个糟糕的月份都在啃你的工资。利润率直接乘在保本费率上:57.39 的保本价乘 20% 就是 68.87。",
        },
      ],
    },
    ja: {
      name: "時間単価計算機",
      tagline:
        "目標年収を正直な時間単価に換算——経費・実際の請求可能時間・利益マージンを含め、計算過程をすべて表示します。",
      intro: [
        "ほとんどのフリーランス向け単価計算機は年収を 2,080 時間で割ります——週 40 時間、年 52 週、全時間に報酬が付く想定です。しかしそれは幻想です。休暇・病気・営業電話・請求作業・経理は無給で、意味を持つのはクライアントが実際に買う時間だけです。",
        "この計算機は「いくら稼ぎたいか」から始め、事業経費を加え、本当に請求できる時間で割り、利益マージンを上乗せします。既定の稼働能力は年 46 週・週 25 時間の請求可能時間——フリーランスの現実値——で、計算の全工程が表示されるので、数値に納得できなければ自由に変えてください。",
      ],
      steps: [
        "手取りしたい年収を入力——受け入れてもよい雇用オファーの水準にあたる金額です。",
        "年間の事業経費を加えます:ソフトウェア、機材、保険、経理、シェアオフィス、備品。",
        "正直な稼働能力を設定:年間請求可能週数(既定 46——6 週間の休み)と週あたり請求可能時間(既定 25、40 ではありません)。",
        "低調な月と成長のためのマージンを選び、必要な単価と稼働能力別の表を確認します。",
      ],
      faqs: [
        {
          q: "必要な時間単価の計算式は?",
          a: "必要単価 =(目標年収 + 年間経費)÷(請求可能週数 × 週の請求可能時間)×(1 + マージン)。たとえば 60,000 + 6,000 を 46 週 × 25 時間で割ると 66,000 ÷ 1,150 時間 ≈ 57.39/時。マージン 20% を掛けると 68.87/時です。",
        },
        {
          q: "なぜ 40 ではなく 25 時間なのか?",
          a: "週 40 時間すべてがクライアントワークになることはまずありません。営業・提案・事務・マーケティング・修正が残りを食べ、それらは無給です。持続可能な請求可能能力は週 20〜30 時間とするのが経験則で、既定値は 25。いつでも変更できます。",
        },
        {
          q: "マージンはどれくらいにすべき?",
          a: "マージンは閑散期・未払いクライアント・機材更新・成長のためのバッファです。10〜20% が一般的で、0% は悪い月ごとに年収を削ることになります。マージンは損益分岐単価に直接掛かるので、57.39 × 1.2 = 68.87 となります。",
        },
      ],
    },
    es: {
      name: "Calculadora de tarifa por hora",
      tagline:
        "Convierte un sueldo anual objetivo en una tarifa por hora honesta — con gastos, horas facturables reales y margen de beneficio, mostrando todo el cálculo.",
      intro: [
        "La mayoría de calculadoras de tarifa freelance dividen el sueldo entre 2.080 horas — cuarenta horas semanales, cincuenta y dos semanas, cada hora pagada. Esa cifra es una fantasía: vacaciones, bajas, llamadas de ventas, facturación y contabilidad no se cobran, así que solo cuentan las horas que un cliente compra de verdad.",
        "Esta calculadora parte de lo que quieres ganar, suma tus gastos del negocio, divide entre las horas que realmente facturarás y añade un margen de beneficio. La capacidad por defecto es 46 semanas y 25 horas facturables por semana — la realidad freelance — y cada paso del cálculo queda a la vista para que puedas discutirlo.",
      ],
      steps: [
        "Introduce el sueldo anual que quieres llevarte — el equivalente a una oferta de empleo que aceptarías.",
        "Suma tus gastos del negocio del año: software, equipo, seguros, contabilidad, coworking, material.",
        "Fija tu capacidad honesta: semanas facturables al año (46 por defecto — seis semanas libres) y horas facturables por semana (25 por defecto, no 40).",
        "Elige un margen de beneficio para los meses flojos y el crecimiento, y lee la tarifa necesaria y la tabla de capacidades.",
      ],
      faqs: [
        {
          q: "¿Cuál es la fórmula de la tarifa por hora necesaria?",
          a: "Tarifa = (sueldo objetivo + gastos anuales) ÷ (semanas facturables × horas facturables por semana) × (1 + margen). Por ejemplo, 60.000 + 6.000 entre 46 semanas × 25 horas = 66.000 ÷ 1.150 h ≈ 57,39/h; con un margen del 20%, 68,87/h.",
        },
        {
          q: "¿Por qué 25 horas facturables y no 40?",
          a: "Una semana de 40 horas de trabajo facturable casi nunca ocurre. Ventas, propuestas, administración, marketing y revisiones se comen el resto, y no se cobran. La experiencia sitúa la capacidad sostenible entre 20 y 30 horas semanales; el campo trae 25 por defecto y es editable.",
        },
        {
          q: "¿Qué margen de beneficio conviene usar?",
          a: "El margen es tu colchón para meses flojos, clientes que no pagan, recambio de equipo y crecimiento. Un 10–20% es habitual; 0% significa que cada mal mes se come tu sueldo. El margen multiplica la tarifa de equilibrio directamente: 20% sobre 57,39 son 68,87.",
        },
      ],
    },
    pt: {
      name: "Calculadora de valor por hora",
      tagline:
        "Transforma um salário anual alvo em um valor por hora honesto — com despesas, horas faturáveis reais e margem de lucro, mostrando toda a conta.",
      intro: [
        "A maioria das calculadoras de valor-hora divide o salário por 2.080 horas — quarenta horas por semana, cinquenta e duas semanas, cada hora paga. Esse número é fantasia: férias, licenças, chamadas de venda, faturamento e contabilidade não rendem nada; só contam as horas que um cliente realmente compra.",
        "Esta calculadora começa pelo que você quer ganhar, soma as despesas do negócio, divide pelas horas que você vai faturar de fato e acrescenta uma margem de lucro. A capacidade padrão é 46 semanas e 25 horas faturáveis por semana — a realidade freelance — e cada passo da conta fica visível para você poder contestá-lo.",
      ],
      steps: [
        "Informe o salário anual que quer receber — o equivalente a uma oferta de emprego que você aceitaria.",
        "Some as despesas anuais do negócio: software, equipamento, seguros, contabilidade, coworking, material.",
        "Defina sua capacidade honesta: semanas faturáveis por ano (46 por padrão — seis semanas de folga) e horas faturáveis por semana (25 por padrão, não 40).",
        "Escolha uma margem de lucro para meses fracos e crescimento, e leia o valor-hora necessário e a tabela de capacidades.",
      ],
      faqs: [
        {
          q: "Qual é a fórmula do valor por hora necessário?",
          a: "Taxa = (salário alvo + despesas anuais) ÷ (semanas faturáveis × horas faturáveis por semana) × (1 + margem). Por exemplo, 60.000 + 6.000 em 46 semanas × 25 horas = 66.000 ÷ 1.150 h ≈ 57,39/h; com margem de 20%, 68,87/h.",
        },
        {
          q: "Por que 25 horas faturáveis e não 40?",
          a: "Uma semana de 40 horas de trabalho faturável quase nunca acontece. Vendas, propostas, administração, marketing e revisões comem o resto — e não são pagas. A experiência coloca a capacidade sustentável entre 20 e 30 horas semanais; o campo vem com 25 por padrão e é editável.",
        },
        {
          q: "Que margem de lucro devo usar?",
          a: "A margem é seu colchão para meses fracos, clientes inadimplentes, reposição de equipamento e crescimento. 10–20% é comum; 0% significa que cada mês ruim rói seu salário. A margem multiplica diretamente a taxa de equilíbrio: 20% sobre 57,39 dá 68,87.",
        },
      ],
    },
  },
  related: ["project-quote", "rate-health-check", "invoice-line-calculator"],
});
