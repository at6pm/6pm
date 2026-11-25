---
title: Datenschutzerklärung
description: Was 6pm auf deinem Handy behält, das Wenige, das es verlässt, und wer damit umgeht.
lede: 6pm behält dein Geld auf deinem Handy. Diese Seite sagt genau, was wir mit dem Wenigen tun, das es verlässt.
updated: '2026-11-25'
---

Diese Seite ist eine Übersetzung, die wir dir zur Erleichterung anbieten. Bei Abweichungen gilt die [englische Fassung](/privacy).

## Kurz gesagt

- Deine Ausgaben, dein Plan und dein Tagebuch liegen auf deinem iPhone, in einer verschlüsselten Datenbank. Wir können sie nicht lesen.
- 6pm braucht kein Konto. Nur wenn du „Gemeinsam budgetieren“ nutzt, meldest du dich an, und zwar mit Apple. Wir fragen nie nach deiner Telefonnummer, deiner E-Mail-Adresse oder deinem Bank-Login.
- Wir schalten keine Werbung und verkaufen keine Daten. Die App enthält keine Tracking-Tools und keine Analyse-Tools von Drittanbietern. Sie sendet anonyme Zählungen der Schritte, die sie erreicht, etwa das erste Öffnen oder den ersten Tagesabschluss; das kannst du ausschalten. Diese Website zählt Besuche mit Cloudflare Web Analytics, das keine Cookies setzt und dich nicht identifiziert.
- Ein paar kleine Dinge verlassen dein Handy doch: eine anonyme Geräte-ID, anonyme Zählungen der Schritte, die die App erreicht, dein Kaufstatus, App-Updates, Absturzberichte, Fragen, die du 6pm stellst, deine Stimme, während du eine Ausgabe sagst, ein paar Fakten zu deinem Tag für die Sprüche deines Begleiters, ein Belegfoto, das dein Handy nicht lesen kann, Wortlaut und Beträge der Bankmitteilungen, die 6pm für dich liest (mit verborgenen Konto-, Karten- und Telefonnummern), Bank-E-Mails, die du an deine Beleg-Adresse weiterleitest, die gemeinsamen Spargläser, die du mit jemandem in „Gemeinsam budgetieren“ führst, und, nur wenn du es einschaltest, dein verschlüsseltes Backup. Jedes davon wird unten erklärt.
- Du kannst die ganze KI von 6pm stattdessen auf deinem iPhone lassen (Einstellungen → KI). Dann bleiben auch deine Fragen, die Fakten für die Sprüche deines Begleiters, Belegfotos, Bankmitteilungen und deine Stimme auf dem Handy.

## Wer wir sind

6pm wird von {{OWNER}} („wir“, „uns“) entwickelt. Du erreichst uns unter [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}).

Diese Erklärung gilt für die 6pm-App für iPhone und Android und für die Website at6pm.app. Wo die Android-App anders funktioniert, steht unten unter „Unter Android“, wie.

## Was auf deinem Handy bleibt

Alles, was du eingibst, und alles, was die App für dich erwischt, bleibt auf deinem Handy. Das heißt: deine Ausgaben, Beträge, Händler, Kategorien und Notizen, dein Zahltag und dein Plan, deine Spargläser, dein Tagebuch und deine Einstellungen, dein Look und dein Begleiter.

All das liegt in einer Datenbank auf deinem Handy, verschlüsselt mit SQLCipher. Der Schlüssel wird beim ersten Öffnen von 6pm auf deinem Handy erzeugt und im iOS-Schlüsselbund aufbewahrt, an dieses Gerät gebunden. Er verlässt das Handy nie, und weder er noch die Datenbank erreichen uns jemals. Gesendet werden nur die wenigen Fakten, die unter „Frag 6pm und die Sprüche deines Begleiters“ beschrieben sind, jeweils nur so viel, wie ein Spruch braucht.

Weil der Schlüssel auf diesem Handy bleibt, ziehen deine Daten nicht von selbst auf ein neues Handy um. Ohne Backup gibt es sie nur hier.

## Was dein Handy verlässt

Nur die Dinge unten, und nur aus den genannten Gründen.

### Eine anonyme Geräte-ID

Wenn die App mit unserem Server spricht, holt sie sich zuerst ein zufälliges Token, das für deine Kopie der App steht. Das Token bleibt auf deinem Handy. Unser Server speichert davon nur eine unkenntlich gemachte Form (einen SHA-256-Hash), dazu die Sprache deiner App und wann es zum ersten und zum letzten Mal gesehen wurde.

