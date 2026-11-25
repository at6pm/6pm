---
title: Política de privacidad
description: Qué guarda 6pm en tu teléfono, lo poco que sale de él y quién lo trata.
lede: 6pm guarda tu dinero en tu teléfono. Esta página explica exactamente qué hacemos con lo poco que sale de él.
updated: '2026-11-25'
---

Esta es una traducción para tu comodidad. Si difiere de la [versión en inglés](/privacy), prevalece la versión en inglés.

## En resumen

- Tus gastos, tu plan y tu diario viven en tu iPhone, en una base de datos cifrada. Nosotros no podemos leerlos.
- 6pm no necesita cuenta. Solo inicias sesión, con Apple, si usas Presupuesto en pareja. Nunca te pedimos tu número de teléfono, tu correo ni tus datos de acceso al banco.
- No mostramos anuncios ni vendemos datos. La app no tiene herramientas de seguimiento ni analítica de terceros. Envía recuentos anónimos de los pasos que alcanza, como la primera apertura o el primer cierre, y puedes desactivarlos. Este sitio web cuenta las visitas con Cloudflare Web Analytics, que no instala cookies y no te identifica.
- Algunas cosas pequeñas sí salen de tu teléfono: un identificador de dispositivo anónimo, recuentos anónimos de los pasos que alcanza la app, el estado de tus compras, las actualizaciones de la app, los informes de fallos, las preguntas que le haces a 6pm, tu voz mientras dices un gasto, algunos datos sobre tu día para las frases de tu compañero, la foto de un ticket que tu teléfono no puede leer, las palabras y los importes de los avisos del banco que 6pm lee por ti (con los números de cuenta, tarjeta y teléfono ocultos), los correos del banco que reenvías a tu dirección de recibos, los botes compartidos que llevas con alguien en Presupuesto en pareja y, solo si la activas, tu copia de seguridad cifrada. Cada una se explica más abajo.
- Puedes mantener toda la IA de 6pm en tu iPhone (Ajustes → IA). Así, tus preguntas, los datos para las frases de tu compañero, las fotos de tickets, los avisos del banco y tu voz también se quedan en el teléfono.

## Quiénes somos

6pm lo hace {{OWNER}} («nosotros»). Puedes contactarnos en el [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}).

Esta política cubre la app 6pm para iPhone y Android y el sitio web at6pm.app. Cuando la app de Android funciona de otra manera, el apartado «En Android» explica cómo.

## Lo que se queda en tu teléfono

Todo lo que introduces, y todo lo que la app capta por ti, se queda en tu teléfono. Es decir: tus gastos, importes, comercios, categorías y notas, tu día de cobro y tu plan, tus botes, tu diario, y tus ajustes, tu estilo y tu compañero.

Todo está en una base de datos en tu teléfono, cifrada con SQLCipher. La clave se crea en tu teléfono la primera vez que abres 6pm y se guarda en el llavero de iOS, vinculada a este dispositivo. Nunca sale del teléfono, y nunca recibimos ni la clave ni la base de datos. Solo se envían los pocos datos descritos en «Pregunta a 6pm y las frases de tu compañero», lo justo para una frase cada vez.

Como la clave se queda en este teléfono, tus datos no pasan solos a un teléfono nuevo. Sin una copia de seguridad, solo existen aquí.

## Lo que sale de tu teléfono

Solo lo que aparece a continuación, y solo por los motivos indicados.

### Un identificador de dispositivo anónimo

Cuando la app se comunica con nuestro servidor, primero obtiene un token aleatorio que representa tu copia de la app. El token se guarda en tu teléfono. Nuestro servidor solo almacena una forma codificada de él (un hash SHA-256), además del idioma de tu app y la primera y la última vez que se vio.

Nada de esto está vinculado a tu nombre, tu correo ni a nada de tu dinero. Lo usamos para comprobar que las peticiones vienen de una copia real de la app, para limitar abusos y para contar aproximadamente cuántos dispositivos usan 6pm cada día.

### Recuentos anónimos

