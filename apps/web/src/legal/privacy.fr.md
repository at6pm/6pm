---
title: Politique de confidentialité
description: Ce que 6pm garde sur ton téléphone, le peu qui en sort, et qui le traite.
lede: 6pm garde ton argent sur ton téléphone. Cette page dit exactement ce que nous faisons du peu qui en sort.
updated: '2026-11-25'
---

Cette page est une traduction fournie pour plus de commodité. En cas de différence, la [version anglaise](/privacy) fait foi.

## L’essentiel

- Tes dépenses, ton plan et ton journal sont sur ton iPhone, dans une base de données chiffrée. Nous ne pouvons pas les lire.
- 6pm n’a pas besoin de compte. Tu ne te connectes, avec Apple, que si tu utilises Budget à deux. Nous ne te demandons jamais ton numéro de téléphone, ton e-mail ou tes identifiants bancaires.
- Nous ne diffusons pas de publicité et ne vendons pas de données. L’app ne contient aucun outil de suivi ni aucun outil d’analyse tiers. Elle envoie des comptages anonymes des étapes qu’elle atteint, comme une première ouverture ou une première clôture, que tu peux désactiver. Ce site compte les visites avec Cloudflare Web Analytics, qui ne dépose aucun cookie et ne t’identifie pas.
- Quelques petites choses quittent bien ton téléphone : un identifiant d’appareil anonyme, des comptages anonymes des étapes atteintes par l’app, l’état de tes achats, les mises à jour de l’app, les rapports de plantage, les questions que tu poses à 6pm, ta voix pendant que tu dictes une dépense, quelques éléments sur ta journée pour les phrases de ton compagnon, une photo de ticket que ton téléphone n’arrive pas à lire, les mots et les montants des alertes bancaires que 6pm lit pour toi (numéros de compte, de carte et de téléphone masqués), les e-mails bancaires que tu transfères à ton adresse de tickets, les bocaux communs que tu tiens avec quelqu’un dans Budget à deux et, seulement si tu l’actives, ta sauvegarde chiffrée. Chacune est expliquée ci-dessous.
- Tu peux aussi garder toute l’IA de 6pm sur ton iPhone (Réglages → IA). Tes questions, les éléments pour les phrases de ton compagnon, les photos de tickets, les alertes bancaires et ta voix restent alors eux aussi sur le téléphone.

## Qui nous sommes

6pm est conçu par {{OWNER}} (« nous »). Tu peux nous joindre au [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}).

Cette politique couvre l’app 6pm pour iPhone et Android et le site at6pm.app. Là où l’app Android fonctionne autrement, la section « Sur Android » ci-dessous l’explique.

## Ce qui reste sur ton téléphone

Tout ce que tu saisis, et tout ce que l’app repère pour toi, reste sur ton téléphone. Cela comprend tes dépenses, montants, marchands, catégories et notes, ton jour de paie et ton plan, tes bocaux, ton journal, ainsi que tes réglages, ton look et ton compagnon.

Tout cela se trouve dans une base de données sur ton téléphone, chiffrée avec SQLCipher. La clé est créée sur ton téléphone la première fois que tu ouvres 6pm et elle est conservée dans le trousseau iOS, liée à cet appareil. Elle ne quitte jamais le téléphone, et nous ne recevons jamais ni elle ni la base de données. Seuls les quelques éléments décrits dans « Demande à 6pm et les phrases de ton compagnon » sont envoyés, une phrase à la fois.

Comme la clé reste sur ce téléphone, tes données ne passent pas toutes seules sur un nouveau téléphone. Sans sauvegarde, elles n’existent qu’ici.

## Ce qui quitte ton téléphone

Uniquement ce qui suit, et uniquement pour les raisons indiquées.

### Un identifiant d’appareil anonyme

Quand l’app communique avec notre serveur, elle obtient d’abord un jeton aléatoire qui représente ton exemplaire de l’app. Le jeton est conservé sur ton téléphone. Notre serveur n’en stocke qu’une forme brouillée (une empreinte SHA-256), avec la langue de ton app et les dates de première et de dernière connexion.

