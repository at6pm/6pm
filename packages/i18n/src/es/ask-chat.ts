import type { Entry } from '../catalogue-types';
import type { enAskChat } from '../en-ask-chat';

// Small talk in the companion's voices, "tú" throughout; the serious topics (distress, investing,
// unsafe requests) are plain and keep the Vietnamese hotline and emergency numbers as they are.
export const esAskChat: { readonly [Key in keyof typeof enAskChat]: Entry } = {
  'ask.chat.greeting.soft': '¡Hola! Aquí estoy cuando quieras echar un ojo a tu dinero.',
  'ask.chat.greeting.cheeky': 'Hola, hola. Pregúntame lo que quieras de dinero, tengo tus números.',
  'ask.chat.greeting.roast': 'Ah, eres tú. ¿Vienes a preguntar cómo de mal va?',
  'ask.chat.greeting.plain': 'Hola. Pregúntame por tus gastos, facturas o huchas.',
  'ask.chat.thanks.soft': 'Cuando quieras. Cuídate hoy.',
  'ask.chat.thanks.cheeky': '¡Cuando quieras! Acepto pagos en días cerrados a tiempo.',
  'ask.chat.thanks.roast': 'No me des las gracias. Dáselas al presupuesto que casi cumpliste.',
  'ask.chat.thanks.plain': 'De nada.',
  'ask.chat.offTopic.soft': 'Eso se sale de lo mío. Pero ¿cosas de dinero? Soy todo oídos.',
  'ask.chat.offTopic.cheeky': 'No es mi departamento. Mejor pregúntame adónde fue tu dinero 👀',
  'ask.chat.offTopic.roast': 'Soy un presupuesto, no un buscador. Pregúntame por tus gastos.',
  'ask.chat.offTopic.plain': 'Solo puedo ayudarte con tu dinero en 6pm.',
  'ask.chat.identity':
    'Soy tu compañero en 6pm. Cada número que te doy se calcula en tu teléfono, a partir de tus propios gastos. Soy un programa, no una persona.',
  'ask.chat.privacy':
    'No puedo ver tu cuenta del banco. Solo sé lo que hay en 6pm, y eso se queda en tu teléfono. Para leer una pregunta, nuestro servidor ve la pregunta y los nombres de tus categorías y huchas; para redactar una frase, solo los pocos datos que lleva.',
  'ask.chat.venting.soft': 'Suena a mucho peso. No tienes por qué llevarlo sin ayuda.',
  'ask.chat.venting.cheeky': 'Día duro. Respira: es un número, no un veredicto.',
  'ask.chat.venting.plain': 'El estrés por el dinero es real.',
  'ask.chat.goingRight': 'Algo que va bien:',
  'ask.chat.freshStart': 'Mañana empieza con un límite nuevo.',
  'ask.chat.roast.soft': 'Una suavecita, entonces:',
  'ask.chat.roast.cheeky': 'Vale, tú lo has pedido.',
  'ask.chat.roast.roast': 'Agárrate.',
  'ask.chat.roast.plain': 'Lo que más destaca:',
  'ask.chat.roastNothing.soft': 'No hay nada que pinchar. Lo estás haciendo bien.',
  'ask.chat.roastNothing.cheeky': 'He mirado. ¿Sinceramente? Nada que criticar. Qué rabia.',
  'ask.chat.roastNothing.roast': 'Quería ponerte a caldo. No me has dado nada. Qué descaro.',
  'ask.chat.roastNothing.plain': 'Ahora mismo no destaca nada.',
  'ask.chat.hype.soft': 'Mereces oír esto:',
  'ask.chat.hype.cheeky': 'Modo fan activado:',
  'ask.chat.hype.roast': 'Vale. Al césar lo que es del césar:',
  'ask.chat.hype.plain': 'Algo que va bien:',
  'ask.chat.hypeNothing.soft': 'Has venido a mirar. Eso cuenta.',
  'ask.chat.hypeNothing.cheeky': 'Has abierto una app de presupuesto a propósito. Leyenda.',
  'ask.chat.hypeNothing.roast': 'Estás aquí, que ya es más que la mayoría. Casi me enorgullece.',
  'ask.chat.hypeNothing.plain': 'Sigue así. Todo suma.',
  'ask.chat.distress':
    'Siento mucho que te sientas así. No tienes que cargar con esto en soledad: habla con alguien de confianza o llama a la línea de ayuda Ngày Mai al 096 306 1414 (de 13:00 a 20:30, de miércoles a domingo). Si estás en peligro ahora mismo, llama al 115.',
  'ask.chat.investing':
    'No puedo decirte en qué invertir ni cuándo; para eso hace falta un asesor autorizado. Puedo enseñarte cuánto te sobra cada mes o lo rápido que se llena una hucha.',
  'ask.chat.unsafe':
    'Con eso no te voy a ayudar. Si el dinero va justo, puedo enseñarte lo que queda hasta el día de cobro o lo que podrían cubrir tus huchas. Si un prestamista ilegal te está amenazando, llama a la policía al 113.',
};