Para ver dónde se atasca la gente nueva, la app envía a nuestro servidor recuentos anónimos de los pasos que alcanza: que se abrió por primera vez; qué pasos de la bienvenida se mostraron y si se completó; qué días de su primer mes se abrió; en cuáles de esos días se captó algo, y de qué forma (un aviso del banco o del monedero, la automatización de Cartera, un correo, un ticket compartido, un escaneo, tu voz o el teclado); cuáles de esos días se cerraron, y cuántos días de la primera semana se captaron y se cerraron; si se mostró la oferta de 6pm Max y desde qué pantalla; si se compró Max y qué plan; y, cuando Max se compró con un código de uno de nuestros canales, qué canal. Cada informe indica también la plataforma (iPhone o Android), la versión de la app y su idioma, y nada más.

Los recuentos no llevan identificador de dispositivo, identificador de instalación, cuenta, importe, comercio, nombre de banco, nota ni ninguna palabra que hayas escrito, y se envían sin el identificador de dispositivo anónimo de arriba. Nuestro servidor solo suma uno al total de ese paso y ese día; no guarda ningún registro por teléfono, así que los recuentos de un teléfono no se pueden volver a juntar. Tu teléfono recuerda qué pasos ya ha enviado, así que cada uno se envía una sola vez. Como en toda petición, nuestro servidor cuenta las peticiones por dirección IP solo para frenar abusos, y no guarda la dirección.

Puedes desactivar los recuentos en Ajustes → Privacidad → Recuentos anónimos. Los pasos alcanzados mientras están desactivados no se envían nunca, aunque los vuelvas a activar. En el modo en el dispositivo están desactivados.

### Compras

Apple, o Google Play en Android, cobra el pago. Nunca vemos tu tarjeta ni tus datos de pago.

Para saber qué has desbloqueado, 6pm usa RevenueCat, un servicio que registra el estado de las compras. RevenueCat sabe por Apple o Google qué estilos y planes has comprado, cuándo, y si hay una prueba o una suscripción activa. Lo vincula a un identificador de usuario anónimo de la app, no a tu nombre ni a tu correo. Como la mayoría de las herramientas de compra, también recibe datos técnicos básicos de tu teléfono: versión de la app, modelo de dispositivo y versión del sistema, país e idioma, y tu dirección IP.

Así es como Max y tus estilos siguen desbloqueados, y como funciona «Restaurar compras».

### Actualizaciones de la app

Enviamos algunas correcciones de la app de forma remota (over the air), con el servicio de actualizaciones de Expo. Tu teléfono pregunta a Expo si hay una actualización pendiente. Esa petición incluye la versión de la app, la plataforma y tu dirección IP. No lleva nada de tu dinero.

### Informes de fallos

Cuando la app se cierra inesperadamente o tiene un error, envía un informe a Sentry para que podamos arreglarlo: qué falló en el código, la pantalla en la que ocurrió, la versión de la app, el modelo de iPhone y la versión de iOS, y un identificador de instalación aleatorio. Los informes nunca incluyen tus gastos, importes, notas, plan ni nombres, y no adjuntamos tu dirección IP. En el modo en el dispositivo no se envían informes de fallos.

### Pregunta a 6pm y las frases de tu compañero, poner nombre a un beneficiario y leer la foto de un ticket

Cuando le haces una pregunta a 6pm, como «¿Me puedo gastar 150 € el sábado?», la app envía las palabras de la pregunta a nuestro servidor, con los nombres de tus categorías y botes para que la pregunta se entienda bien. Nuestro servidor le pregunta a Anthropic, un servicio de IA, qué se está preguntando. La respuesta en sí se calcula en tu teléfono, a partir de tus propios registros, que nunca se envían.

Para escribir las frases de tu compañero y las palabras de una respuesta, la app envía a nuestro servidor, y de ahí a Anthropic, los pocos datos de los que trata esa frase, ya calculados en tu teléfono: por ejemplo un importe, un lugar, el nombre de una categoría o de un bote, o cómo va esta semana frente a la anterior. Nunca envía tu lista de gastos, tu plan ni tu saldo. Sin conexión, la app usa frases escritas en ella.

Cuando compartes con 6pm una captura de pantalla de un ticket, el texto se lee en tu teléfono. Si la app no sabe a quién pagaste, y ninguna de tus propias reglas conoce el nombre, envía las líneas del ticket a nuestro servidor, y de ahí a Anthropic, para poner nombre al beneficiario. Antes se quitan todos los números, así que nunca se envían importes, números de cuenta ni códigos de referencia. Si llega algo con un dígito, el servidor lo rechaza sin leerlo.