Rien de tout cela n’est lié à ton nom, à ton e-mail ni à quoi que ce soit concernant ton argent. Nous nous en servons pour vérifier que les requêtes viennent d’un vrai exemplaire de l’app, pour limiter les abus et pour compter approximativement combien d’appareils utilisent 6pm chaque jour.

### Comptages anonymes

Pour voir où les nouveaux utilisateurs bloquent, l’app envoie à notre serveur des comptages anonymes des étapes qu’elle atteint : qu’elle a été ouverte pour la première fois ; quelles étapes de la prise en main ont été affichées et si la prise en main a été terminée ; quels jours de son premier mois elle a été ouverte ; lesquels de ces jours quelque chose a été repéré, et de quelle façon (une notification de banque ou de portefeuille, l’automatisation Cartes, un e-mail, un ticket partagé, un scan, ta voix ou la saisie) ; lesquels de ces jours ont été clôturés, et combien de jours de la première semaine ont eu quelque chose de repéré et de clôturé ; si l’offre 6pm Max a été affichée et depuis quel écran ; si Max a été acheté et quelle formule ; et, quand Max a été acheté avec un code de l’un de nos canaux, quel canal. Chaque envoi indique aussi la plateforme (iPhone ou Android), la version et la langue de l’app, et rien d’autre.

Les comptages ne contiennent aucun identifiant d’appareil, identifiant d’installation, compte, montant, marchand, nom de banque, note ni aucun mot que tu as saisi, et ils sont envoyés sans l’identifiant d’appareil anonyme décrit plus haut. Notre serveur se contente d’ajouter un au total de cette étape pour ce jour ; il ne garde aucun historique par téléphone, si bien que les comptages d’un même téléphone ne peuvent pas être rassemblés. Ton téléphone retient les étapes déjà envoyées, donc chacune n’est envoyée qu’une fois. Comme pour toute requête, notre serveur compte les requêtes par adresse IP uniquement pour freiner les abus, et ne stocke pas l’adresse.

Tu peux désactiver les comptages dans Réglages → Confidentialité → Comptages anonymes. Les étapes atteintes pendant qu’ils sont désactivés ne sont jamais envoyées, même si tu les réactives. En mode sur l’appareil, ils sont désactivés.

### Achats

Apple, ou Google Play sur Android, encaisse le paiement. Nous ne voyons jamais ta carte ni tes informations de paiement.

Pour savoir ce que tu as débloqué, 6pm utilise RevenueCat, un service qui enregistre l’état des achats. RevenueCat apprend d’Apple ou de Google quels looks et quelles formules tu as achetés, quand, et si un essai ou un abonnement est actif. Il relie ces informations à un identifiant d’utilisateur anonyme de l’app, et non à ton nom ou à ton e-mail. Comme la plupart des outils d’achat, il reçoit aussi des informations techniques de base de ton téléphone : version de l’app, modèle d’appareil et version du système, pays et langue, et ton adresse IP.

C’est ainsi que Max et tes looks restent débloqués, et que « Restaurer les achats » fonctionne.

### Mises à jour de l’app

Nous envoyons certaines corrections de l’app à distance, via le service de mise à jour d’Expo. Ton téléphone demande à Expo si une mise à jour l’attend. Cette requête contient la version de l’app, la plateforme et ton adresse IP. Elle ne contient rien qui concerne ton argent.

### Rapports de plantage

Quand l’app plante ou rencontre une erreur, elle envoie un rapport à Sentry pour que nous puissions corriger le problème : ce qui s’est mal passé dans le code, l’écran concerné, la version de l’app, le modèle d’iPhone et la version d’iOS, et un identifiant d’installation aléatoire. Les rapports ne contiennent jamais tes dépenses, montants, notes, ton plan ni des noms, et nous n’y joignons pas ton adresse IP. En mode sur l’appareil, aucun rapport de plantage n’est envoyé.

### Demande à 6pm et les phrases de ton compagnon, le nom d’un bénéficiaire et la lecture d’une photo de ticket