Nichts davon ist mit deinem Namen, deiner E-Mail-Adresse oder irgendetwas aus deinen Finanzen verknüpft. Wir nutzen es, um zu prüfen, dass Anfragen von einer echten Kopie der App kommen, um Missbrauch einzudämmen und um ungefähr zu zählen, wie viele Geräte 6pm jeden Tag nutzen.

### Anonyme Zählungen

Um zu sehen, wo neue Leute hängen bleiben, sendet die App unserem Server anonyme Zählungen der Schritte, die sie erreicht: dass sie zum ersten Mal geöffnet wurde; welche Schritte der Einrichtung gezeigt wurden und ob die Einrichtung abgeschlossen wurde; an welchen Tagen ihres ersten Monats sie geöffnet wurde; an welchem dieser Tage etwas erwischt wurde, und auf welchem Weg (eine Mitteilung einer Bank oder eines E-Wallets, die Wallet-Automation, eine E-Mail, ein geteilter Beleg, ein Scan, deine Stimme oder Tippen); welche dieser Tage abgeschlossen wurden und an wie vielen Tagen der ersten Woche etwas erwischt und abgeschlossen wurde; ob das Angebot für 6pm Max gezeigt wurde und von welcher Seite aus; ob Max gekauft wurde und welcher Plan; und, wenn Max mit einem Code aus einem unserer Kanäle gekauft wurde, welcher Kanal. Jede Meldung nennt außerdem die Plattform (iPhone oder Android), die App-Version und die App-Sprache, sonst nichts.

Die Zählungen enthalten keine Geräte-ID, keine Installations-ID, kein Konto, keinen Betrag, keinen Händler, keinen Banknamen, keine Notiz und kein Wort, das du getippt hast, und sie werden ohne die oben genannte anonyme Geräte-ID gesendet. Unser Server zählt nur eins zur Summe für diesen Schritt an diesem Tag dazu; er führt keine Aufzeichnung pro Handy, sodass sich die Zählungen eines Handys nicht wieder zusammensetzen lassen. Dein Handy merkt sich, welche Schritte es schon gesendet hat, sodass jeder nur einmal gesendet wird. Wie bei jeder Anfrage zählt unser Server Anfragen pro IP-Adresse nur, um Missbrauch zu bremsen, und speichert die Adresse nicht.

Du kannst die Zählungen unter Einstellungen → Datenschutz → Anonyme Zählungen ausschalten. Schritte, die erreicht werden, während sie aus sind, werden nie gesendet, auch nicht, wenn du sie wieder einschaltest. Im Gerätemodus sind sie aus.

### Käufe

Apple, unter Android Google Play, nimmt die Zahlung entgegen. Wir sehen nie deine Karte oder deine Zahlungsdaten.

Damit 6pm weiß, was du freigeschaltet hast, nutzt es RevenueCat, einen Dienst, der den Kaufstatus festhält. RevenueCat erfährt von Apple oder Google, welche Looks und Pläne du gekauft hast, wann, und ob eine Testphase oder ein Abo aktiv ist. Es verknüpft das mit einer anonymen App-Nutzer-ID, nicht mit deinem Namen oder deiner E-Mail-Adresse. Wie die meisten Kauf-Tools erhält es außerdem grundlegende technische Angaben von deinem Handy: App-Version, Gerätemodell und Systemversion, Land und Sprache sowie deine IP-Adresse.

So bleiben Max und deine Looks freigeschaltet, und so funktioniert „Käufe wiederherstellen“.

### App-Updates

Manche Korrekturen schicken wir drahtlos an die App, über den Update-Dienst von Expo. Dein Handy fragt bei Expo nach, ob ein Update bereitliegt. Diese Anfrage enthält die App-Version, die Plattform und deine IP-Adresse. Sie enthält nichts aus deinen Finanzen.

### Absturzberichte

Wenn die App abstürzt oder auf einen Fehler stößt, sendet sie einen Bericht an Sentry, damit wir ihn beheben können: was im Code schiefging, auf welcher Seite es passierte, die App-Version, das iPhone-Modell und die iOS-Version sowie eine zufällige Installations-ID. Berichte enthalten nie deine Ausgaben, Beträge, Notizen, deinen Plan oder Namen, und wir hängen deine IP-Adresse nicht an. Im Gerätemodus werden keine Absturzberichte gesendet.

### Frag 6pm und die Sprüche deines Begleiters, Zahlungsempfänger benennen und Belegfotos lesen