Un aviso del banco o del monedero que 6pm lee por ti (consulta «Avisos del banco y del monedero» más abajo) se lee dos veces. Tu teléfono lo lee primero, al instante. La próxima vez que abres 6pm, el texto del aviso se envía a nuestro servidor, y de ahí a Anthropic, para leerlo una segunda vez: si se movió dinero y en qué sentido, cuál de los importes impresos era, a quién se pagó y en cuál de tus categorías encaja. Lo que se envía es el nombre de la app del banco o del monedero, las palabras del aviso, los importes que muestra (incluido el saldo, si lo muestra), la moneda en la que cuentas y los nombres de tus categorías. Las palabras pueden contener un nombre o el concepto de una transferencia. Antes de enviar nada, tu teléfono oculta los números largos dígito a dígito: cualquier número de nueve cifras o más, escrito de una vez o en grupos, los números de tarjeta y el número que sigue a una palabra como "TK", "account" o "card". Así, los números de cuenta, de tarjeta y de teléfono se quedan en tu teléfono, y nuestro servidor rechaza un texto que aún contenga un número largo. La respuesta nunca contiene un importe: tu teléfono marca cada importe del texto, la respuesta nombra una de las marcas, y el importe que se guarda es el que tu teléfono leyó ahí. Un aviso que tu teléfono no pudo leer en absoluto, pero que muestra un número, espera en tu teléfono dos días como máximo para leerse de la misma forma, y después se borra. Lo mismo ocurre con uno que tu teléfono sí leyó, cuando su segunda lectura no obtuvo respuesta la primera vez (sin conexión, o nuestro servidor fue demasiado lento): su texto espera en tu teléfono, dos días como máximo, hasta que el servidor responde, y después se borra. Un aviso que tu teléfono reconoce como un código de un solo uso, un aviso de inicio de sesión o de seguridad, un pago fallido, una promoción o un aviso de saldo nunca se envía. Sin conexión, se mantiene la lectura del propio teléfono.

Si tu teléfono no puede estar seguro del total o de la moneda de un ticket compartido, envía esa foto del ticket a nuestro servidor, y de ahí a Anthropic, un servicio de IA, para leer el total, la moneda, la tienda y la hora. Nuestro servidor no guarda ni registra la foto, y no se envía a nadie más. Anthropic no la usa para entrenar sus modelos y la borra en un plazo de 30 días (más tiempo solo si se marca por incumplir la política de uso de Anthropic, o si la ley lo exige). Sin conexión, la app conserva lo que leyó tu teléfono.

Cuando creas una categoría, la app puede enviar su nombre a nuestro servidor, y de ahí a Anthropic, para sugerirle un icono.

No guardamos tus preguntas, las líneas de los tickets, el texto de los avisos ni las fotos de tickets. De cada petición, nuestro servidor solo guarda cuánto se usó el servicio de IA, asociado a tu identificador de dispositivo anónimo. Anthropic no usa las peticiones para entrenar sus modelos y las borra en un plazo de 30 días (más tiempo solo si una se marca por incumplir la política de uso de Anthropic, o si la ley lo exige).

### Tu voz

Cuando dices un gasto en voz alta, la app transmite el sonido de tu micrófono directamente a un servicio de voz a texto, Deepgram (o ElevenLabs), solo mientras mantienes pulsado o tocas el micrófono, y recibe las palabras. Nuestro servidor solo le da a tu teléfono una clave de corta duración para esto y registra que hubo una transcripción, asociada a tu identificador de dispositivo anónimo. Nunca oye el sonido ni ve las palabras. Con Deepgram, nos excluimos de su programa de mejora de modelos, así que el sonido solo se conserva mientras se convierte en texto. No se graba nada en tu teléfono. Sin conexión, en el modo en el dispositivo, o después de 10 transcripciones al día sin 6pm Max, el reconocimiento de voz de Apple convierte tus palabras en texto en tu teléfono, y no se envía nada.

### Modo en el dispositivo

