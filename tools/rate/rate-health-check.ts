import { defineTool } from "../_lib/types";
import { HealthEngine } from "../_engines/health-engine";

export default defineTool({
  slug: "rate-health-check",
  category: "utility",
  icon: "check",
  engine: { component: HealthEngine, props: {} },
  copy: {
    en: {
      name: "Rate Health Check",
      tagline:
        "Run last month's real numbers against your income target — utilization, shortfall or surplus, and the rate you actually need at this billable volume.",
      intro: [
        "A rate looks healthy until you compare it with reality. 100 billable hours at $50 is $5,000 — against a $6,000 target that is a $1,000 shortfall no rate calculator will confess, because the problem is not the rate alone: it is how many of your hours ever get billed.",
        "This check takes last month as data: your rate, the hours you billed, the hours you actually worked, and your monthly income target. It returns utilization (billable ÷ worked — most freelancers land between 50% and 70%), the shortfall or surplus, and the rate that would hit the target at this month's billable volume, so you can see whether the fix is a higher rate, more billable work, or both.",
      ],
      steps: [
        "Enter your current hourly rate and the billable hours from last month's invoices.",
        "Enter the total hours you actually worked last month — every email, pitch and revision included.",
        "Enter your target monthly income, then read utilization, the gap and the rate needed to close it.",
        "If utilization is low, the fix is billable work, not just a raise; if it is high and you still fall short, the rate has to move.",
      ],
      faqs: [
        {
          q: "How is utilization calculated, and what is a good number?",
          a: "Utilization = billable hours ÷ total hours worked × 100. A 100% utilization is not achievable — sales, admin and revisions are unpaid by definition. Most independent freelancers settle between 50% and 70%; consistently below 40% means prospecting, above 100% means your tracking is broken.",
        },
        {
          q: "How is the 'rate needed' computed?",
          a: "Target monthly income ÷ billable hours of the month. At 100 billable hours and a $6,000 target you need $60/h — regardless of what you charge today. It assumes the same billable volume; if you can bill more hours, the required rate drops proportionally.",
        },
        {
          q: "My income matched the target but utilization was 95%. Is that fine?",
          a: "The target is met, but the margin is thin: one sick week turns a good month into a shortfall. Sustainable freelance utilization sits lower so that slow months average out. If every month needs 90%+, your rate is doing the work your pipeline should do.",
        },
      ],
    },
    zh: {
      name: "费率健康检查",
      tagline: "拿上个月的真实数字对照收入目标——利用率、缺口或盈余,以及按当前计费量真正需要的费率。",
      intro: [
        "费率看起来健康,直到你拿现实来对账。100 个计费小时按 50 算是 5,000——对着 6,000 的目标就是 1,000 的缺口,而费率计算器不会承认这一点,因为问题不只在费率:更在于你的时间里究竟有多少被计费。",
        "这个检查把上个月当数据:你的费率、计费小时、实际工作小时,以及月收入目标。它给出利用率(计费 ÷ 总工时——多数自由职业者落在 50%–70%)、缺口或盈余,以及按本月计费量达标所需的费率——让你看清该提价、该增加计费工作,还是两者都要。",
      ],
      steps: [
        "输入当前小时费率和上个月发票上的计费小时。",
        "输入上个月实际工作的总小时——每封邮件、每次提案、每轮修改都算。",
        "输入月收入目标,然后读取利用率、差额和补上缺口所需的费率。",
        "利用率低,解法是增加计费工作而不只是提价;利用率高仍然缺口,费率就必须动了。",
      ],
      faqs: [
        {
          q: "利用率怎么算?多少算好?",
          a: "利用率 = 计费小时 ÷ 总工作小时 × 100。100% 不可能实现——销售、行政和返工按定义不收钱。多数独立自由职业者落在 50%–70%;长期低于 40% 说明要去找客户,超过 100% 说明你的计时记录出了问题。",
        },
        {
          q: "「所需费率」是怎么算的?",
          a: "目标月收入 ÷ 当月计费小时。100 个计费小时、目标 6,000,就需要 60/小时——与你现在的报价无关。它假设计费量不变;如果能计费更多小时,所需费率会同比例下降。",
        },
        {
          q: "收入达标但利用率 95%,可以吗?",
          a: "目标达到了,但缓冲太薄:病一周就会把好月份变成缺口。可持续的自由职业利用率应该更低,让淡月被平摊。如果每个月都要 90% 以上,那是你的费率在替客户管道干活。",
        },
      ],
    },
    ja: {
      name: "単価ヘルスチェック",
      tagline:
        "先月の実数値を収入目標と突き合わせます——稼働率・不足・余剰、そしてこの請求可能量で必要な本当の単価。",
      intro: [
        "単価は現実と突き合わせるまで健康に見えます。100 時間の請求を 50 で行えば 5,000 —— 6,000 の目標に対して 1,000 の不足です。単価計算機はこれを認めません。問題は単価だけではなく、働いた時間のうち実際に請求できた割合だからです。",
        "このチェックは先月をデータとして扱います:あなたの単価、請求した時間、実際に働いた時間、月間収入目標。結果として稼働率(請求 ÷ 総稼働——多くのフリーランスは 50〜70% に収まります)、不足または余剰、そして今月の請求可能量で目標に届く単価を返します。解決策が値上げか、請求可能な仕事を増やすことか、その両方かが見えます。",
      ],
      steps: [
        "現在の時間単価と、先月の請求書に基づく請求可能時間を入力します。",
        "先月実際に働いた総時間を入力します——すべてのメール・提案・修正を含めて。",
        "月間収入目標を入力し、稼働率・差額・それを埋めるのに必要な単価を確認します。",
        "稼働率が低ければ解決策は値上げではなく請求できる仕事を増やすこと。高くても不足するなら単価を動かすしかありません。",
      ],
      faqs: [
        {
          q: "稼働率の計算方法と、適正値は?",
          a: "稼働率 = 請求可能時間 ÷ 総稼働時間 × 100。100% は達成不可能です——営業・事務・修正は定義上無給だからです。独立系フリーランスの多くは 50〜70% に落ち着きます。継続して 40% 未満は営業不足、100% 超は計測が壊れているサインです。",
        },
        {
          q: "「必要な単価」はどう計算しますか?",
          a: "目標月収 ÷ その月の請求可能時間。請求 100 時間で目標 6,000 なら 60/時が必要です——今の単価がいくらであっても。同じ請求量を仮定しており、請求できる時間を増やせば必要単価は比例して下がります。",
        },
        {
          q: "収入は目標達成でも稼働率 95% です。大丈夫?",
          a: "目標は達成でも余裕が薄すぎます。病気の 1 週間で好調な月が不足に変わります。持続可能な稼働率はこれより低く、閑散期を平均で吸収できる水準が健全です。毎月 90% 以上が必要なら、パイプラインがやるべき仕事を単価に押し付けています。",
        },
      ],
    },
    es: {
      name: "Chequeo de salud de tu tarifa",
      tagline:
        "Contrapón las cifras reales del mes pasado a tu objetivo de ingresos — utilización, faltante o excedente, y la tarifa que de verdad necesitas con este volumen.",
      intro: [
        "Una tarifa parece sana hasta que la comparas con la realidad. 100 horas facturadas a 50 son 5.000 — frente a un objetivo de 6.000 es un faltante de 1.000 que ninguna calculadora de tarifas admite, porque el problema no es solo la tarifa: es cuántas de tus horas llegan a facturarse.",
        "Este chequeo toma el mes pasado como datos: tu tarifa, las horas facturadas, las horas realmente trabajadas y tu objetivo mensual. Devuelve la utilización (facturadas ÷ trabajadas — la mayoría de freelancers queda entre el 50% y el 70%), el faltante o excedente, y la tarifa que alcanzaría el objetivo con el volumen facturable de este mes, para que veas si la solución es subir la tarifa, conseguir más trabajo facturable, o ambas.",
      ],
      steps: [
        "Introduce tu tarifa por hora actual y las horas facturadas de las facturas del mes pasado.",
        "Introduce las horas totales que trabajaste el mes pasado — incluidos todos los correos, propuestas y revisiones.",
        "Introduce tu objetivo mensual de ingresos y lee la utilización, la brecha y la tarifa necesaria para cerrarla.",
        "Si la utilización es baja, la solución es trabajo facturable, no solo una subida; si es alta y aún así te falta, la tarifa tiene que moverse.",
      ],
      faqs: [
        {
          q: "¿Cómo se calcula la utilización y qué valor es bueno?",
          a: "Utilización = horas facturadas ÷ horas trabajadas × 100. Un 100% es inalcanzable — ventas, administración y revisiones no se cobran por definición. La mayoría de freelancers independientes se queda entre el 50% y el 70%; por debajo del 40% de forma sostenida significa prospección, por encima del 100%, que tu registro falla.",
        },
        {
          q: "¿Cómo se calcula la «tarifa necesaria»?",
          a: "Objetivo mensual ÷ horas facturadas del mes. Con 100 horas facturables y un objetivo de 6.000 necesitas 60/h — sin importar lo que cobres hoy. Asume el mismo volumen facturable; si facturas más horas, la tarifa necesaria baja proporcionalmente.",
        },
        {
          q: "Cumplí el objetivo pero la utilización fue del 95%. ¿Está bien?",
          a: "El objetivo se cumplió, pero el margen es fino: una semana enferma convierte un buen mes en faltante. Una utilización freelance sostenible es más baja, para que los meses flojos se promedien. Si cada mes exige más del 90%, tu tarifa está haciendo el trabajo que debería hacer tu canal de ventas.",
        },
      ],
    },
    pt: {
      name: "Diagnóstico da sua taxa",
      tagline:
        "Coloque os números reais do mês passado contra sua meta de renda — utilização, falta ou excedente, e a taxa que você realmente precisa neste volume faturável.",
      intro: [
        "Uma taxa parece saudável até você compará-la com a realidade. 100 horas faturáveis a 50 são 5.000 — contra uma meta de 6.000, uma falta de 1.000 que nenhuma calculadora de taxa admite, porque o problema não é só a taxa: é quantas das suas horas chegam a ser faturadas.",
        "Este diagnóstico usa o mês passado como dado: sua taxa, as horas faturadas, as horas realmente trabalhadas e sua meta mensal. Ele devolve a utilização (faturáveis ÷ trabalhadas — a maioria dos freelancers fica entre 50% e 70%), a falta ou o excedente, e a taxa que atingiria a meta com o volume faturável deste mês, para você ver se a solução é subir a taxa, conseguir mais trabalho faturável, ou ambos.",
      ],
      steps: [
        "Informe seu valor por hora atual e as horas faturáveis das notas do mês passado.",
        "Informe as horas totais que você trabalhou no mês passado — incluindo cada e-mail, proposta e revisão.",
        "Informe sua meta de renda mensal e leia a utilização, a diferença e a taxa necessária para fechá-la.",
        "Se a utilização está baixa, a solução é trabalho faturável, não só um aumento; se está alta e ainda falta, a taxa tem que mudar.",
      ],
      faqs: [
        {
          q: "Como a utilização é calculada e qual é um bom número?",
          a: "Utilização = horas faturáveis ÷ horas trabalhadas × 100. Utilização de 100% é inalcançável — vendas, administração e revisões não são pagas por definição. A maioria dos freelancers independentes fica entre 50% e 70%; abaixo de 40% de forma constante é falta de prospecção, acima de 100% seu controle de horas falhou.",
        },
        {
          q: "Como a «taxa necessária» é calculada?",
          a: "Meta de renda mensal ÷ horas faturáveis do mês. Com 100 horas faturáveis e uma meta de 6.000 você precisa de 60/h — independentemente do que cobra hoje. Presume o mesmo volume faturável; se faturar mais horas, a taxa necessária cai proporcionalmente.",
        },
        {
          q: "Bati a meta mas a utilização foi de 95%. Está bom?",
          a: "A meta foi batida, mas a folga é fina: uma semana doente transforma um bom mês em falta. Utilização freelance sustentável fica mais baixa, para que meses fracos se compensem na média. Se todo mês exige mais de 90%, sua taxa está fazendo o trabalho que deveria ser do seu funil de vendas.",
        },
      ],
    },
  },
  related: ["hourly-rate-calculator", "project-quote", "invoice-line-calculator"],
});