Wenn du 6pm eine Frage stellst, etwa „Kann ich mir Samstag 250 € leisten?“, sendet die App den Wortlaut der Frage an unseren Server, zusammen mit den Namen deiner Kategorien und Spargläser, damit die Frage gut verstanden wird. Unser Server fragt Anthropic, einen KI-Dienst, was die Frage wissen will. Die Antwort selbst wird auf deinem Handy berechnet, aus deinen eigenen Einträgen, die nie gesendet werden.

Um die Sprüche deines Begleiters und den Wortlaut einer Antwort zu schreiben, sendet die App unserem Server, und weiter an Anthropic, die wenigen Fakten, um die es in diesem einen Spruch geht, bereits auf deinem Handy berechnet: zum Beispiel einen Betrag, einen Ort, den Namen einer Kategorie oder eines Sparglases oder wie diese Woche im Vergleich zur letzten aussieht. Sie sendet nie deine Liste von Ausgaben, deinen Plan oder deinen Kontostand. Ohne Verbindung nutzt die App Sprüche, die in sie eingebaut sind.

Wenn du einen Screenshot eines Belegs mit 6pm teilst, wird der Text darauf auf deinem Handy gelesen. Kann die App nicht erkennen, an wen du gezahlt hast, und kennt keine deiner eigenen Regeln den Namen, sendet sie die Zeilen des Belegs an unseren Server, und weiter an Anthropic, um den Zahlungsempfänger zu benennen. Vorher wird jede Zahl entfernt, sodass Beträge, Kontonummern und Referenzcodes nie gesendet werden. Kommt trotzdem etwas mit einer Ziffer an, weist der Server es ungelesen ab.

Eine Mitteilung einer Bank oder eines E-Wallets, die 6pm für dich liest (siehe „Mitteilungen von Bank und E-Wallet“ unten), wird zweimal gelesen. Dein Handy liest sie zuerst, sofort. Wenn du 6pm das nächste Mal öffnest, wird der Text der Mitteilung an unseren Server gesendet, und weiter an Anthropic, um ein zweites Mal gelesen zu werden: ob Geld geflossen ist und in welche Richtung, welcher der genannten Beträge es war, wer bezahlt wurde und in welche deiner Kategorien es gehört. Gesendet werden der Name der Bank- oder E-Wallet-App, der Wortlaut der Mitteilung, die Beträge, die sie nennt (darunter ihr Kontostand, wenn sie einen nennt), die Währung, in der du zählst, und die Namen deiner Kategorien. Der Wortlaut kann einen Namen oder den Verwendungszweck einer Überweisung enthalten. Bevor etwas gesendet wird, verbirgt dein Handy lange Zahlen Ziffer für Ziffer: jede Zahl mit neun oder mehr Ziffern, ob am Stück oder in Gruppen geschrieben, Kartennummern und die Zahl nach einem Wort wie „TK“, „Konto“ oder „Karte“. Konto-, Karten- und Telefonnummern bleiben deshalb auf deinem Handy, und unser Server weist einen Text ab, der noch eine lange Zahl enthält. Die Antwort enthält nie einen Betrag: Dein Handy markiert jeden Betrag im Text, die Antwort nennt eine der Markierungen, und gespeichert wird der Betrag, den dein Handy an dieser Stelle gelesen hat. Eine Mitteilung, die dein Handy gar nicht lesen konnte, die aber eine Zahl nennt, wartet höchstens zwei Tage auf deinem Handy, um auf dieselbe Weise gelesen zu werden, und wird dann gelöscht. Das gilt auch für eine, die dein Handy gelesen hat, wenn das zweite Lesen beim ersten Mal keine Antwort bekam (keine Verbindung oder unser Server zu langsam): Ihr Text wartet auf deinem Handy, höchstens zwei Tage, bis der Server geantwortet hat, und wird dann gelöscht. Eine Mitteilung, die dein Handy als Einmalcode, als Anmelde- oder Sicherheitshinweis, als fehlgeschlagene Zahlung, als Werbung oder als Kontostandsmeldung erkennt, wird nie gesendet. Ohne Verbindung bleibt es beim Lesen durch das Handy.

Wenn dein Handy sich bei Summe oder Währung eines geteilten Belegs nicht sicher ist, sendet es dieses eine Belegfoto an unseren Server, und weiter an Anthropic, einen KI-Dienst, um Summe, Währung, Geschäft und Uhrzeit zu lesen. Unser Server speichert oder protokolliert das Foto nicht, und es wird an niemanden sonst gesendet. Anthropic nutzt es nicht zum Training seiner Modelle und löscht es innerhalb von 30 Tagen (länger nur, wenn es wegen eines Verstoßes gegen die Nutzungsrichtlinie von Anthropic markiert wird oder das Gesetz es verlangt). Ohne Verbindung behält die App, was dein Handy gelesen hat.