En Ajustes → IA puedes mantener la IA de 6pm en tu iPhone. Así, nada de «Pregunta a 6pm y las frases de tu compañero» ni de «Tu voz» sale de él: las preguntas se leen, las frases se escriben y los tickets se leen en tu teléfono, con un modelo que descargas una vez. El modelo se descarga de Hugging Face, que ve tu dirección IP y qué modelo pediste, y nada más. En este modo, el correo de recibos está desactivado, los informes de fallos y los recuentos anónimos están desactivados, y el Modo viaje saca tu país de la zona horaria del teléfono en lugar de tu ubicación.

### Correo de recibos

6pm le da a tu teléfono su propia dirección, como k7m2qx@at6pm.app. Si haces que tu banco te escriba a esa dirección, o reenvías ahí sus correos, los pagos llegan a tu Bandeja.

Nuestro servidor lee cada correo al llegar. Un correo que muestra un importe se envía a Anthropic, un servicio de IA, para distinguir un pago de una transferencia entre tus propias cuentas, una devolución o una promoción, y para leer a quién pagaste, por qué y cuánto; un correo sin importe se descarta sin leerlo. Si el correo contiene un pago, el servidor solo guarda lo que se leyó: el importe y su moneda, el comercio, la categoría, la hora, la dirección del remitente y el concepto de la transferencia. Lo protege con cifrado hasta que tu teléfono lo recoge, y después lo borra. 6pm nunca guarda ni registra el correo en sí, y no se envía a nadie salvo a Anthropic, que no lo usa para entrenar sus modelos y lo borra en un plazo de 30 días (más tiempo solo si se marca por incumplir la política de uso de Anthropic, o si la ley lo exige). Todo lo que no es un recibo se descarta. Un recibo que tu teléfono no ha recogido tras 30 días se borra sin leerlo.

La dirección está vinculada a tu identificador de dispositivo anónimo, no a tu nombre. El correo que llegue a ella de cualquier persona se lee igual, así que compártela solo con tu banco.

### Tipos de cambio (Modo viaje)

En el Modo viaje, la app obtiene los tipos de cambio del día de nuestro servidor. Nuestro servidor los obtiene de Frankfurter, un servicio gratuito que publica los tipos de los bancos centrales. La petición no lleva nada sobre ti ni sobre tu dinero.

### Copia de seguridad cifrada (6pm Max)

La copia de seguridad es una función de 6pm Max, y está desactivada hasta que la activas. Está cifrada de extremo a extremo: la clave se queda en tu llavero de iCloud, y nuestro servidor solo guarda texto cifrado bajo un token anónimo. El texto cifrado son datos codificados que no podemos leer.

Apple sincroniza la clave entre tus dispositivos a través del llavero de iCloud, con tu Apple ID y según las condiciones de Apple. Si pierdes la clave y el teléfono a la vez, nadie, ni siquiera nosotros, puede abrir la copia.

### Presupuesto en pareja

Presupuesto en pareja permite que dos personas lleven botes compartidos a los que ambas aportan. Es la única parte de 6pm con inicio de sesión, y no ocurre nada a menos que lo empieces tú o abras una invitación.

- **Iniciar sesión con Apple.** Cuando empiezas o te unes, inicias sesión con Apple. Apple nos da un identificador estable para ti que solo funciona con 6pm y, la primera vez, tu nombre de pila si decides compartirlo. Nunca te pedimos el correo. Nuestro servidor vincula ese identificador a tu identificador de dispositivo anónimo. Cuando eliminas tu cuenta, nuestro servidor también le pide a Apple que retire el acceso de 6pm, de modo que 6pm desaparece de la lista de «Iniciar sesión con Apple» en los ajustes de tu Apple ID.
- **Qué se comparte.** Nuestro servidor guarda tu nombre de pila, el nombre, icono, color, objetivo y mes de cada bote compartido, y cada importe que cualquiera de los dos dice haber puesto, con quién lo añadió y cuándo. Tu pareja ve todo esto, y tú ves lo suyo. No se comparte nada más de tu teléfono: ni tus gastos, ni tu plan, ni tu número del día, ni tus propios botes.
- **Invitaciones.** Un enlace de invitación funciona una sola vez y durante 7 días. Nuestro servidor solo guarda una forma codificada de él.
- **Salir.** Cualquiera de los dos puede salir en cualquier momento. Salir pone fin a Presupuesto en pareja para ambos y borra de nuestro servidor los botes compartidos y todo lo que contienen. Cada teléfono conserva, como historial, los importes que puso su propia persona.
- **Eliminar tu cuenta.** «Eliminar cuenta de Presupuesto en pareja» en la app borra de nuestro servidor tu inicio de sesión, tu nombre y todo lo que compartes, y también lo termina para tu pareja. Dejar de usar tu Apple ID con 6pm en los ajustes de tu Apple ID tiene el mismo efecto.