Quand tu poses une question à 6pm, par exemple « Je peux me permettre 250 € samedi ? », l’app envoie les mots de la question à notre serveur, avec les noms de tes catégories et de tes bocaux pour que la question soit bien comprise. Notre serveur demande à Anthropic, un service d’IA, ce que la question demande. La réponse elle-même est calculée sur ton téléphone, à partir de tes propres données, qui ne sont jamais envoyées.

Pour écrire les phrases de ton compagnon et les mots d’une réponse, l’app envoie à notre serveur, puis à Anthropic, les quelques éléments dont parle cette phrase, déjà calculés sur ton téléphone : par exemple un montant, un lieu, un nom de catégorie ou de bocal, ou la comparaison de cette semaine avec la précédente. Elle n’envoie jamais ta liste de dépenses, ton plan ni ton solde. Sans connexion, l’app utilise des phrases déjà écrites dans l’app.

Quand tu partages une capture d’écran de ticket avec 6pm, le texte est lu sur ton téléphone. Si l’app ne parvient pas à savoir qui tu as payé, et qu’aucune de tes propres règles ne connaît le nom, elle envoie les lignes du ticket à notre serveur, puis à Anthropic, pour nommer le bénéficiaire. Tous les chiffres sont retirés avant, donc les montants, numéros de compte et références ne sont jamais envoyés. Si quelque chose contenant un chiffre arrive quand même, le serveur le refuse sans le lire.

Une notification de banque ou de portefeuille que 6pm lit pour toi (voir « Notifications de banque et de portefeuille » plus bas) est lue deux fois. Ton téléphone la lit d’abord, tout de suite. La prochaine fois que tu ouvres 6pm, le texte de la notification est envoyé à notre serveur, puis à Anthropic, pour une seconde lecture : de l’argent a-t-il bougé et dans quel sens, de quel montant affiché il s’agit, qui a été payé, et dans laquelle de tes catégories la ranger. Ce qui est envoyé, c’est le nom de l’app de banque ou de portefeuille, les mots de la notification, les montants qu’elle affiche (y compris son solde, quand elle en affiche un), la devise dans laquelle tu comptes et les noms de tes catégories. Les mots peuvent contenir un nom ou le message d’un virement. Avant tout envoi, ton téléphone masque les longs numéros chiffre par chiffre : tout nombre de neuf chiffres ou plus, écrit d’un bloc ou par groupes, les numéros de carte, et le numéro qui suit un mot comme « TK », « compte » ou « carte ». Les numéros de compte, de carte et de téléphone restent donc sur ton téléphone, et notre serveur refuse un texte qui contient encore un long numéro. La réponse ne contient jamais de montant : ton téléphone marque chaque montant dans le texte, la réponse désigne l’une des marques, et le montant enregistré est celui que ton téléphone y a lu. Une notification que ton téléphone n’a pas pu lire du tout, mais qui affiche un nombre, attend sur ton téléphone deux jours au plus pour être lue de la même façon, puis elle est supprimée. Il en va de même pour une notification que ton téléphone a bien lue, quand sa seconde lecture n’a pas obtenu de réponse la première fois (pas de connexion, ou notre serveur trop lent) : son texte attend sur ton téléphone, deux jours au plus, que le serveur ait répondu, puis il est supprimé. Une notification que ton téléphone reconnaît comme un code à usage unique, un avis de connexion ou de sécurité, un paiement échoué, une promotion ou un avis de solde n’est jamais envoyée. Sans connexion, la lecture faite par le téléphone est conservée.

Si ton téléphone n’est pas sûr du total ou de la devise d’un ticket partagé, il envoie cette seule photo de ticket à notre serveur, puis à Anthropic, un service d’IA, pour lire le total, la devise, le magasin et l’heure. Notre serveur ne stocke pas la photo et ne l’enregistre pas dans ses journaux, et elle n’est envoyée à personne d’autre. Anthropic ne l’utilise pas pour entraîner ses modèles et la supprime dans les 30 jours (plus longtemps seulement si elle est signalée pour violation de la politique d’utilisation d’Anthropic, ou si la loi l’exige). Sans connexion, l’app garde ce que ton téléphone a lu.

Quand tu crées une catégorie, l’app peut envoyer son nom à notre serveur, puis à Anthropic, pour te proposer une icône.

