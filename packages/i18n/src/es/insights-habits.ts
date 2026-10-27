import type { Entry } from '../catalogue-types';
import type { enInsightsHabits } from '../en-insights-habits';

// Same voice as the other insights: "tú", warm and short. Roast teases the purchase or the
// pattern, never the person, and avoids gendered adjectives about the user.
export const esInsightsHabits: { readonly [Key in keyof typeof enInsightsHabits]: Entry } = {
  'insight.noSpendDay.soft.1': 'Un día que no costó nada: los {kept} siguen en su sitio.',
  'insight.noSpendDay.soft.2': 'Un día sin gastos. {kept} guardados, en silencio. Qué bonito.',
  'insight.noSpendDay.cheeky.1': 'Cero gastado, {kept} intactos. La cartera se tomó el día libre.',
  'insight.noSpendDay.cheeky.2': 'Un día entero sin gastar. {kept} te dan las gracias.',
  'insight.noSpendDay.roast.1': 'Nada gastado, {kept} intactos. ¿Quién eres y puedes quedarte?',
  'insight.noSpendDay.roast.2': 'Ni un solo gasto, {kept} guardados. Las tiendas sobrevivirán.',
  'insight.noSpendDay.plain':
    'El último día cerrado no tuvo gastos; se guardaron {kept} de su límite.',

  'insight.noSpendStreak.soft.1': '{days} días tranquilos seguidos: {kept} sin tocar.',
  'insight.noSpendStreak.soft.2': '{days} días sin un gasto. {kept} siguen contigo.',
  'insight.noSpendStreak.cheeky.1': '{days} días, cero gastos. La cartera empieza a sospechar.',
  'insight.noSpendStreak.cheeky.2': '{days} días seguidos sin gastar. {kept} están de vacaciones.',
  'insight.noSpendStreak.roast.1':
    '{days} días, ni un gasto. Tu cafetería de siempre está preocupada.',
  'insight.noSpendStreak.roast.2':
    '{days} días sin gastar, {kept} intactos. Tranquilidad, que no se note.',
  'insight.noSpendStreak.plain': '{days} días cerrados seguidos sin gastos; {kept} guardados.',

  'insight.backUnder.soft.1':
    'De vuelta bajo el límite tras un día de más: {spare} de sobra. Bien hecho.',
  'insight.backUnder.soft.2':
    'Un día de más y luego uno por debajo, con {spare} de sobra. Ese es el ritmo.',
  'insight.backUnder.cheeky.1': 'Arco de redención: de vuelta por debajo, {spare} de sobra.',
  'insight.backUnder.cheeky.2':
    'Un día por encima, el siguiente por debajo con {spare}. Equilibrio.',
  'insight.backUnder.roast.1':
    '{spare} por debajo, justo después de un día de más. Disculpas aceptadas.',
  'insight.backUnder.roast.2':
    'De vuelta por debajo con {spare} de sobra. La remontada que esperábamos.',
  'insight.backUnder.plain':
    'De vuelta bajo el límite tras un día por encima, con {spare} de sobra.',

  'insight.logGap.soft.1': 'Nada apuntado desde {since}. ¿Racha tranquila o muy ajetreada?',
  'insight.logGap.soft.2': 'Llevas {days} días sin apuntar un gasto. ¿Algo que añadir?',
  'insight.logGap.cheeky.1': 'Nada apuntado desde {since}. ¿Modo monje o mucho lío?',
  'insight.logGap.cheeky.2': '{days} días sin apuntar nada. ¿La cartera se fue de vacaciones?',
  'insight.logGap.roast.1': 'Nada desde {since}. ¿De verdad nada, o es que no lo apuntaste?',
  'insight.logGap.roast.2': '{days} días de silencio. Hasta un café cuenta; apúntalo y en paz.',
  'insight.logGap.plain': 'No hay gastos apuntados desde {since}.',

  'insight.weekendHeavy.soft.1':
    'Últimamente un día de fin de semana sale por unos {weekend}, y uno entre semana por {weekday}. Piénsalo antes del sábado.',
  'insight.weekendHeavy.soft.2':
    'Los fines de semana van a {weekend} al día; entre semana, a {weekday}. Con calma.',
  'insight.weekendHeavy.cheeky.1':
    'Entre semana: {weekday} al día. Fin de semana: {weekend}. El sábado tiene planes para ti.',
  'insight.weekendHeavy.cheeky.2':
    'Un día de finde sale de media a {weekend}; uno entre semana, a {weekday}. Llega el finde. ¿Todo a punto?',
  'insight.weekendHeavy.roast.1':
    '{weekday} entre semana, {weekend} en fin de semana. El finde sigue ganando; ¿firmamos tablas?',
  'insight.weekendHeavy.roast.2':
    'Fines de semana: {weekend} al día. Entre semana: {weekday}. ¿Revancha este finde?',
  'insight.weekendHeavy.plain':
    'En las últimas cuatro semanas: {weekend} por día de fin de semana, {weekday} por día laborable.',

  'insight.recordDay.soft.1':
    '{amount} hoy, el día más grande en {days} días. No pasa nada; mañana se empieza de cero.',
  'insight.recordDay.soft.2':
    'Los {amount} de hoy son lo máximo en {days} días. El plan se adapta.',
  'insight.recordDay.cheeky.1':
    '{amount} hoy. Nuevo récord, pero no del que queríamos. Mañana, de cero.',
  'insight.recordDay.cheeky.2':
    'Nuevo récord: {amount}, lo máximo en {days} días. Mejor no ir a por el segundo.',
  'insight.recordDay.roast.1':
    '{amount} hoy, lo máximo en {days} días. Qué atrevimiento. Mañana, un bis más pequeño.',
  'insight.recordDay.roast.2': '{amount} en un día, récord de {days} días. Enmárcalo y descansa.',
  'insight.recordDay.plain':
    'Los {amount} de hoy son el mayor gasto en un día de los últimos {days} días.',

  'insight.likelySubscription.soft.1':
    '{merchant} te ha cobrado unos {amount} cada mes. ¿Lo hacemos factura?',
  'insight.likelySubscription.soft.2':
    '{amount} para {merchant}, {months} meses seguidos. ¿Lo quieres como factura?',
  'insight.likelySubscription.cheeky.1':
    '{merchant} otra vez, {amount}, como un reloj. Te hemos visto, suscripción. ¿La hacemos factura?',
  'insight.likelySubscription.cheeky.2':
    '{months} meses de {merchant} a {amount}. ¿Aún lo usas? Añádelo como factura.',
  'insight.likelySubscription.roast.1':
    '{merchant}: {amount}, {months} meses seguidos. ¿Lo usas o solo lo pagas?',
  'insight.likelySubscription.roast.2':
    '{amount} para {merchant} cada mes. ¿Te lo quedas? Hazlo factura. Si no, cancélalo.',
  'insight.likelySubscription.plain':
    '{merchant} ha cobrado unos {amount} al mes durante {months} meses. Podría ser una factura.',

  'insight.lateNight.soft.1': '{amount} de madrugada en {merchant}. Ojalá te viniera bien.',
  'insight.lateNight.soft.2': '{merchant}, {amount}, ya de noche. Que descanses.',
  'insight.lateNight.cheeky.1':
    '{amount} en {merchant}, muy pasada la hora de dormir. Compras de búho.',
  'insight.lateNight.cheeky.2': '{merchant} de madrugada, {amount}. Un clásico.',
  'insight.lateNight.roast.1':
    '{amount} en {merchant} de madrugada. Las grandes decisiones, mejor con luz de día.',
  'insight.lateNight.roast.2':
    '{merchant} de noche, {amount}. La próxima vez, consúltalo con la almohada.',
  'insight.lateNight.plain': 'Un gasto nocturno: {amount} en {merchant}.',

  'insight.cycleHalfway.soft.1': 'A mitad de ciclo: {percent}% usado, quedan {left}.',
  'insight.cycleHalfway.soft.2':
    'Medio ciclo ya, y aún tienes {left} libres. Llevas la cuenta, que es lo difícil.',
  'insight.cycleHalfway.cheeky.1': 'Descanso. Marcador: {percent}% usado, {left} para jugar.',
  'insight.cycleHalfway.cheeky.2': 'A mitad de camino. {left} para la segunda parte.',
  'insight.cycleHalfway.roast.1':
    'Descanso: {percent}% usado. {left} para la segunda parte; juégala bien.',
  'insight.cycleHalfway.roast.2':
    'Mitad del ciclo, {percent}% gastado, quedan {left}. La segunda parte decide.',
  'insight.cycleHalfway.plain': 'A mitad de ciclo: {percent}% usado, quedan {left}.',

  'insight.firstWeekPaceUp.soft.1':
    'La primera semana usó el {percent}% del ciclo; a ritmo uniforme sería el {even}%. Las próximas semanas lo equilibran.',
  'insight.firstWeekPaceUp.soft.2':
    'Una primera semana movida: el {percent}% del dinero del ciclo. Unos días tranquilos lo recuperan.',
  'insight.firstWeekPaceUp.cheeky.1':
    'Primera semana: {percent}% fuera, frente a un {even}% a ritmo uniforme. Buen arranque. Quizá demasiado.',
  'insight.firstWeekPaceUp.cheeky.2':
    'La semana uno se llevó el {percent}%. Lo uniforme sería el {even}%. Dosifícalo.',
  'insight.firstWeekPaceUp.roast.1':
    'La semana uno se comió el {percent}% del ciclo. Lo uniforme es el {even}%. Las demás semanas quieren hablar contigo.',
  'insight.firstWeekPaceUp.roast.2':
    'El {percent}% en una semana, cuando lo uniforme es el {even}%. Eso fue el sprint; ahora, a trotar.',
  'insight.firstWeekPaceUp.plain':
    'La primera semana usó el {percent}% del dinero del ciclo; a ritmo uniforme sería el {even}%.',

  'insight.firstWeekPaceDown.soft.1':
    'La primera semana solo usó el {percent}% del ciclo; a ritmo uniforme sería el {even}%. Qué buen comienzo.',
  'insight.firstWeekPaceDown.soft.2':
    'Una primera semana suave: {percent}% usado, {compare} que a ritmo uniforme.',
  'insight.firstWeekPaceDown.cheeky.1':
    'Primera semana: solo el {percent}%, por debajo del {even}% uniforme. Arranque fino.',
  'insight.firstWeekPaceDown.cheeky.2':
    'Semana uno: {percent}%. Lo uniforme es el {even}%. Fíjate.',
  'insight.firstWeekPaceDown.roast.1':
    'La semana uno usó el {percent}%, por debajo del {even}% uniforme. Sospechosamente bien. Sigue así.',
  'insight.firstWeekPaceDown.roast.2':
    'El {percent}% en la primera semana, y lo uniforme es el {even}%. Nada que objetar.',
  'insight.firstWeekPaceDown.plain':
    'La primera semana usó el {percent}% del dinero del ciclo; a ritmo uniforme sería el {even}%.',

  'insight.paceSpare.soft.1':
    'A este ritmo, llegas al día de cobro ({payday}) con unos {spare} de sobra.',
  'insight.paceSpare.soft.2': 'Si sigues así, llegas al {payday} con unos {spare}.',
  'insight.paceSpare.cheeky.1':
    'Sobrante previsto el {payday}: {spare}. No te lo gastes en la cabeza.',
  'insight.paceSpare.cheeky.2': 'A este paso, {spare} de sobra para el {payday}. Bien.',
  'insight.paceSpare.roast.1':
    '{spare} de sobra para el {payday} a este ritmo. No lo gastes antes de que exista.',
  'insight.paceSpare.roast.2': 'Previsión: quedan {spare} el {payday}. Que la previsión no mienta.',
  'insight.paceSpare.plain': 'Al ritmo actual, quedan unos {spare} el día de cobro, el {payday}.',

  'insight.paceShort.soft.1':
    'A este ritmo el dinero se aprieta hacia el {runsOut}, antes del día de cobro ({payday}). Unos días más pequeños lo arreglan.',
  'insight.paceShort.soft.2':
    'Un aviso: a este paso se queda corto hacia el {runsOut}. Los días pequeños ayudan, y hay tiempo.',
  'insight.paceShort.cheeky.1':
    'Por esta ruta, el depósito se vacía hacia el {runsOut}; cobras el {payday}. ¿Recalculamos?',
  'insight.paceShort.cheeky.2':
    'A este ritmo, el dinero se agota hacia el {runsOut}. Cobras el {payday}. Días suaves por delante.',
  'insight.paceShort.roast.1':
    'A este ritmo se seca hacia el {runsOut}, y cobras el {payday}. Unos días tranquilos y aterriza.',
  'insight.paceShort.roast.2':
    '{runsOut}: cuando se acaba el dinero a este ritmo. {payday}: día de cobro. Cerremos esa brecha.',
  'insight.paceShort.plain':
    'Al ritmo actual, el dinero se acaba hacia el {runsOut}, antes del día de cobro, el {payday}.',
};