6pm nunca mueve dinero. Los importes de los botes compartidos son lo que cada uno dice haber apartado; solo sirven para llevar la cuenta.

### La lista de lanzamiento (sitio web)

Si te unes a la lista de lanzamiento en este sitio web, guardamos tu dirección de correo, el idioma de la página, la hora en que te uniste y tu puesto en la cola. Si usaste la calculadora de fugas antes de unirte, también guardamos la cifra mensual que mostró. La calculadora en sí funciona en tu navegador, y no se envía nada a menos que te unas.

Lo usamos solo para avisarte cuando salga 6pm 2.0. Se guarda hasta que nos pidas que lo eliminemos.

### Visitar el sitio web

Este sitio web no instala cookies. Cuenta las visitas con Cloudflare Web Analytics, que solo nos da totales, como páginas vistas, la página o el enlace del que vienes, tu país y tu tipo de dispositivo. No usa cookies ni almacenamiento local, y no te sigue entre sitios ni te identifica. Sus tipografías se sirven desde el propio sitio. El sitio funciona en Cloudflare, que gestiona cada petición y puede conservar registros técnicos habituales, como tu dirección IP y tu tipo de navegador, para prestar y proteger el servicio. Para frenar abusos, nuestro servidor cuenta las peticiones por dirección IP. La dirección solo sirve como clave del contador. No la guardamos.

## Lo que la app usa en tu teléfono

- **Cámara.** Escanear usa la cámara para leer códigos QR, como VietQR. La imagen nunca se guarda ni se envía. Solo se usan los datos de pago del código, en tu teléfono. Si no das acceso a la cámara, todo lo demás sigue funcionando.
- **Micrófono y voz.** Cuando dices un gasto en voz alta, el sonido va a un servicio de voz a texto como se describe en «Tu voz», o el reconocimiento de voz de Apple en el dispositivo lo convierte en texto en tu teléfono. La grabación nunca se guarda.
- **Fotos.** 6pm guarda en tu fototeca las imágenes que eliges compartir, como la tarjeta de tu día. Nunca lee tu fototeca. Las capturas de tickets que compartes con 6pm se leen en tu teléfono y luego se descartan; solo se envía a leer la que tu teléfono no puede leer, como se describe arriba.
- **Ubicación.** Solo después de activar el Modo viaje, y solo mientras la app está abierta, 6pm comprueba en qué país estás para poder cambiar de moneda. El propio sistema de tu teléfono convierte la posición en el nombre de un país y una ciudad. 6pm guarda el país y la ciudad en tu teléfono, y no nos envía nada sobre dónde estás. En el modo en el dispositivo, 6pm no usa tu ubicación en absoluto: tu país sale de la zona horaria del teléfono.
- **Widgets, Actividades en vivo y Siri.** Tus widgets, Actividades en vivo, atajos y controles leen y escriben a través de una carpeta compartida en tu teléfono. Nada de ellos pasa por nuestro servidor.
- **Portapapeles.** Cuando pasas un pago a la app de tu banco, 6pm copia el importe para que puedas pegarlo. 6pm escribe en el portapapeles. Nunca lee lo que hay en él.
- **Apps de bancos.** La app comprueba en tu teléfono si hay ciertas apps de bancos instaladas, y abre la que elijas, o su página en el App Store. No enviamos nada al banco. Una vez en su app, se aplica la política de tu banco.
- **Avisos del banco y del monedero.** Solo si lo configuras, 6pm lee los avisos que envían las apps de tu banco y de tu monedero cuando se mueve dinero, para apuntar el pago por ti. En iPhone, una automatización de Atajos que tú creas le pasa a 6pm cada aviso de las apps que elijas. En Android, 6pm solo los lee después de que lo actives en Acceso a notificaciones, y solo los de las apps de bancos y monederos que 6pm conoce; el aviso de cualquier otra app se descarta sin leerlo. En ambos casos, cada aviso se lee en tu teléfono. El dinero que se movió se guarda en tu Bandeja, en tu teléfono; los códigos, los pagos fallidos, las promociones y los avisos de saldo se omiten y no se guardan en ninguna parte. Un aviso que el teléfono no puede leer y que muestra un número espera en tu teléfono, dos días como máximo, para la segunda lectura que se describe a continuación. Lo mismo ocurre con uno que el teléfono sí leyó, cuando esa segunda lectura no obtuvo respuesta la primera vez. Salvo que mantengas la IA de 6pm en tu teléfono, un aviso sobre dinero se lee luego una segunda vez en nuestro servidor: se envían sus palabras e importes, con los números de cuenta, tarjeta y teléfono ocultos antes, como se describe en «Pregunta a 6pm y las frases de tu compañero, poner nombre a un beneficiario y leer la foto de un ticket». No se nos envía nada más de un aviso, ni a nadie más, y con la IA de 6pm en tu teléfono no se envía nada. En Android, 6pm muestra luego un aviso discreto propio que dice qué ha captado. Puedes desactivarlo cuando quieras: en iPhone, borrando la automatización; en Android, en Acceso a notificaciones.
- **Notificaciones.** El recordatorio diario a la hora de tu cierre se programa en tu teléfono. No hay notificaciones push remotas, y no se nos envía ningún token de notificaciones.