Nous ne stockons pas tes questions, les lignes de tes tickets, le texte des notifications ni les photos de tickets. Pour chaque requête, notre serveur ne garde que la quantité de service d’IA utilisée, associée à ton identifiant d’appareil anonyme. Anthropic n’utilise pas les requêtes pour entraîner ses modèles et les supprime dans les 30 jours (plus longtemps seulement si l’une d’elles est signalée pour violation de la politique d’utilisation d’Anthropic, ou si la loi l’exige).

### Ta voix

Quand tu dictes une dépense à voix haute, l’app transmet en direct le son de ton micro à un service de transcription, Deepgram (ou ElevenLabs), uniquement pendant que tu maintiens ou touches le micro, et récupère les mots. Notre serveur se contente de donner à ton téléphone une clé de courte durée pour cela et d’enregistrer qu’une transcription a eu lieu, associée à ton identifiant d’appareil anonyme. Il n’entend jamais le son et ne voit jamais les mots. Avec Deepgram, nous refusons de participer à son programme d’amélioration des modèles, donc le son n’est conservé que le temps d’être transformé en texte. Rien n’est enregistré sur ton téléphone. Sans connexion, en mode sur l’appareil, ou après 10 transcriptions par jour sans 6pm Max, c’est la reconnaissance vocale d’Apple qui transforme tes mots en texte sur ton téléphone, et rien n’est envoyé.

### Mode sur l’appareil

Dans Réglages → IA, tu peux garder l’IA de 6pm sur ton iPhone. Alors rien de ce qui est décrit dans « Demande à 6pm et les phrases de ton compagnon » ou « Ta voix » ne le quitte : les questions sont lues, les phrases écrites et les tickets lus sur ton téléphone, avec un modèle que tu télécharges une fois. Le modèle est téléchargé depuis Hugging Face, qui voit ton adresse IP et le modèle demandé, et rien d’autre. Dans ce mode, l’e-mail de tickets est désactivé, les rapports de plantage et les comptages anonymes aussi, et le Mode voyage déduit ton pays du fuseau horaire de ton téléphone plutôt que de ta position.

### E-mail de tickets

6pm donne à ton téléphone sa propre adresse, comme k7m2qx@at6pm.app. Si ta banque t’envoie ses e-mails à cette adresse, ou si tu les y transfères, les paiements arrivent dans ta Boîte de réception.

Notre serveur lit chaque e-mail à son arrivée. Un e-mail qui affiche un montant est envoyé à Anthropic, un service d’IA, pour distinguer un paiement d’un virement entre tes propres comptes, d’un remboursement ou d’une promotion, et pour lire qui tu as payé, pour quoi et combien ; un e-mail sans montant est écarté sans être lu. Si l’e-mail contient un paiement, le serveur ne garde que ce qui a été lu : le montant et sa devise, le marchand, la catégorie, l’heure, l’adresse de l’expéditeur et le libellé du virement. Il chiffre ces informations jusqu’à ce que ton téléphone les récupère, puis les supprime. L’e-mail lui-même n’est jamais stocké ni enregistré dans les journaux par 6pm, et il n’est envoyé à personne d’autre qu’Anthropic, qui ne l’utilise pas pour entraîner ses modèles et le supprime dans les 30 jours (plus longtemps seulement s’il est signalé pour violation de la politique d’utilisation d’Anthropic, ou si la loi l’exige). Tout ce qui n’est pas un ticket est écarté. Un ticket que ton téléphone n’a pas récupéré au bout de 30 jours est supprimé sans être lu.

L’adresse est liée à ton identifiant d’appareil anonyme, pas à ton nom. Le courrier qu’elle reçoit, de qui que ce soit, est lu de la même façon : ne la donne qu’à ta banque.

### Taux de change (Mode voyage)

En Mode voyage, l’app récupère les taux de change du jour sur notre serveur. Notre serveur les obtient auprès de Frankfurter, un service gratuit qui publie les taux des banques centrales. La requête ne contient rien sur toi ni sur ton argent.

### Sauvegarde chiffrée (6pm Max)

