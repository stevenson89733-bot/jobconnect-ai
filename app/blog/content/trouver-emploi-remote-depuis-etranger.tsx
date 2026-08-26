/* eslint-disable react/no-unescaped-entities */
import { H2, H3, P, KeyTakeaway, TOC, FAQ, StatHook, Conclusion } from '@/components/blog/ArticleComponents'

export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <StatHook>En 2025, plus de 40 % des offres d'emploi remote publiées sur les plateformes spécialisées étaient explicitement ouvertes aux candidats situés hors du pays de l'entreprise, contre 18 % en 2020.</StatHook>

      <TOC items={[
        { id: 'realite', label: 'Ce que "remote" veut vraiment dire selon les recruteurs' },
        { id: 'plateformes', label: "Plateformes efficaces pour trouver depuis l'étranger" },
        { id: 'statut', label: 'Freelance, EOR ou salarié : choisir le bon statut' },
        { id: 'candidature', label: 'Comment rédiger une candidature qui rassure' },
        { id: 'negocier', label: 'Négocier un salaire en tenant compte du contexte international' },
        { id: 'erreurs', label: 'Erreurs fréquentes à éviter absolument' },
        { id: 'paiement', label: "Recevoir son salaire depuis l'étranger" },
      ]} />

      <P drop>
        Travailler à distance pour une entreprise étrangère sans quitter son pays est devenu une réalité concrète pour des millions de professionnels dans le monde, mais la route pour y arriver reste mal balisée. Les conseils génériques sur le travail remote s'adressent le plus souvent à des candidats déjà dans le même pays que l'employeur. Pour les professionnels basés au Sénégal, au Maroc, en Côte d'Ivoire, en Haïti, à Madagascar ou au Vietnam qui ciblent des entreprises en France, en Belgique, au Canada ou aux États-Unis, les règles du jeu sont différentes. Cet article couvre les étapes pratiques de la recherche jusqu'à la première paie, sans raccourcis théoriques.
      </P>
      <P>
        Le point de départ est une distinction essentielle que la plupart des guides n'explicitent pas : toutes les offres intitulées "remote" ne sont pas ouvertes aux candidats basés à l'étranger. Comprendre cette distinction dès le début de la recherche économise des semaines d'effort gaspillé.
      </P>

      <H2 id="realite">Ce que "remote" veut vraiment dire selon les recruteurs</H2>
      <P>
        Le terme "remote" dans une offre d'emploi peut désigner trois réalités très différentes. La première est le remote national : l'entreprise autorise le travail à distance mais exige que le candidat soit résident fiscal dans le même pays, parfois dans la même région. La deuxième est le remote Europe ou remote Union Européenne : l'entreprise recrute dans un bassin géographique défini, souvent pour des raisons de compliance sociale et fiscale. La troisième est le remote mondial ou full remote : l'entreprise recrute sans contrainte géographique et a mis en place l'infrastructure juridique et bancaire pour payer des collaborateurs dans plusieurs pays.
      </P>
      <P>
        Identifier rapidement dans quelle catégorie tombe une offre évite d'investir du temps dans une candidature qui sera refusée pour des raisons administratives et non de compétence. Les offres qui mentionnent "worldwide", "global remote", "location: anywhere", "open to all time zones" ou "EOR supported" signalent une ouverture réelle. Les offres qui mentionnent uniquement "remote" sans précision géographique méritent une vérification directe avant toute candidature formelle.
      </P>
      <KeyTakeaway>Avant de postuler à n'importe quelle offre remote depuis l'étranger, vérifiez si elle précise une contrainte géographique. Cette vérification de trente secondes est la variable qui détermine si votre candidature sera lue ou automatiquement ignorée.</KeyTakeaway>

      <H2 id="plateformes">Plateformes efficaces pour trouver depuis l'étranger</H2>
      <P>
        Toutes les plateformes d'emploi ne se valent pas pour les candidats basés à l'étranger. Les grandes plateformes généralistes comme LinkedIn ou Indeed contiennent des offres remote dans leur grande majorité restreintes à un pays ou une région, sans que cette restriction soit affichée clairement dans les résultats de recherche. La frustration du candidat qui postule en masse sur ces plateformes est presque inévitable.
      </P>
      <H3>JobConnect AI</H3>
      <P>
        JobConnect AI agrège les offres de sources multiples et affiche explicitement les restrictions géographiques, permettant aux candidats basés à l'étranger de filtrer directement pour les postes réellement accessibles. Le score de matching IA permet d'identifier les offres où le profil du candidat correspond le mieux, ce qui est particulièrement utile pour prioriser ses candidatures dans un contexte de marché compétitif.
      </P>
      <H3>We Work Remotely et Remote.co</H3>
      <P>
        Ces deux plateformes spécialisées dans le travail remote publient majoritairement des offres d'entreprises qui ont délibérément construit des équipes distribuées à l'échelle mondiale. Les entreprises présentes sur ces plateformes ont déjà décidé de recruter au-delà de leurs frontières, ce qui réduit considérablement le filtrage invisible à l'œuvre sur les plateformes généralistes.
      </P>
      <H3>Remotive</H3>
      <P>
        Remotive est spécialisé dans les offres remote pour les profils tech et marketing. La plateforme indique systématiquement les restrictions géographiques et filtre les offres par fuseau horaire compatible, ce qui permet aux candidats en Afrique, au Moyen-Orient ou en Asie de cibler immédiatement les entreprises qui travaillent dans des créneaux horaires compatibles avec leur localisation.
      </P>
      <KeyTakeaway>Concentrer 80 % de ses efforts de recherche sur des plateformes spécialisées dans le remote global, plutôt que sur les plateformes généralistes, multiplie le taux de retour des candidatures par deux à trois pour les candidats basés à l'étranger.</KeyTakeaway>

      <H2 id="statut">Freelance, EOR ou salarié : choisir le bon statut</H2>
      <P>
        Le statut sous lequel vous travaillez pour une entreprise étrangère a des conséquences directes sur votre revenu net, votre protection sociale et vos obligations fiscales dans votre pays de résidence. Il est essentiel de comprendre les trois structures principales avant de négocier avec un employeur.
      </P>
      <P>
        Le contrat freelance ou prestataire indépendant est la structure la plus courante pour les premières collaborations internationales. Vous facturez directement l'entreprise étrangère, gérez vous-même vos obligations fiscales locales, et ne bénéficiez pas des protections sociales du pays de l'employeur. Les taux sont généralement plus élevés qu'en CDI pour compenser l'absence de charges patronales. La contrepartie est l'instabilité inhérente au statut de prestataire.
      </P>
      <P>
        L'Employer of Record (EOR) est une solution par laquelle un tiers juridique dans votre pays de résidence vous emploie formellement pour le compte de l'entreprise étrangère. Vous bénéficiez d'un contrat de travail local, de cotisations sociales locales, et l'entreprise étrangère délègue toute la compliance locale à l'EOR. Des plateformes comme Deel, Remote et Papaya Global proposent ce service dans de nombreux pays africains, asiatiques et d'Amérique latine. C'est souvent la solution préférée des entreprises européennes et nord-américaines qui veulent recruter à l'international sans ouvrir de structure juridique locale.
      </P>
      <P>
        Le salariat direct dans une filiale locale de l'entreprise est rare mais existe pour les multinationales ayant des bureaux dans votre pays. C'est le statut le plus protecteur mais aussi le plus difficile à obtenir depuis l'étranger, car il suppose que l'entreprise ait une entité légale dans votre pays de résidence.
      </P>

      <H2 id="candidature">Comment rédiger une candidature qui rassure</H2>
      <P>
        La principale hésitation d'un recruteur face à un candidat basé à l'étranger est opérationnelle, pas qualitative. Le recruteur se demande : est-ce que nous pouvons légalement travailler avec cette personne ? Est-ce que les fuseaux horaires vont fonctionner ? Est-ce que la communication va être fluide ? Une candidature efficace répond à ces questions avant qu'elles soient posées.
      </P>
      <P>
        Indiquez clairement dans votre CV ou votre lettre de motivation votre disponibilité en termes de fuseaux horaires, votre expérience du travail asynchrone, et les outils de collaboration que vous maîtrisez (Slack, Notion, Linear, Loom, Zoom). Mentionnez si vous avez déjà travaillé en tant que prestataire pour des entreprises étrangères : cela signale que la mécanique administrative est connue de vous et ne nécessitera pas d'accompagnement. Si vous êtes à l'aise avec une structure EOR, l'indiquer proactivement simplifie la décision du recruteur.
      </P>
      <KeyTakeaway>Une candidature internationale efficace ne se contente pas de répondre à la question "pouvez-vous faire ce travail ?". Elle répond aussi à la question "pouvons-nous travailler avec vous depuis un autre pays ?" en anticipant les doutes opérationnels du recruteur.</KeyTakeaway>

      <H2 id="negocier">Négocier un salaire en tenant compte du contexte international</H2>
      <P>
        La négociation salariale dans un contexte international requiert de connaître deux références simultanément : le taux du marché dans le pays de l'entreprise pour le rôle en question, et les normes de rémunération pour les prestataires ou employés basés dans votre région. Certaines entreprises appliquent une politique de localisation qui ajuste les salaires en fonction du coût de la vie du pays du candidat. D'autres paient au taux du marché local de leur siège, indépendamment de l'emplacement. Il est légitime de demander dès la première conversation de quelle politique l'entreprise relève.
      </P>
      <P>
        Ne vous ancrez pas uniquement aux salaires locaux de votre marché. Les prestataires indépendants expérimentés travaillant pour des entreprises françaises, belges ou canadiennes depuis l'Afrique ou l'Asie facturent généralement entre 60 % et 90 % des taux pratiqués pour les mêmes rôles en France ou au Canada, selon le niveau d'expérience et le secteur. Cette fourchette est très supérieure aux salaires locaux dans la plupart des pays d'Afrique subsaharienne ou d'Asie du Sud-Est.
      </P>

      <H2 id="erreurs">Erreurs fréquentes à éviter absolument</H2>
      <P>
        Postuler à des offres sans vérifier les restrictions géographiques est l'erreur la plus coûteuse en temps. La deuxième erreur est de ne pas adapter son CV au standard du pays cible : un CV français inclut rarement une photo et ne liste jamais la situation de famille ou la date de naissance, à la différence des pratiques dans certains pays africains ou asiatiques. Un CV destiné à une entreprise française, belge ou canadienne doit suivre les standards de présentation du pays cible.
      </P>
      <P>
        La troisième erreur est de négliger la qualité écrite de la candidature en français ou en anglais selon l'entreprise ciblée. Pour un candidat non natif, la qualité de l'écrit est le premier signal de professionnalisme que le recruteur évalue. Un courriel de candidature ou une lettre de motivation avec des fautes d'accord ou de syntaxe disqualifie avant même que le CV soit ouvert. Faites relire votre candidature avant de l'envoyer.
      </P>

      <H2 id="paiement">Recevoir son salaire depuis l'étranger</H2>
      <P>
        Wise est la solution la plus répandue pour les prestataires indépendants basés à l'international. Elle permet de recevoir des paiements en euros, dollars ou livres sterling sur un compte virtuel dans la devise de l'entreprise, puis de convertir et transférer vers un compte local à des taux proches du marché interbancaire. Les frais sont nettement inférieurs aux virements bancaires internationaux classiques.
      </P>
      <P>
        Pour les structures EOR, le paiement est directement géré par la plateforme EOR dans la devise et le compte bancaire local du candidat. Deel, Remote et Papaya Global proposent tous des interfaces de paiement qui prennent en charge la conversion et le virement local automatiquement. Pour les candidats utilisant PayPal, les frais de conversion peuvent être significatifs : il vaut mieux négocier un paiement en devise forte et convertir soi-même via Wise.
      </P>

      <FAQ items={[
        {
          q: 'Est-il obligatoire de déclarer ses revenus étrangers dans son pays de résidence ?',
          a: "Oui, dans la quasi-totalité des pays, les résidents fiscaux sont imposables sur leurs revenus mondiaux, y compris ceux provenant de sources étrangères. Les obligations déclaratives et les taux d'imposition varient selon les conventions fiscales en vigueur entre votre pays et celui de l'entreprise. Il est fortement recommandé de consulter un comptable local spécialisé en fiscalité internationale avant de signer votre premier contrat à l'étranger."
        },
        {
          q: 'Comment gérer les entretiens en différents fuseaux horaires ?',
          a: "La majorité des recruteurs expérimentés dans le remote international proposent des créneaux d'entretien compatibles avec les fuseaux horaires des candidats qu'ils contactent. Il est tout à fait acceptable de préciser votre fuseau horaire en UTF dans votre réponse à une invitation d'entretien et de proposer deux ou trois créneaux adaptés. Les entreprises qui refusent tout effort d'adaptation sur les horaires d'entretien sont généralement aussi rigides sur les horaires de travail, ce qui est une information utile sur leur culture d'entreprise."
        },
        {
          q: 'Faut-il mentionner sa localisation dans sa candidature ?',
          a: "Oui, clairement et dès le début. Tenter de dissimuler sa localisation dans l'espoir de passer un premier filtre crée systématiquement des problèmes à des stades ultérieurs du processus, lorsque la question devient incontournable. Un candidat transparent sur sa localisation qui démontre sa compréhension des structures contractuelles internationales fait meilleure impression qu'un candidat dont la localisation devient une surprise au moment de l'offre."
        },
        {
          q: "Y a-t-il des secteurs où les candidats basés à l'étranger sont particulièrement bien acceptés ?",
          a: "Les secteurs tech (développement logiciel, DevOps, data science), le design produit et UX, le content marketing en anglais ou en français, et le support client international sont les catégories où les entreprises recrutent le plus fréquemment des candidats basés à l'étranger. Les rôles qui nécessitent une présence physique, une présence régulière chez des clients locaux, ou un accès à des systèmes à fort niveau de sécurité non accessibles depuis l'étranger sont plus contraints sur la localisation."
        },
      ]} />

      <Conclusion>
        <P>
          Trouver un emploi remote depuis l'étranger n'est pas plus difficile que de trouver un emploi local : c'est simplement un processus différent, avec des règles différentes. Les candidats qui maîtrisent ces règles, choisissent les bonnes plateformes, comprennent les structures contractuelles et rédigent des candidatures qui répondent aux préoccupations opérationnelles des recruteurs internationaux accèdent à un marché qui n'est pas limité par les frontières de leur pays de résidence.
        </P>
        <P>
          JobConnect AI agrège des offres remote vérifiées avec filtrage géographique explicite, pour que les candidats basés à l'étranger voient uniquement les postes réellement accessibles. Le générateur de lettre de motivation IA adapte également la présentation à la culture d'entreprise du pays cible, ce qui est un avantage concret dans un contexte où la première impression écrite est déterminante.
        </P>
      </Conclusion>

    </article>
  )
}