## En Android

La app de Android funciona como se describe arriba, con estas diferencias:

- **La clave de tus datos** la protege el Android Keystore de tu teléfono en lugar del llavero de iOS. La copia de seguridad de apps en la nube de Android está desactivada para 6pm, así que tus datos nunca se copian en tu cuenta de Google.
- **La copia de seguridad** guarda su clave en tu teléfono, no en el llavero de iCloud, así que una copia solo se puede abrir en el teléfono que la hizo.
- **Las compras** pasan por Google Play. Google cobra el pago, y RevenueCat conoce el estado de tus compras a través de Google.
- **El modo en el dispositivo** no está disponible: 6pm no tiene un modelo que ejecutar en un teléfono Android.
- **La voz en tu teléfono**, cuando no se usa el servicio de voz a texto (sin conexión, o tras 10 al día sin 6pm Max), usa el reconocimiento de voz de Android en el dispositivo, y solo para un idioma ya descargado en tu teléfono, así que el sonido nunca sale de él.
- **Fotos.** Escanear elige una imagen con el selector de fotos de Android, que solo le da a 6pm la imagen que eliges. 6pm nunca lee tu galería.
- **Presupuesto en pareja**, los widgets, las Actividades en vivo y Siri no están en la app de Android.

## Lo que no hacemos

- No mostramos anuncios.
- No vendemos tus datos ni los compartimos con fines de marketing.
- No creamos perfiles sobre ti.
- Esta versión de la app no tiene herramientas de analítica, publicidad ni seguimiento de terceros.

Si decides compartir análisis con los desarrolladores de apps en los Ajustes de iOS, Apple puede darnos datos anónimos de fallos y de uso. No podemos saber de quién proceden.

## Quién trata datos por nosotros

Estas empresas gestionan las partes del servicio descritas arriba. Pueden tratar tus datos en otros países, incluidos Estados Unidos y China.