La sauvegarde est une fonction de 6pm Max, désactivée tant que tu ne l’actives pas. Elle est chiffrée de bout en bout : la clé reste dans ton trousseau iCloud, et notre serveur ne stocke que du texte chiffré sous un jeton anonyme. Le texte chiffré, ce sont des données brouillées que nous ne pouvons pas lire.

Apple synchronise la clé entre tes appareils via le trousseau iCloud, sous ton identifiant Apple et selon les conditions d’Apple. Si tu perds à la fois la clé et ton téléphone, personne, nous compris, ne peut déverrouiller la sauvegarde.

### Budget à deux

Budget à deux permet à deux personnes de tenir des bocaux communs qu’elles alimentent toutes les deux. C’est la seule partie de 6pm avec une connexion, et rien ne se passe tant que tu ne le lances pas ou que tu n’ouvres pas une invitation.

- **Se connecter avec Apple.** Quand tu lances Budget à deux ou que tu le rejoins, tu te connectes avec Apple. Apple nous donne un identifiant stable qui ne fonctionne qu’avec 6pm et, la première fois, ton prénom si tu choisis de le partager. Nous ne demandons jamais ton e-mail. Notre serveur relie cet identifiant à ton identifiant d’appareil anonyme. Quand tu supprimes ton compte, notre serveur demande aussi à Apple de mettre fin à l’accès de 6pm, pour que 6pm disparaisse de la liste « Se connecter avec Apple » dans les réglages de ton identifiant Apple.
- **Ce qui est partagé.** Notre serveur conserve ton prénom, le nom, l’icône, la couleur, l’objectif et le mois de chaque bocal commun, et chaque montant que l’un de vous deux dit avoir mis de côté, avec qui l’a ajouté et quand. Ton binôme voit tout cela, et tu vois ce qu’il ajoute. Rien d’autre de ton téléphone n’est partagé : ni tes dépenses, ni ton plan, ni ton chiffre du jour, ni tes propres bocaux.
- **Invitations.** Un lien d’invitation ne sert qu’une fois, pendant 7 jours. Notre serveur n’en stocke qu’une forme brouillée.
- **Partir.** Chacun de vous peut partir à tout moment. Partir met fin à Budget à deux pour vous deux et supprime de notre serveur les bocaux communs et tout ce qu’ils contiennent. Chaque téléphone garde, en historique, les montants que sa propre personne y a mis.
- **Supprimer ton compte.** « Supprimer le compte Budget à deux » dans l’app supprime de notre serveur ta connexion, ton prénom et tout ce que tu partages, et y met fin pour ton binôme aussi. Retirer à 6pm l’usage de ton identifiant Apple dans les réglages de ton identifiant Apple a le même effet.

6pm ne déplace jamais d’argent. Les montants des bocaux communs sont ce que chacun de vous dit avoir mis de côté ; ils servent seulement à compter.

### La liste de lancement (site web)

Si tu t’inscris à la liste de lancement sur ce site, nous conservons ton adresse e-mail, la langue de la page, l’heure de ton inscription et ta place dans la file. Si tu as utilisé le calculateur de fuites avant de t’inscrire, nous conservons aussi le montant mensuel qu’il a affiché. Le calculateur lui-même fonctionne dans ton navigateur, et rien n’est envoyé tant que tu ne t’inscris pas.

Nous l’utilisons uniquement pour te prévenir de la sortie de 6pm 2.0. Ces données sont conservées jusqu’à ce que tu nous demandes de les supprimer.

### Visiter le site

Ce site ne dépose aucun cookie. Il compte les visites avec Cloudflare Web Analytics, qui ne nous donne que des totaux, comme les pages vues, la page ou le lien d’où tu viens, ton pays et ton type d’appareil. Il n’utilise ni cookies ni stockage local, ne te suit pas d’un site à l’autre et ne t’identifie pas. Ses polices sont servies par le site lui-même. Le site fonctionne sur Cloudflare, qui traite chaque requête et peut conserver des journaux techniques ordinaires, comme ton adresse IP et ton type de navigateur, pour faire fonctionner et protéger le service. Pour freiner les abus, notre serveur compte les requêtes par adresse IP. L’adresse ne sert que de clé de comptage. Nous ne la stockons pas.