Wenn du eine Kategorie anlegst, kann die App ihren Namen an unseren Server senden, und weiter an Anthropic, um ein Symbol dafür vorzuschlagen.

Wir speichern deine Fragen, Belegzeilen, Mitteilungstexte oder Belegfotos nicht. Für jede Anfrage hält unser Server nur fest, wie viel vom KI-Dienst sie genutzt hat, zu deiner anonymen Geräte-ID. Anthropic nutzt Anfragen nicht zum Training seiner Modelle und löscht sie innerhalb von 30 Tagen (länger nur, wenn eine wegen eines Verstoßes gegen die Nutzungsrichtlinie von Anthropic markiert wird oder das Gesetz es verlangt).

### Deine Stimme

Wenn du eine Ausgabe laut sagst, streamt die App den Ton von deinem Mikrofon direkt an einen Sprache-zu-Text-Dienst, Deepgram (oder ElevenLabs), nur solange du das Mikrofon hältst oder antippst, und bekommt die Wörter zurück. Unser Server gibt deinem Handy dafür nur einen kurzlebigen Schlüssel und hält fest, dass eine Transkription stattgefunden hat, zu deiner anonymen Geräte-ID. Er hört nie den Ton und sieht nie die Wörter. Bei Deepgram nehmen wir nicht an dessen Programm zur Modellverbesserung teil, sodass der Ton nur so lange aufbewahrt wird, wie er in Text umgewandelt wird. Auf deinem Handy wird nichts aufgezeichnet. Ohne Verbindung, im Gerätemodus oder nach 10 Transkriptionen am Tag ohne 6pm Max wandelt stattdessen die Spracherkennung von Apple deine Wörter auf deinem Handy in Text um, und nichts wird gesendet.

### Gerätemodus

Unter Einstellungen → KI kannst du die KI von 6pm auf deinem iPhone lassen. Dann verlässt nichts aus „Frag 6pm und die Sprüche deines Begleiters“ oder „Deine Stimme“ das Gerät: Fragen werden auf deinem Handy verstanden, Sprüche geschrieben und Belege gelesen, mit einem Modell, das du einmal lädst. Das Modell wird von Hugging Face geladen, das deine IP-Adresse sieht und welches Modell du angefordert hast, sonst nichts. In diesem Modus sind die Beleg-E-Mail, Absturzberichte und anonyme Zählungen aus, und der Reisemodus erkennt dein Land an der Zeitzone deines Handys statt an deinem Standort.

### Beleg-E-Mail

6pm gibt deinem Handy eine eigene Adresse, etwa k7m2qx@at6pm.app. Wenn deine Bank dir an diese Adresse schreibt oder du ihre E-Mails dorthin weiterleitest, landen die Zahlungen in deinem Eingang.

Unser Server liest jede E-Mail, sobald sie ankommt. Eine E-Mail, die einen Betrag nennt, wird an Anthropic gesendet, einen KI-Dienst, um eine Zahlung von einer Überweisung zwischen deinen eigenen Konten, einer Rückerstattung oder Werbung zu unterscheiden und um zu lesen, an wen du gezahlt hast, wofür und wie viel; eine E-Mail ohne Betrag wird ungelesen verworfen. Enthält die E-Mail eine Zahlung, behält der Server nur, was gelesen wurde: den Betrag und seine Währung, den Händler, die Kategorie, die Uhrzeit, die Absenderadresse und den Verwendungszweck. Das schließt er verschlüsselt weg, bis dein Handy es abholt, und löscht es dann. Die E-Mail selbst wird von 6pm nie gespeichert oder protokolliert und an niemanden außer Anthropic gesendet, das sie nicht zum Training seiner Modelle nutzt und innerhalb von 30 Tagen löscht (länger nur, wenn sie wegen eines Verstoßes gegen die Nutzungsrichtlinie von Anthropic markiert wird oder das Gesetz es verlangt). Alles, was kein Beleg ist, wird verworfen. Ein Beleg, den dein Handy nach 30 Tagen nicht abgeholt hat, wird ungelesen gelöscht.

Die Adresse ist mit deiner anonymen Geräte-ID verknüpft, nicht mit deinem Namen. E-Mails an sie werden gleich gelesen, egal wer sie schickt, gib sie also nur deiner Bank.

### Wechselkurse (Reisemodus)

Im Reisemodus holt die App die Wechselkurse des Tages von unserem Server. Unser Server bekommt sie von Frankfurter, einem kostenlosen Dienst, der Kurse von Zentralbanken veröffentlicht. Die Anfrage enthält nichts über dich oder dein Geld.