- **Apple** procesa los pagos, el llavero de iCloud e Iniciar sesión con Apple. [Política de privacidad de Apple](https://www.apple.com/legal/privacy/).
- **Google** procesa los pagos a través de Google Play en Android. [Política de privacidad de Google](https://policies.google.com/privacy).
- **RevenueCat** registra el estado de las compras. [Política de privacidad de RevenueCat](https://www.revenuecat.com/privacy).
- **Cloudflare** aloja nuestro sitio web y nuestro servidor, y cuenta las visitas al sitio web. [Política de privacidad de Cloudflare](https://www.cloudflare.com/privacypolicy/).
- **Sentry** recibe los informes de fallos. [Política de privacidad de Sentry](https://sentry.io/privacy/).
- **Anthropic** lee las preguntas que haces, escribe las frases de tu compañero a partir de los datos sobre tu día descritos arriba, sugiere iconos para tus categorías a partir de sus nombres, pone nombre a los beneficiarios a partir de líneas de tickets sin números, lee una segunda vez los avisos del banco y del monedero descritos arriba, lee la foto de un ticket que tu teléfono no puede leer, y lee los correos de bancos y tiendas que reenvías a tu dirección de recibos. [Política de privacidad de Anthropic](https://www.anthropic.com/legal/privacy).
- **Deepgram** convierte tu voz en texto cuando dices un gasto. [Política de privacidad de Deepgram](https://deepgram.com/privacy).
- **ElevenLabs** puede hacer lo mismo en lugar de Deepgram. [Política de privacidad de ElevenLabs](https://elevenlabs.io/privacy-policy).
- **Hugging Face** aloja los modelos que puedes descargar para el modo en el dispositivo. [Política de privacidad de Hugging Face](https://huggingface.co/privacy).
- **Expo** distribuye las actualizaciones remotas de la app. [Política de privacidad de Expo](https://expo.dev/privacy).

Solo las usamos para estos fines.

## Cuánto tiempo guardamos las cosas

- **En tu teléfono.** Hasta que lo borres. «Borrar todos los datos» en Ajustes borra del teléfono tus gastos, tu plan y tu diario, y desactiva el recordatorio. Borrar la app también elimina los datos.
- **Identificador de dispositivo.** Mientras se use la app en ese dispositivo.
- **Recuentos anónimos.** Se guardan como totales diarios. No contienen nada que lleve a un teléfono o a una persona.
- **Informes de fallos.** Hasta 90 días, y después se borran.
- **Correo de recibos.** Hasta que tu teléfono recoge el recibo, y nunca más de 30 días. Tu dirección de recibos dura lo mismo que tu identificador de dispositivo.
- **Preguntas, datos para las frases, líneas de tickets y correos reenviados.** No los guardamos. Anthropic los borra en un plazo de 30 días, como se describe arriba.
- **Fotos de tickets.** No las guardamos. Anthropic las borra en un plazo de 30 días, como se describe arriba.
- **Tu voz.** No la guardamos. Deepgram solo la trata mientras hablas; ElevenLabs la conserva según indica su propia política.
- **Copia de seguridad.** Hasta que la borres. Cuando lo haces, borramos los datos cifrados de nuestro servidor.
- **Presupuesto en pareja.** Los botes compartidos, hasta que uno de los dos salga; tu inicio de sesión y tu nombre, hasta que elimines tu cuenta de Presupuesto en pareja. Cualquiera de las dos cosas borra los datos de nuestro servidor al momento.
- **Lista de lanzamiento.** Hasta que nos pidas que eliminemos tu correo.
- **Registros de compras.** Apple, Google y RevenueCat los conservan según sus propias políticas y la ley.

## Tus opciones y derechos

Tú controlas los datos de tu teléfono: puedes cambiar o borrar cualquiera de ellos en la app.

Sobre cualquier dato que tengamos de ti, puedes pedirnos que te digamos cuál es, que lo corrijamos, que lo borremos o que dejemos de usarlo. Contáctanos en el [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}). Responderemos con rapidez, y dentro del plazo que nos da la ley. Nuestro servidor guarda muy poco que lleve a una persona, así que puede que te pidamos algo que nos ayude a encontrarlo, como el correo que usaste para la lista de lanzamiento.

También puedes presentar una reclamación ante la autoridad de protección de datos del lugar donde vives.

## Menores

6pm no está pensado para menores de 16 años, y no recogemos sus datos a sabiendas. Si crees que un menor nos ha enviado algo, escríbenos y lo borraremos.

## Seguridad

Tus datos están cifrados en tu teléfono. El tráfico hacia nuestro servidor usa HTTPS. Las copias de seguridad se cifran antes de salir de tu teléfono, y los recibos de tu correo se guardan cifrados hasta que tu teléfono los recoge. Nuestro servidor solo guarda los tokens de dispositivo en forma de hash. Ningún sistema es perfectamente seguro, así que si encuentras un problema, avísanos.

## Cambios en esta política

Cuando cambiemos esta política, actualizaremos la fecha de arriba. Si el cambio es importante, te avisaremos en la app o en esta página antes de que entre en vigor.

## La ley y cómo contactarnos

Tratamos los datos personales conforme a la legislación de Vietnam, incluida la Ley de Protección de Datos Personales. Si vives en otro lugar, siguen aplicándose los derechos que te reconoce tu propio país.

¿Tienes preguntas? Llama o escribe a {{OWNER}} al [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}).
