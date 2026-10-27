import type { Entry } from '../catalogue-types';
import type { enInsights } from '../en-insights';

// The companion talks to "tú", short and warm, Spain-neutral. The day's line is "el límite" (the
// jokes may say "pasarse de la raya"); a pot is a "hucha"; closing the day is "el cierre".
export const esInsights: { readonly [Key in keyof typeof enInsights]: Entry } = {
  'insight.compare.muchMore': 'mucho más',
  'insight.compare.more': 'más',
  'insight.compare.about': 'más o menos lo mismo',
  'insight.compare.less': 'menos',
  'insight.compare.muchLess': 'mucho menos',

  'insight.todayOver.soft.1': 'Hoy te pasaste {over}. No pasa nada: mañana tienes {tomorrow}.',
  'insight.todayOver.soft.2':
    'Un día más grande, {over} de más. El plan se ajusta: mañana tienes {tomorrow}.',
  'insight.todayOver.cheeky.1': '{over} de más hoy. Mañana tienes {tomorrow}, y a estrenar.',
  'insight.todayOver.cheeky.2':
    'Hoy te pasaste de la raya {over}. Giro de guion: mañana tienes {tomorrow}.',
  'insight.todayOver.roast.1':
    '{over} de más. El límite plantó cara. Mañana, {tomorrow}, y con calma.',
  'insight.todayOver.roast.2':
    'El límite dijo que no; hoy dijo {over} más. Mañana, {tomorrow}: segundo asalto.',
  'insight.todayOver.plain': 'Hoy vas {over} por encima del límite. El de mañana es {tomorrow}.',

  'insight.todayUnder.soft.1': 'Llevas {spent}, y aún puedes gastar {safe}. Así, con calma.',
  'insight.todayUnder.soft.2': 'Hoy aún te quedan {safe}. Lo estás haciendo bien.',
  'insight.todayUnder.cheeky.1': 'Te quedan {safe} hoy. Gástalos bien o guárdalos. Tú decides.',
  'insight.todayUnder.cheeky.2': '{spent} fuera, {safe} por delante. Fino.',
  'insight.todayUnder.roast.1':
    '¿Solo {spent} de momento? La cartera está confusa, pero para bien. Aún tienes {safe}.',
  'insight.todayUnder.roast.2': 'Aún tienes {safe}. Casi sospechoso. Sigue así.',
  'insight.todayUnder.plain': 'Hoy has gastado {spent}; aún puedes gastar {safe}.',

  'insight.noSpendYet.soft.1': 'Aún no has gastado nada. Los {line} de hoy siguen siendo tuyos.',
  'insight.noSpendYet.soft.2': 'Página en blanco: {line} para hoy.',
  'insight.noSpendYet.cheeky.1': '{line} hoy y ni un rasguño. De momento.',
  'insight.noSpendYet.cheeky.2': '{line} enteritos hoy, sin tocar. Por ahora.',
  'insight.noSpendYet.roast.1': 'Aún nada gastado. {line} esperan a ver qué haces.',
  'insight.noSpendYet.roast.2': '{line} ahí quietos, sin gastar. Sospechoso. Tú sigue.',
  'insight.noSpendYet.plain': 'Aún no has gastado nada. El límite de hoy es {line}.',

  'insight.waitingTonight.soft.1': {
    one: 'Un gasto ({amount}) te espera esta noche. Un minuto, como mucho.',
    other: '{count} gastos ({amount}) te esperan esta noche. Un minuto, como mucho.',
  },
  'insight.waitingTonight.soft.2': {
    one: 'Un gasto que repasar esta noche: {amount}.',
    other: '{count} gastos que repasar esta noche, {amount} en total.',
  },
  'insight.waitingTonight.cheeky.1': {
    one: 'Un gasto ({amount}) espera su veredicto esta noche.',
    other: '{count} gastos ({amount}) esperan su veredicto esta noche.',
  },
  'insight.waitingTonight.cheeky.2': {
    one: 'El cierre de esta noche: un gasto, {amount}. Pan comido.',
    other: 'El cierre de esta noche: {count} gastos, {amount}. Pan comido.',
  },
  'insight.waitingTonight.roast.1': {
    one: '{amount} esperando. No se cierra solo, pero en un minuto está.',
    other: '{count} gastos, {amount}, esperando. No se cierran solos; en un minuto está.',
  },
  'insight.waitingTonight.roast.2': {
    one: '{amount} esperando a que digas “sí, fui yo”.',
    other: '{count} gastos, {amount}, esperando a que digas “sí, fui yo”.',
  },
  'insight.waitingTonight.plain': {
    one: 'Un gasto ({amount}) espera al cierre de esta noche.',
    other: '{count} gastos ({amount}) esperan al cierre de esta noche.',
  },

  'insight.paydaySoon.soft.1': {
    one: 'Mañana cobras. Lo has conseguido.',
    other: 'Cobras dentro de {count} días. Ya casi está.',
  },
  'insight.paydaySoon.soft.2': {
    one: 'Un día más para cobrar. Qué orgullo de mes.',
    other: '{count} días para cobrar, el {payday}. Aguanta.',
  },
  'insight.paydaySoon.cheeky.1': {
    one: 'Mañana cobras. Intenta no comprarte un yate.',
    other: 'Cobras en {count} días. Ya lo huelo.',
  },
  'insight.paydaySoon.cheeky.2': {
    one: 'Mañana es día de cobro. Disimula.',
    other: 'Quedan {count} noches para cobrar.',
  },
  'insight.paydaySoon.roast.1': {
    one: 'Mañana cobras. La cartera ha sobrevivido.',
    other: '{count} días para cobrar. Aguanta el tipo.',
  },
  'insight.paydaySoon.roast.2': {
    one: 'Un día. Un día lo aguanta cualquiera.',
    other: 'Cobras el {payday}. Hasta entonces, cartera cerrada.',
  },
  'insight.paydaySoon.plain': {
    one: 'El día de cobro es mañana.',
    other: 'El día de cobro es dentro de {count} días, el {payday}.',
  },

  'insight.billDueToday.soft.1': '{bill} ({amount}) vence hoy.',
  'insight.billDueToday.soft.2': 'Un aviso: {bill}, {amount}, vence hoy.',
  'insight.billDueToday.cheeky.1': '{bill} quiere sus {amount} hoy.',
  'insight.billDueToday.cheeky.2': 'Estrella invitada de hoy: {bill}, {amount}.',
  'insight.billDueToday.roast.1': '{bill} vence hoy. No va a esperar.',
  'insight.billDueToday.roast.2': '{amount} para {bill}, hoy. No le hagas ghosting.',
  'insight.billDueToday.plain': '{bill} ({amount}) vence hoy.',

  'insight.billDue.soft.1': {
    one: '{bill} ({amount}) vence mañana.',
    other: '{bill} ({amount}) vence dentro de {count} días.',
  },
  'insight.billDue.soft.2': {
    one: 'Aviso: {bill}, {amount}, mañana.',
    other: 'Aviso: {bill}, {amount}, dentro de {count} días.',
  },
  'insight.billDue.cheeky.1': {
    one: '{bill} viene a por {amount} mañana.',
    other: '{bill} viene a por {amount} en {count} días.',
  },
  'insight.billDue.cheeky.2': {
    one: 'Mañana: {bill}, {amount}. Apúntatelo.',
    other: 'En {count} días: {bill}, {amount}. Apúntatelo.',
  },
  'insight.billDue.roast.1': {
    one: '{bill} quiere {amount} mañana. Como siempre.',
    other: '{bill} quiere {amount} en {count} días. Como siempre.',
  },
  'insight.billDue.roast.2': {
    one: '{amount} para {bill} mañana. Que no te pille por sorpresa.',
    other: '{amount} para {bill} en {count} días. Que no te pille por sorpresa.',
  },
  'insight.billDue.plain': {
    one: '{bill} ({amount}) vence mañana.',
    other: '{bill} ({amount}) vence dentro de {count} días.',
  },

  'insight.categoryPaceUp.soft.1':
    '{category} va por {now} este ciclo, {compare} que a estas alturas del anterior.',
  'insight.categoryPaceUp.soft.2':
    '{category} va por delante: {now} de momento, {before} el ciclo pasado.',
  'insight.categoryPaceUp.cheeky.1':
    '{category}: ya {now}. El ciclo pasado ibas por {before}. Mmm.',
  'insight.categoryPaceUp.cheeky.2': '{category} está en su momento: {now} frente a {before}.',
  'insight.categoryPaceUp.roast.1':
    '{category} en {now}. El ciclo pasado: {before}. Lo veo. Una semana tranquila lo compensa.',
  'insight.categoryPaceUp.roast.2':
    'Ya {now} en {category}; la otra vez eran {before}. Lo digo con cariño.',
  'insight.categoryPaceUp.plain':
    '{category}: {now} este ciclo, {before} a estas alturas del anterior.',

  'insight.categoryPaceDown.soft.1':
    '{category} baja a {now}, desde {before} el ciclo pasado. Qué bien.',
  'insight.categoryPaceDown.soft.2':
    'En {category}, {compare} que el ciclo pasado: {now} frente a {before}.',
  'insight.categoryPaceDown.cheeky.1': '{category}: {now}, antes {before}. Mírate.',
  'insight.categoryPaceDown.cheeky.2': '{category} se ha puesto a dieta: {now} frente a {before}.',
  'insight.categoryPaceDown.roast.1':
    '¿{category} solo {now}? Eran {before}. Quédate con esta versión.',
  'insight.categoryPaceDown.roast.2': '{now} en {category}, antes {before}. Madurez.',
  'insight.categoryPaceDown.plain':
    '{category}: {now} este ciclo, {before} a estas alturas del anterior.',

  'insight.repeatMerchant.soft.1': '{merchant}, {visits} veces esta semana. Deben de adorarte.',
  'insight.repeatMerchant.soft.2':
    '{visits} visitas a {merchant} desde el lunes, {amount} en total.',
  'insight.repeatMerchant.cheeky.1': '¿{merchant} otra vez? Van {visits} desde el lunes.',
  'insight.repeatMerchant.cheeky.2': 'Tú y {merchant}: {visits} citas esta semana, {amount}.',
  'insight.repeatMerchant.roast.1': '{merchant}, visita número {visits}. ¿Ya se saben tu nombre?',
  'insight.repeatMerchant.roast.2':
    '{amount} en {merchant} esta semana. {visits} visitas. Un estilo de vida.',
  'insight.repeatMerchant.plain': '{merchant}: {visits} visitas esta semana, {amount}.',

  'insight.firstTimeMerchant.soft.1': 'Primera vez en {merchant}. Ojalá estuviera bien.',
  'insight.firstTimeMerchant.soft.2': 'Un sitio nuevo: {merchant}, {amount}.',
  'insight.firstTimeMerchant.cheeky.1': '¿{merchant}? Sitio nuevo. Qué aventura.',
  'insight.firstTimeMerchant.cheeky.2': 'Uy, {merchant}. Este no lo conocía.',
  'insight.firstTimeMerchant.roast.1': '{merchant}. Sitio nuevo, misma cartera.',
  'insight.firstTimeMerchant.roast.2':
    'Primera visita a {merchant}. Que no se convierta en costumbre. O sí.',
  'insight.firstTimeMerchant.plain': 'Primer gasto en {merchant}: {amount}.',

  'insight.biggestSpend.soft.1': 'El gasto gordo de la semana: {amount} en {merchant}.',
  'insight.biggestSpend.soft.2':
    '{merchant}, {amount}: lo más grande de la semana. El plan lo cubre.',
  'insight.biggestSpend.cheeky.1': 'Cabeza de cartel de la semana: {merchant}, {amount}.',
  'insight.biggestSpend.cheeky.2': '{amount} en {merchant}. Un capricho, por lo visto.',
  'insight.biggestSpend.roast.1': '{amount} en {merchant}. El protagonista de la semana.',
  'insight.biggestSpend.roast.2':
    '{merchant} se llevó {amount} esta semana. ¿Mereció la pena? No contestes. El plan lo cubre.',
  'insight.biggestSpend.plain': 'Mayor gasto de la semana: {amount} en {merchant}.',

  'insight.underStreak.soft.1': '{days} días seguidos por debajo del límite. Qué constancia.',
  'insight.underStreak.soft.2': '{days} días tranquilos, uno detrás de otro.',
  'insight.underStreak.cheeky.1': '{days} días por debajo del límite. Era de rachas.',
  'insight.underStreak.cheeky.2': '{days} días seguidos por debajo. No lo gafes.',
  'insight.underStreak.roast.1':
    '{days} días por debajo del límite. Tenía chistes preparados. Desperdiciados.',
  'insight.underStreak.roast.2': '{days} días seguidos. Me estoy quedando sin chistes.',
  'insight.underStreak.plain': '{days} días cerrados seguidos en el límite o por debajo.',

  'insight.closeStreak.soft.1': '{days} días cerrados seguidos. Eso es el ritual.',
  'insight.closeStreak.soft.2': 'Una racha de {days} cierres. Gracias por venir cada tarde.',
  'insight.closeStreak.cheeky.1': '{days} cierres seguidos. Hábito desbloqueado.',
  'insight.closeStreak.cheeky.2': 'Racha: {days}. Esta noche, uno más.',
  'insight.closeStreak.roast.1': '{days} días seguidos. La racha te sienta bien; no la rompas.',
  'insight.closeStreak.roast.2': '{days} cierres seguidos. No la rompas ahora.',
  'insight.closeStreak.plain': '{days} días cerrados seguidos.',

  'insight.weekSpare.soft.1': {
    one: 'Esta semana sobraron {spare}. Pasan a los próximos días.',
    other: '{count} días por debajo del límite esta semana: {spare} pasan a los próximos.',
  },
  'insight.weekSpare.soft.2': {
    one: '{spare} de sobra esta semana, para los días que vienen.',
    other: '{spare} de sobra esta semana, para los días que vienen.',
  },
  'insight.weekSpare.cheeky.1': {
    one: 'Sobran {spare} esta semana. Los próximos días te dan las gracias.',
    other: 'Sobran {spare} de {count} días buenos. Los próximos días te dan las gracias.',
  },
  'insight.weekSpare.cheeky.2': {
    one: 'La semana va {spare} por delante. Fino.',
    other: 'La semana va {spare} por delante. Fino.',
  },
  'insight.weekSpare.roast.1': {
    one: '{spare} de sobra. No te lo gastes todo de golpe.',
    other: '{count} días por debajo, {spare} de sobra. No te lo gastes todo de golpe.',
  },
  'insight.weekSpare.roast.2': {
    one: 'La semana va {spare} arriba. Te lo concedo.',
    other: 'La semana va {spare} arriba. Te lo concedo.',
  },
  'insight.weekSpare.plain': {
    one: 'Los días cerrados de esta semana dejaron {spare} de sobra.',
    other: 'Los días cerrados de esta semana dejaron {spare} de sobra.',
  },

  'insight.weekOver.soft.1':
    'Esta semana te pasaste {over}. Los próximos días serán algo más pequeños, y está bien.',
  'insight.weekOver.soft.2': '{over} de más esta semana. Ya lo iremos equilibrando.',
  'insight.weekOver.cheeky.1': 'La semana va {over} por encima. El resto del mes se ajusta.',
  'insight.weekOver.cheeky.2': '{over} de más de momento. Giro de guion, no el final.',
  'insight.weekOver.roast.1':
    'Esta semana: {over} de más. Con una semana más tranquila, el mes lo aguanta.',
  'insight.weekOver.roast.2': '{over} de más. Una semana para olvidar, un mes para arreglarlo.',
  'insight.weekOver.plain': 'Los días cerrados de esta semana superaron el límite en {over}.',

  'insight.potMilestone.soft.1': 'La hucha {pot} ya pasa del {percent}%. Mira cómo crece.',
  'insight.potMilestone.soft.2': 'Llevas el {percent}% del camino hacia la hucha {pot}.',
  'insight.potMilestone.cheeky.1': 'Hucha {pot}: al {percent}%. Esto va en serio.',
  'insight.potMilestone.cheeky.2': '{percent}% de la hucha {pot}, hecho. Sigue alimentándola.',
  'insight.potMilestone.roast.1': 'La hucha {pot}, al {percent}%. Va ganando. Déjala.',
  'insight.potMilestone.roast.2': '{percent}% hacia la hucha {pot}. Ni se te ocurra asaltarla.',
  'insight.potMilestone.plain': 'La hucha {pot} ya pasa del {percent}% de su objetivo.',

  'insight.potFull.soft.1': 'La hucha {pot} está llena. Lo has conseguido tú.',
  'insight.potFull.soft.2': 'Hucha {pot}: completa. Disfrútala de verdad.',
  'insight.potFull.cheeky.1': '¡La hucha {pot} está llena! Confeti, pero bajito.',
  'insight.potFull.cheeky.2': 'La hucha {pot}, llena hasta arriba.',
  'insight.potFull.roast.1':
    'La hucha {pot} está llena. Tenía un chiste preparado; no ha hecho falta.',
  'insight.potFull.roast.2': 'Hucha llena: {pot}. Ahora gástala en aquello para lo que era.',
  'insight.potFull.plain': 'La hucha {pot} ha alcanzado su objetivo.',

  'insight.workToClaim.soft.1': {
    one: 'Un gasto de trabajo ({amount}) por reclamar.',
    other: '{count} gastos de trabajo ({amount}) por reclamar.',
  },
  'insight.workToClaim.soft.2': {
    one: '{amount} de trabajo esperan a que los reclames.',
    other: '{amount} de trabajo, {count} gastos, esperan a que los reclames.',
  },
  'insight.workToClaim.cheeky.1': {
    one: 'El trabajo te debe {amount}.',
    other: 'El trabajo te debe {amount}. {count} tickets, nada menos.',
  },
  'insight.workToClaim.cheeky.2': {
    one: '{amount} en gastos de trabajo. Ve a por ellos.',
    other: '{count} gastos de trabajo, {amount}. Ve a por ellos.',
  },
  'insight.workToClaim.roast.1': {
    one: 'Tu empresa te debe {amount}. Sin vergüenza.',
    other: 'Tu empresa te debe {amount}. {count} veces. Sin vergüenza.',
  },
  'insight.workToClaim.roast.2': {
    one: 'Estás financiando a tu empresa con {amount}. Reclámalo.',
    other: 'Estás financiando a tu empresa con {amount}. Reclámalo.',
  },
  'insight.workToClaim.plain': {
    one: 'Un gasto de trabajo ({amount}) espera su reembolso.',
    other: '{count} gastos de trabajo ({amount}) esperan su reembolso.',
  },
};