### Verschlüsseltes Backup (6pm Max)

Das Backup ist eine Funktion von 6pm Max, und es ist aus, bis du es einschaltest. Es ist Ende-zu-Ende-verschlüsselt: Der Schlüssel bleibt in deinem iCloud-Schlüsselbund, und unser Server speichert nur Chiffretext unter einem anonymen Token. Chiffretext sind verschlüsselte Daten, die wir nicht lesen können.

Apple synchronisiert den Schlüssel über den iCloud-Schlüsselbund zwischen deinen Geräten, unter deiner Apple-ID und zu den Bedingungen von Apple. Verlierst du sowohl den Schlüssel als auch dein Handy, kann niemand das Backup entsperren, auch wir nicht.

### Gemeinsam budgetieren

Mit „Gemeinsam budgetieren“ können zwei Menschen gemeinsame Spargläser führen, in die beide einzahlen. Es ist der einzige Teil von 6pm mit Anmeldung, und nichts davon passiert, solange du es nicht startest oder eine Einladung öffnest.

- **Mit Apple anmelden.** Wenn du startest oder beitrittst, meldest du dich mit Apple an. Apple gibt uns eine feste ID für dich, die nur mit 6pm funktioniert, und beim ersten Mal deinen Vornamen, wenn du ihn teilen möchtest. Wir fragen nie nach deiner E-Mail-Adresse. Unser Server verknüpft diese ID mit deiner anonymen Geräte-ID. Wenn du dein Konto löschst, bittet unser Server außerdem Apple, den Zugriff von 6pm zu beenden, sodass 6pm aus der Liste „Mit Apple anmelden“ in den Einstellungen deiner Apple-ID verschwindet.
- **Was geteilt wird.** Unser Server speichert deinen Vornamen, für jedes gemeinsame Sparglas Name, Symbol, Farbe, Ziel und Monat sowie jeden Betrag, den einer von euch als eingezahlt angibt, jeweils mit der Angabe, wer ihn eingetragen hat und wann. Dein Partner sieht all das, und du siehst seine Angaben. Sonst wird nichts von deinem Handy geteilt: nicht deine Ausgaben, dein Plan, deine Tageszahl oder deine eigenen Spargläser.
- **Einladungen.** Ein Einladungslink funktioniert einmal und 7 Tage lang. Unser Server speichert davon nur eine unkenntlich gemachte Form.
- **Austreten.** Jeder von euch kann jederzeit austreten. Das beendet „Gemeinsam budgetieren“ für euch beide und löscht die gemeinsamen Spargläser mit allem darin von unserem Server. Jedes Handy behält als Verlauf die Beträge, die seine eigene Person eingezahlt hat.
- **Dein Konto löschen.** „Konto für „Gemeinsam budgetieren“ löschen“ in der App löscht deine Anmeldung, deinen Namen und alles, was du teilst, von unserem Server und beendet es auch für deinen Partner. Dasselbe passiert, wenn du in den Einstellungen deiner Apple-ID die Nutzung deiner Apple-ID durch 6pm beendest.

6pm bewegt nie Geld. Die Beträge in gemeinsamen Spargläsern sind das, was ihr jeweils als beiseitegelegt angebt; sie werden nur gezählt.

### Die Warteliste (Website)

Wenn du dich auf dieser Website in die Warteliste einträgst, speichern wir deine E-Mail-Adresse, die Sprache der Seite, wann du dich eingetragen hast, und deinen Platz in der Reihe. Hast du vor dem Eintragen den Leck-Rechner genutzt, speichern wir auch den Monatsbetrag, den er gezeigt hat. Der Rechner selbst läuft in deinem Browser, und nichts wird gesendet, solange du dich nicht einträgst.

Wir nutzen das nur, um dir zu sagen, wann 6pm 2.0 erscheint. Es wird aufbewahrt, bis du uns bittest, es zu entfernen.

### Besuch der Website

Diese Website setzt keine Cookies. Sie zählt Besuche mit Cloudflare Web Analytics, das uns nur Summen liefert, etwa Seitenaufrufe, die Seite oder den Link, von dem du kamst, dein Land und deine Geräteart. Es nutzt weder Cookies noch lokalen Speicher, verfolgt dich nicht über Websites hinweg und identifiziert dich nicht. Die Schriften kommen von der Website selbst. Die Website läuft bei Cloudflare, das jede Anfrage verarbeitet und übliche technische Protokolle führen kann, etwa mit deiner IP-Adresse und deinem Browsertyp, um den Dienst zu betreiben und zu schützen. Um Missbrauch zu bremsen, zählt unser Server Anfragen pro IP-Adresse. Die Adresse dient nur als Zählschlüssel. Wir speichern sie nicht.