## Ce que l’app utilise sur ton téléphone

- **Appareil photo.** Le scan utilise l’appareil photo pour lire des codes QR, comme VietQR. L’image n’est jamais enregistrée ni envoyée. Seules les informations de paiement du code sont utilisées, sur ton téléphone. Si tu refuses l’accès à l’appareil photo, tout le reste fonctionne quand même.
- **Micro et parole.** Quand tu dictes une dépense à voix haute, le son part vers un service de transcription comme décrit dans « Ta voix », ou il est transformé en texte sur ton téléphone par la reconnaissance vocale d’Apple sur l’appareil. L’enregistrement n’est jamais conservé.
- **Photos.** 6pm enregistre dans ta photothèque les images que tu choisis de partager, comme la carte de ta journée. Il ne lit jamais ta photothèque. Les captures d’écran de tickets que tu partages avec 6pm sont lues sur ton téléphone, puis abandonnées ; seule celle que ton téléphone ne parvient pas à lire est envoyée pour être lue, comme décrit plus haut.
- **Position.** Uniquement une fois le Mode voyage activé, et uniquement quand l’app est ouverte, 6pm vérifie dans quel pays tu te trouves pour pouvoir changer de devise. C’est le système de ton téléphone qui transforme la position en nom de pays et de ville. 6pm garde le nom du pays et de la ville sur ton téléphone, et ne nous envoie rien sur l’endroit où tu te trouves. En mode sur l’appareil, 6pm n’utilise pas du tout ta position : ton pays est déduit du fuseau horaire de ton téléphone.
- **Widgets, Activités en direct et Siri.** Tes widgets, Activités en direct, raccourcis et commandes lisent et écrivent dans un dossier partagé sur ton téléphone. Rien de tout cela ne passe par notre serveur.
- **Presse-papiers.** Quand tu passes un paiement à ton app bancaire, 6pm copie le montant pour que tu puisses le coller. 6pm écrit dans le presse-papiers. Il ne lit jamais ce qu’il contient.
- **Apps bancaires.** L’app vérifie sur ton téléphone si certaines apps bancaires sont installées, et ouvre celle que tu choisis, ou sa page sur l’App Store. Nous n’envoyons rien à la banque. Une fois dans l’app de ta banque, c’est sa propre politique qui s’applique.
- **Notifications de banque et de portefeuille.** Seulement si tu le configures, 6pm lit les notifications que tes apps de banque et de portefeuille envoient quand de l’argent bouge, pour noter le paiement à ta place. Sur iPhone, une automatisation Raccourcis que tu crées transmet à 6pm chaque notification des apps que tu choisis. Sur Android, 6pm ne les lit qu’une fois que tu l’as activé dans Accès aux notifications, et uniquement celles des apps de banque et de portefeuille que 6pm connaît ; les notifications de toutes les autres apps sont laissées de côté sans être lues. Dans les deux cas, chacune est lue sur ton téléphone. L’argent qui a bougé est enregistré dans ta Boîte de réception, sur ton téléphone ; les codes, paiements échoués, promotions et avis de solde sont ignorés et ne sont conservés nulle part. Une notification que le téléphone n’arrive pas à lire et qui affiche un nombre attend sur ton téléphone, deux jours au plus, la seconde lecture décrite ci-après. Il en va de même pour une notification que le téléphone a bien lue, quand cette seconde lecture n’a pas obtenu de réponse la première fois. Sauf si l’IA de 6pm est gardée sur ton téléphone, une notification qui concerne de l’argent est ensuite lue une seconde fois par notre serveur : ses mots et ses montants sont envoyés, après avoir masqué les numéros de compte, de carte et de téléphone, comme décrit dans « Demande à 6pm et les phrases de ton compagnon, le nom d’un bénéficiaire et la lecture d’une photo de ticket ». Rien d’autre d’une notification ne nous est envoyé, ni à personne d’autre, et avec l’IA de 6pm gardée sur ton téléphone, rien du tout. Sur Android, 6pm affiche ensuite sa propre notification, discrète, qui dit ce qu’il a repéré. Tu peux désactiver tout cela à tout moment : sur iPhone en supprimant l’automatisation, sur Android dans Accès aux notifications.
- **Notifications.** Le rappel quotidien à l’heure de ta clôture est programmé sur ton téléphone. Il n’y a pas de notification à distance, et aucun jeton de notification ne nous est envoyé.

