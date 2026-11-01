import type { Entry } from '../catalogue-types';
import type { enWidgetsGuide } from '../en-widgets-guide';

// Steps use the names the iPhone shows in Spanish (Editar, Añadir widget, Personalizar, Botón de
// acción, Actividades en vivo). Siri's phrase is the Spanish App Shortcut phrase.
export const esWidgetsGuide: { readonly [Key in keyof typeof enWidgetsGuide]: Entry } = {
  'widgetsGuide.title': 'Widgets y controles',
  'widgetsGuide.headline': '6pm, a un vistazo o a un toque.',
  'widgetsGuide.lede':
    'Ten el número de hoy donde ya miras, y abre Escanear QR o Añadir rápido sin buscar la app.',
  'widgetsGuide.lookMax': 'Con tu estilo.',
  'widgetsGuide.lookFree': 'Gratis, en Hora dorada. Con Max llevan tu estilo.',
  'widgetsGuide.howToAdd': 'Cómo añadirlo',
  'widgetsGuide.whenItShows': 'Cuándo aparece',

  'widgetsGuide.home.title': 'Widgets de la pantalla de inicio',
  'widgetsGuide.home.what': 'Lo que puedes gastar hoy, de un vistazo. Toca uno para abrir 6pm.',
  'widgetsGuide.home.small': 'Pequeño',
  'widgetsGuide.home.medium': 'Mediano',
  'widgetsGuide.home.large': 'Grande',
  'widgetsGuide.home.smallWhat': 'Lo que puedes gastar hoy.',
  'widgetsGuide.home.mediumWhat': 'El número, con Escanear QR y Añadir rápido al lado.',
  'widgetsGuide.home.largeWhat': 'Lo que te queda y los últimos gastos de hoy.',
  'widgetsGuide.home.step1':
    'Mantén pulsado un espacio vacío de tu pantalla de inicio hasta que las apps se muevan.',
  'widgetsGuide.home.step2': 'Toca Editar en la esquina superior y luego Añadir widget.',
  'widgetsGuide.home.step3': 'Busca 6pm, desliza hasta el tamaño que quieras y toca Añadir widget.',

  'widgetsGuide.lock.title': 'Widgets de la pantalla de bloqueo',
  'widgetsGuide.lock.what': 'Mira lo que te queda hoy sin desbloquear el teléfono.',
  'widgetsGuide.lock.ring': 'Anillo',
  'widgetsGuide.lock.card': 'Tarjeta',
  'widgetsGuide.lock.step1': 'Mantén pulsada la pantalla de bloqueo y toca Personalizar.',
  'widgetsGuide.lock.step2': 'Elige Pantalla de bloqueo y toca el espacio bajo el reloj.',
  'widgetsGuide.lock.step3': 'Toca 6pm y elige el anillo o la tarjeta.',

  'widgetsGuide.control.title': 'Centro de control',
  'widgetsGuide.control.what':
    'Desliza hacia abajo, toca una vez y ya estás en Escanear QR o Añadir rápido.',
  'widgetsGuide.control.needs': 'iOS 18 o posterior',
  'widgetsGuide.control.step1': 'Desliza hacia abajo desde la esquina superior derecha.',
  'widgetsGuide.control.step2': 'Mantén pulsado un espacio vacío y toca Añadir un control.',
  'widgetsGuide.control.step3': 'Busca 6pm y elige Escanear QR o Añadir rápido.',
  'widgetsGuide.control.note':
    'Esos dos también pueden ocupar el sitio de la linterna o la cámara abajo en tu pantalla de bloqueo.',

  'widgetsGuide.action.title': 'Botón de acción',
  'widgetsGuide.action.what': 'Mantén pulsado el botón lateral para abrir Escanear QR.',
  'widgetsGuide.action.needs': 'iPhone 15 Pro o posterior',
  'widgetsGuide.action.step1': 'Abre Ajustes y luego Botón de acción.',
  'widgetsGuide.action.step2': 'Desliza hasta Controles y toca el nombre del control debajo.',
  'widgetsGuide.action.step3': 'Busca 6pm y elige Escanear QR o Añadir rápido.',
  'widgetsGuide.action.note': '¿Prefieres decirlo? Dile a Siri “Apunta en 6pm” y luego el importe.',

  'widgetsGuide.live.title': 'Actividad en vivo',
  'widgetsGuide.live.what': 'Aparece sola mientras espera un pago por QR, y mientras viajas.',
  'widgetsGuide.live.step1':
    'Escanea un QR y paga en la app de tu banco. El pago espera en tu pantalla de bloqueo.',
  'widgetsGuide.live.step2': 'Toca Pagado cuando haya salido el dinero. Se cierra sola.',
  'widgetsGuide.live.step3': '¿No aparece? En Ajustes, abre 6pm y activa Actividades en vivo.',

  'widgetsGuide.home.addSafe': 'Añadir Puedes gastar hoy',
  'widgetsGuide.home.addToday': 'Añadir Hoy',
  'widgetsGuide.tiles.title': 'Recuadros de Ajustes rápidos',
  'widgetsGuide.tiles.what':
    'Desliza hacia abajo, toca una vez y entras en Escanear QR o Añadir rápido.',
  'widgetsGuide.tiles.step1':
    'Desliza dos veces hacia abajo desde la parte superior de la pantalla.',
  'widgetsGuide.tiles.step2': 'Toca el lápiz para editar tus recuadros.',
  'widgetsGuide.tiles.step3':
    'Busca Escanear QR y Añadir rápido de 6pm y arrástralos hacia arriba.',
  'widgetsGuide.tiles.addScan': 'Añadir el recuadro Escanear QR',
  'widgetsGuide.tiles.addQuickAdd': 'Añadir el recuadro Añadir rápido',
  'widgetsGuide.tiles.scanIn': 'Escanear QR ya está en Ajustes rápidos',
  'widgetsGuide.tiles.quickAddIn': 'Añadir rápido ya está en Ajustes rápidos',
};