## Was die App auf deinem Handy nutzt

- **Kamera.** Scannen nutzt die Kamera, um QR-Codes zu lesen, etwa VietQR. Das Bild wird nie gespeichert oder gesendet. Genutzt werden nur die Zahlungsdaten im Code, auf deinem Handy. Wenn du die Kamera ablehnst, funktioniert alles andere trotzdem.
- **Mikrofon und Sprache.** Wenn du eine Ausgabe laut sagst, geht der Ton an einen Sprache-zu-Text-Dienst, wie unter „Deine Stimme“ beschrieben, oder wird von der Spracherkennung von Apple auf deinem Handy in Text umgewandelt. Die Aufnahme wird nie gespeichert.
- **Fotos.** 6pm speichert Bilder, die du teilen möchtest, etwa die Karte deines Tages, in deiner Fotomediathek. Es liest deine Mediathek nie. Beleg-Screenshots, die du mit 6pm teilst, werden auf deinem Handy gelesen und dann verworfen; nur einer, den dein Handy nicht lesen kann, wird zum Lesen gesendet, wie oben beschrieben.
- **Standort.** Erst wenn du den Reisemodus einschaltest, und nur solange die App geöffnet ist, prüft 6pm, in welchem Land du bist, damit es die Währung wechseln kann. Das System deines Handys macht aus der Position einen Länder- und Städtenamen. 6pm behält Land und Stadt auf deinem Handy und sendet uns nichts darüber, wo du bist. Im Gerätemodus nutzt 6pm deinen Standort gar nicht: Dein Land ergibt sich aus der Zeitzone deines Handys.
- **Widgets, Live-Aktivitäten und Siri.** Deine Widgets, Live-Aktivitäten, Kurzbefehle und Steuerelemente lesen und schreiben über einen gemeinsamen Ordner auf deinem Handy. Nichts davon läuft über unseren Server.
- **Zwischenablage.** Wenn du eine Zahlung an deine Banking-App übergibst, kopiert 6pm den Betrag, damit du ihn einfügen kannst. 6pm schreibt in die Zwischenablage. Es liest nie, was darin steht.
- **Banking-Apps.** Die App prüft auf deinem Handy, ob bestimmte Banking-Apps installiert sind, und öffnet die, die du wählst, oder ihre Seite im App Store. Wir senden nichts an die Bank. Sobald du in ihrer App bist, gilt die Datenschutzerklärung deiner Bank.
- **Mitteilungen von Bank und E-Wallet.** Nur wenn du es einrichtest, liest 6pm die Mitteilungen, die deine Bank- und E-Wallet-Apps senden, wenn Geld fließt, um die Zahlung für dich einzutragen. Auf dem iPhone gibt eine Kurzbefehle-Automation, die du anlegst, 6pm jede Mitteilung der Apps weiter, die du auswählst. Unter Android liest 6pm sie erst, nachdem du es unter „Benachrichtigungszugriff“ eingeschaltet hast, und nur die von Bank- und E-Wallet-Apps, die 6pm kennt; die Mitteilungen aller anderen Apps werden ungelesen verworfen. So oder so wird jede auf deinem Handy gelesen. Geld, das geflossen ist, wird in deinem Eingang gespeichert, auf deinem Handy; Codes, fehlgeschlagene Zahlungen, Werbung und Kontostandsmeldungen werden übersprungen und nirgends aufbewahrt. Eine Mitteilung, die das Handy nicht lesen kann, die aber eine Zahl nennt, wartet höchstens zwei Tage auf deinem Handy auf das als Nächstes beschriebene zweite Lesen. Das gilt auch für eine, die das Handy gelesen hat, wenn dieses zweite Lesen beim ersten Mal keine Antwort bekam. Wenn die KI von 6pm nicht auf deinem Handy bleibt, liest unser Server eine Mitteilung über Geld dann ein zweites Mal: Ihr Wortlaut und ihre Beträge werden gesendet, Konto-, Karten- und Telefonnummern vorher verborgen, wie unter „Frag 6pm und die Sprüche deines Begleiters, Zahlungsempfänger benennen und Belegfotos lesen“ beschrieben. Sonst wird nichts aus einer Mitteilung an uns oder an jemand anderen gesendet, und wenn die KI von 6pm auf deinem Handy bleibt, gar nichts. Unter Android zeigt 6pm danach eine eigene, stille Mitteilung, die sagt, was es erwischt hat. Du kannst das jederzeit ausschalten: auf dem iPhone, indem du die Automation löschst, unter Android unter „Benachrichtigungszugriff“.
- **Mitteilungen.** Die tägliche Erinnerung zu deiner Abschlusszeit wird auf deinem Handy eingestellt. Es gibt keine Push-Mitteilungen aus der Ferne, und kein Mitteilungs-Token wird an uns gesendet.