## Sur Android

L’app Android fonctionne comme décrit ci-dessus, avec ces différences :

- **La clé de tes données** est protégée par le Keystore Android sur ton téléphone au lieu du trousseau iOS. La sauvegarde des apps dans le cloud d’Android est désactivée pour 6pm, donc tes données ne sont jamais copiées sur ton compte Google.
- **La sauvegarde** garde sa clé sur ton téléphone, pas dans le trousseau iCloud, donc une sauvegarde ne peut être ouverte que sur le téléphone qui l’a créée.
- **Les achats** passent par Google Play. Google encaisse le paiement, et RevenueCat apprend l’état de tes achats auprès de Google.
- **Le mode sur l’appareil** n’est pas proposé : 6pm n’a pas de modèle à faire tourner sur un téléphone Android.
- **La reconnaissance vocale sur ton téléphone**, quand le service de transcription n’est pas utilisé (hors ligne, ou après 10 par jour sans 6pm Max), est celle d’Android sur l’appareil, et uniquement pour une langue déjà téléchargée sur ton téléphone, donc le son ne le quitte jamais.
- **Photos.** Le scan choisit une image via le sélecteur de photos d’Android, qui ne transmet à 6pm que l’image que tu choisis. 6pm ne lit jamais ta galerie.
- **Budget à deux**, les widgets, les Activités en direct et Siri ne sont pas dans l’app Android.

## Ce que nous ne faisons pas

- Nous n’affichons pas de publicité.
- Nous ne vendons pas tes données et ne les partageons pas à des fins marketing.
- Nous ne faisons pas de profilage.
- Cette version de l’app ne contient aucun outil tiers d’analyse, de publicité ou de suivi.

Si tu choisis, dans les Réglages d’iOS, de partager des données d’analyse avec les développeurs d’apps, Apple peut nous transmettre des données anonymes de plantage et d’utilisation. Nous ne pouvons pas savoir de qui elles viennent.

## Qui traite des données pour nous

Ces entreprises font fonctionner les parties du service décrites ci-dessus. Elles peuvent traiter tes données dans d’autres pays, notamment aux États-Unis et en Chine.