## Unter Android

Die Android-App funktioniert wie oben beschrieben, mit diesen Unterschieden:

- **Der Schlüssel deiner Daten** wird vom Android Keystore auf deinem Handy geschützt statt vom iOS-Schlüsselbund. Das Cloud-Backup von Apps, das Android selbst anbietet, ist für 6pm ausgeschaltet, sodass deine Daten nie in dein Google-Konto kopiert werden.
- **Das Backup** behält seinen Schlüssel auf deinem Handy, nicht im iCloud-Schlüsselbund, sodass sich ein Backup nur auf dem Handy öffnen lässt, das es erstellt hat.
- **Käufe** laufen über Google Play. Google nimmt die Zahlung entgegen, und RevenueCat erfährt deinen Kaufstatus von Google.
- **Den Gerätemodus** gibt es nicht: 6pm hat kein Modell, das auf einem Android-Handy läuft.
- **Spracherkennung auf deinem Handy**, wenn der Sprache-zu-Text-Dienst nicht genutzt wird (offline oder nach 10 am Tag ohne 6pm Max), ist die Spracherkennung von Android auf dem Gerät, und nur für eine Sprache, die schon auf dein Handy geladen ist, sodass der Ton es nie verlässt.
- **Fotos.** Scannen wählt ein Bild über die Fotoauswahl von Android, die 6pm nur das Bild übergibt, das du auswählst. 6pm liest deine Galerie nie.
- **„Gemeinsam budgetieren“**, Widgets, Live-Aktivitäten und Siri gibt es in der Android-App nicht.

## Was wir nicht tun

- Wir zeigen keine Werbung.
- Wir verkaufen deine Daten nicht und geben sie nicht für Marketing weiter.
- Wir erstellen kein Profil von dir.
- Diese Version der App enthält keine Analyse-, Werbe- oder Tracking-Tools von Drittanbietern.

Wenn du in den iOS-Einstellungen Analysedaten mit App-Entwicklern teilst, kann Apple uns anonyme Absturz- und Nutzungsdaten geben. Wir können nicht erkennen, von wem sie stammen.

## Wer Daten für uns verarbeitet

Diese Unternehmen betreiben die oben beschriebenen Teile des Dienstes. Sie können deine Daten in anderen Ländern verarbeiten, darunter in den USA und in China.