- **Apple** traite les paiements, le trousseau iCloud et Se connecter avec Apple. [Politique de confidentialité d’Apple](https://www.apple.com/legal/privacy/).
- **Google** traite les paiements via Google Play sur Android. [Règles de confidentialité de Google](https://policies.google.com/privacy).
- **RevenueCat** enregistre l’état des achats. [Politique de confidentialité de RevenueCat](https://www.revenuecat.com/privacy).
- **Cloudflare** héberge notre site et notre serveur, et compte les visites du site. [Politique de confidentialité de Cloudflare](https://www.cloudflare.com/privacypolicy/).
- **Sentry** reçoit les rapports de plantage. [Politique de confidentialité de Sentry](https://sentry.io/privacy/).
- **Anthropic** lit les questions que tu poses, écrit les phrases de ton compagnon à partir des éléments sur ta journée décrits plus haut, propose des icônes pour tes catégories à partir de leur nom, nomme les bénéficiaires à partir de lignes de tickets sans chiffres, lit une seconde fois les notifications de banque et de portefeuille décrites plus haut, lit une photo de ticket que ton téléphone ne parvient pas à lire, et lit les e-mails de banques et de magasins que tu transfères à ton adresse de tickets. [Politique de confidentialité d’Anthropic](https://www.anthropic.com/legal/privacy).
- **Deepgram** transforme ta voix en texte quand tu dictes une dépense. [Politique de confidentialité de Deepgram](https://deepgram.com/privacy).
- **ElevenLabs** peut faire la même chose à la place de Deepgram. [Politique de confidentialité d’ElevenLabs](https://elevenlabs.io/privacy-policy).
- **Hugging Face** héberge les modèles que tu peux télécharger pour le mode sur l’appareil. [Politique de confidentialité de Hugging Face](https://huggingface.co/privacy).
- **Expo** distribue les mises à jour de l’app à distance. [Politique de confidentialité d’Expo](https://expo.dev/privacy).

Nous ne faisons appel à eux que pour ces finalités.

## Combien de temps nous conservons les données

- **Sur ton téléphone.** Jusqu’à ce que tu les supprimes. « Supprimer toutes les données » dans les Réglages efface du téléphone tes dépenses, ton plan et ton journal, et désactive le rappel. Supprimer l’app efface aussi les données.
- **Identifiant d’appareil.** Tant que l’app est utilisée sur cet appareil.
- **Comptages anonymes.** Conservés sous forme de totaux quotidiens. Ils ne contiennent rien qui renvoie à un téléphone ou à une personne.
- **Rapports de plantage.** Jusqu’à 90 jours, puis supprimés.
- **E-mail de tickets.** Jusqu’à ce que ton téléphone récupère le ticket, et jamais plus de 30 jours. Ton adresse de tickets dure aussi longtemps que ton identifiant d’appareil.
- **Questions, éléments pour les phrases, lignes de tickets et e-mails transférés.** Nous ne les conservons pas. Anthropic les supprime dans les 30 jours, comme décrit plus haut.
- **Photos de tickets.** Nous ne les conservons pas. Anthropic les supprime dans les 30 jours, comme décrit plus haut.
- **Ta voix.** Nous ne la conservons pas. Deepgram ne la traite que pendant que tu parles ; ElevenLabs la conserve selon sa propre politique.
- **Sauvegarde.** Jusqu’à ce que tu la supprimes. Quand tu le fais, nous supprimons les données chiffrées de notre serveur.
- **Budget à deux.** Les bocaux communs jusqu’à ce que l’un de vous parte ; ta connexion et ton prénom jusqu’à ce que tu supprimes ton compte Budget à deux. L’un comme l’autre supprime aussitôt les données de notre serveur.
- **Liste de lancement.** Jusqu’à ce que tu nous demandes de supprimer ton e-mail.
- **Historique des achats.** Apple, Google et RevenueCat le conservent selon leurs propres politiques et la loi.

## Tes choix et tes droits

Tu contrôles les données sur ton téléphone : tu peux modifier ou supprimer chacune d’elles dans l’app.

Pour toute donnée que nous détenons sur toi, tu peux nous demander de te dire de quoi il s’agit, de la rectifier, de l’effacer ou de cesser de l’utiliser. Contacte-nous au [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}). Nous te répondrons rapidement, et dans le délai que la loi nous accorde. Notre serveur détient très peu de choses qui renvoient à une personne, donc nous pourrons te demander une information qui nous aide à les retrouver, comme l’e-mail utilisé pour la liste de lancement.

Tu peux aussi adresser une réclamation à l’autorité de protection des données de ton lieu de résidence.

## Enfants

6pm n’est pas conçu pour les enfants de moins de 16 ans, et nous ne collectons pas sciemment leurs données. Si tu penses qu’un enfant nous a envoyé quelque chose, écris-nous et nous le supprimerons.

## Sécurité

Tes données sont chiffrées sur ton téléphone. Les échanges avec notre serveur passent par HTTPS. Les sauvegardes sont chiffrées avant de quitter ton téléphone, et les tickets issus de tes e-mails restent chiffrés jusqu’à ce que ton téléphone les récupère. Notre serveur ne stocke les jetons d’appareil que sous forme d’empreinte. Aucun système n’est parfaitement sûr : si tu trouves un problème, préviens-nous.

## Modifications de cette politique

Quand nous modifions cette politique, nous mettons à jour la date en haut de la page. Si la modification est importante, nous te prévenons dans l’app ou sur cette page avant qu’elle ne prenne effet.

## Le droit applicable et comment nous joindre

Nous traitons les données personnelles conformément au droit vietnamien, notamment la loi sur la protection des données personnelles. Si tu vis ailleurs, les droits que te donne ton propre pays s’appliquent quand même.

Des questions ? Appelle {{OWNER}} ou envoie-lui un message au [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}).