- **Apple** verarbeitet Zahlungen, den iCloud-Schlüsselbund und „Mit Apple anmelden“. [Datenschutzrichtlinie von Apple](https://www.apple.com/legal/privacy/).
- **Google** verarbeitet Zahlungen über Google Play unter Android. [Datenschutzerklärung von Google](https://policies.google.com/privacy).
- **RevenueCat** hält den Kaufstatus fest. [Datenschutzerklärung von RevenueCat](https://www.revenuecat.com/privacy).
- **Cloudflare** hostet unsere Website und unseren Server und zählt Besuche der Website. [Datenschutzerklärung von Cloudflare](https://www.cloudflare.com/privacypolicy/).
- **Sentry** empfängt Absturzberichte. [Datenschutzerklärung von Sentry](https://sentry.io/privacy/).
- **Anthropic** liest die Fragen, die du stellst, schreibt die Sprüche deines Begleiters aus den oben beschriebenen Fakten zu deinem Tag, schlägt anhand ihrer Namen Symbole für deine Kategorien vor, benennt Zahlungsempfänger aus Belegzeilen ohne Zahlen, liest die oben beschriebenen Mitteilungen von Bank und E-Wallet ein zweites Mal, liest ein Belegfoto, das dein Handy nicht lesen kann, und liest die E-Mails von Banken und Geschäften, die du an deine Beleg-Adresse weiterleitest. [Datenschutzerklärung von Anthropic](https://www.anthropic.com/legal/privacy).
- **Deepgram** wandelt deine Stimme in Text um, wenn du eine Ausgabe sagst. [Datenschutzerklärung von Deepgram](https://deepgram.com/privacy).
- **ElevenLabs** kann dasselbe anstelle von Deepgram tun. [Datenschutzerklärung von ElevenLabs](https://elevenlabs.io/privacy-policy).
- **Hugging Face** hostet die Modelle, die du für den Gerätemodus laden kannst. [Datenschutzerklärung von Hugging Face](https://huggingface.co/privacy).
- **Expo** liefert drahtlose App-Updates aus. [Datenschutzerklärung von Expo](https://expo.dev/privacy).

Wir nutzen sie nur für diese Zwecke.

## Wie lange wir Dinge aufbewahren

- **Auf deinem Handy.** Bis du sie löschst. „Alle Daten löschen“ in den Einstellungen löscht deine Ausgaben, deinen Plan und dein Tagebuch vom Handy und schaltet die Erinnerung aus. Wenn du die App löschst, werden die Daten ebenfalls entfernt.
- **Geräte-ID.** So lange, wie die App auf diesem Gerät genutzt wird.
- **Anonyme Zählungen.** Als Tagessummen aufbewahrt. Sie enthalten nichts, was auf ein Handy oder eine Person hinweist.
- **Absturzberichte.** Bis zu 90 Tage, dann gelöscht.
- **Beleg-E-Mail.** Bis dein Handy den Beleg abholt, und nie länger als 30 Tage. Deine Beleg-Adresse besteht so lange wie deine Geräte-ID.
- **Fragen, Fakten für Sprüche, Belegzeilen und weitergeleitete E-Mails.** Wir bewahren sie nicht auf. Anthropic löscht sie innerhalb von 30 Tagen, wie oben beschrieben.
- **Belegfotos.** Wir bewahren sie nicht auf. Anthropic löscht sie innerhalb von 30 Tagen, wie oben beschrieben.
- **Deine Stimme.** Wir bewahren sie nicht auf. Deepgram verarbeitet sie nur, während du sprichst; ElevenLabs bewahrt sie so auf, wie seine eigene Richtlinie es sagt.
- **Backup.** Bis du es löschst. Dann löschen wir die verschlüsselten Daten von unserem Server.
- **Gemeinsam budgetieren.** Gemeinsame Spargläser, bis einer von euch austritt; deine Anmeldung und deinen Namen, bis du dein Konto für „Gemeinsam budgetieren“ löschst. Beides löscht die Daten sofort von unserem Server.
- **Warteliste.** Bis du uns bittest, deine E-Mail-Adresse zu entfernen.
- **Kaufdaten.** Apple, Google und RevenueCat bewahren sie nach ihren eigenen Richtlinien und dem Gesetz auf.

## Deine Wahlmöglichkeiten und Rechte

Die Daten auf deinem Handy hast du selbst in der Hand: Du kannst alles davon in der App ändern oder löschen.

Zu allem, was wir über dich gespeichert haben, kannst du von uns verlangen, dir zu sagen, was es ist, es zu berichtigen, es zu löschen oder es nicht mehr zu nutzen. Melde dich unter [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}). Wir antworten zügig und innerhalb der Frist, die uns das Gesetz gibt. Unser Server enthält sehr wenig, was auf eine Person hinweist, deshalb bitten wir dich vielleicht um etwas, das uns hilft, es zu finden, etwa die E-Mail-Adresse, die du für die Warteliste verwendet hast.

Du kannst dich auch bei der Datenschutzaufsichtsbehörde beschweren, die für deinen Wohnort zuständig ist.

## Kinder

6pm ist nicht für Kinder unter 16 Jahren gemacht, und wir erheben wissentlich keine Daten von ihnen. Wenn du glaubst, dass ein Kind uns etwas geschickt hat, schreib uns, und wir löschen es.

## Sicherheit

Deine Daten sind auf deinem Handy verschlüsselt. Die Verbindung zu unserem Server nutzt HTTPS. Backups werden verschlüsselt, bevor sie dein Handy verlassen, und Belege aus deiner E-Mail bleiben verschlüsselt, bis dein Handy sie abholt. Unser Server speichert Geräte-Tokens nur als Hash. Kein System ist vollkommen sicher; wenn du ein Problem findest, sag uns bitte Bescheid.

## Änderungen dieser Erklärung

Wenn wir diese Erklärung ändern, aktualisieren wir das Datum oben. Ist die Änderung wichtig, sagen wir es dir in der App oder auf dieser Seite, bevor sie gilt.

## Das Recht und wie du uns erreichst

Wir verarbeiten personenbezogene Daten nach vietnamesischem Recht, einschließlich des Gesetzes zum Schutz personenbezogener Daten. Wenn du woanders lebst, gelten die Rechte, die dir dein eigenes Land gibt, weiterhin.

Fragen? Ruf {{OWNER}} unter [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}) an oder schreib eine Nachricht.
