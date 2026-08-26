/* eslint-disable react/no-unescaped-entities */
import { H2, H3, P, KeyTakeaway, TOC, FAQ, StatHook, Conclusion } from '@/components/blog/ArticleComponents'

export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <StatHook>Selon une étude Apec publiée en 2025, les candidats francophones postulant à des offres en anglais via des plateformes ATS conventionnelles obtiennent un taux de sélection inférieur de 35 % à des candidats anglophones au profil équivalent, principalement en raison de la mise en forme et du vocabulaire du CV.</StatHook>

      <TOC items={[
        { id: 'algorithme', label: "Comment fonctionne un algorithme de matching IA" },
        { id: 'ats-francais', label: "Pourquoi les CVs français sont mal lus par les ATS anglo-saxons" },
        { id: 'matching-cross-border', label: "Le matching cross-border : une approche différente" },
        { id: 'optimiser-profil', label: "Optimiser son profil pour le matching international" },
        { id: 'competences', label: "Valoriser ses compétences de manière universelle" },
        { id: 'erreurs', label: "Erreurs courantes qui pénalisent le score de matching" },
        { id: 'pratique', label: "Ce qu'il faut faire concrètement aujourd'hui" },
      ]} />

      <P drop>
        Le matching IA pour l'emploi est devenu une réalité incontournable pour toute personne qui postule en ligne à des offres d'emploi internationales. Comprendre comment ces systèmes fonctionnent, même de façon approximative, est devenu aussi utile que de savoir rédiger un bon CV. Les candidats francophones qui cherchent à travailler pour des entreprises anglophones ou multinationales sont confrontés à un défi particulier : les systèmes ATS qui dominent le marché ont été conçus et entraînés principalement sur des CVs et des offres d'emploi nord-américains et britanniques, ce qui les rend structurellement moins efficaces pour évaluer les profils issus d'autres marchés. Ce guide explique le fonctionnement réel du matching IA, pourquoi les CVs français sont souvent mal lus, et ce que vous pouvez faire concrètement pour améliorer votre visibilité auprès des employeurs internationaux.
      </P>

      <H2 id="algorithme">Comment fonctionne un algorithme de matching IA</H2>
      <P>
        Un algorithme de matching IA pour l'emploi effectue essentiellement deux opérations principales. La première est l'analyse du contenu de votre CV ou profil : le système extrait des entités (compétences, titres de postes, noms d'entreprises, diplômes, années d'expérience) et les compare à celles présentes dans les offres d'emploi. La deuxième est le calcul d'un score de correspondance qui permet de classer les candidats entre eux pour chaque offre ou d'identifier les offres les plus pertinentes pour chaque candidat.
      </P>
      <P>
        Les systèmes les plus basiques fonctionnent par correspondance de mots-clés : si votre CV contient le mot "Python" et que l'offre le requiert, vous obtenez un point. Les systèmes plus avancés utilisent du traitement du langage naturel pour identifier des équivalences sémantiques : "développement web front-end" et "React developer" peuvent être reconnus comme conceptuellement proches. Mais même les systèmes les plus sophistiqués souffrent d'un biais fondamental : leur modèle de ce que devrait être un bon candidat est construit sur les données d'embauches passées, qui reflètent les marchés où ces systèmes ont été déployés en premier, c'est-à-dire l'Amérique du Nord et le Royaume-Uni.
      </P>
      <KeyTakeaway>Un algorithme de matching IA n'évalue pas votre valeur réelle. Il vérifie si votre document utilise le même vocabulaire et le même format que les documents sur lesquels il a été entraîné. Comprendre cela change la façon dont vous préparez votre candidature.</KeyTakeaway>

      <H2 id="ats-francais">Pourquoi les CVs français sont mal lus par les ATS anglo-saxons</H2>
      <P>
        Le CV français standard présente plusieurs caractéristiques qui créent des problèmes spécifiques avec les ATS conçus pour des marchés anglophones. Le premier est l'ordre des informations : les CVs français placent souvent la formation avant l'expérience professionnelle, ce que les ATS anglophones interprètent parfois comme le signe d'un profil junior. Le deuxième est la photo et les informations personnelles (date de naissance, nationalité, situation familiale) que les CVs français incluent et que les ATS nord-américains ne sont pas conçus pour traiter, provoquant parfois des erreurs de parsing qui créent des champs vides dans le profil du candidat.
      </P>
      <P>
        Le troisième problème est la terminologie. Le titre de poste "Responsable commercial" ne correspond pas directement à "Account Executive" ou "Sales Manager" dans les bases de données des ATS anglophones, même si les fonctions sont équivalentes. Un "chargé de projet" n'est pas immédiatement reconnu comme l'équivalent d'un "project manager". La formation à l'école de commerce française (HEC, ESSEC, ESCP) n'est pas reconnue comme équivalente à un MBA par les ATS entraînés sur des données américaines, même si elle lui est supérieure en termes de sélectivité.
      </P>
      <P>
        Le quatrième problème est la mise en forme. Les CVs français utilisent souvent des tableaux, des colonnes, des graphiques de compétences et d'autres éléments de mise en forme visuels que de nombreux ATS ne peuvent pas lire correctement. Un ATS qui ne peut pas extraire le texte d'un tableau verra les compétences listées dans ce tableau comme des champs vides dans le profil du candidat.
      </P>

      <H2 id="matching-cross-border">Le matching cross-border : une approche différente</H2>
      <P>
        Un système de matching conçu spécifiquement pour le recrutement international doit résoudre des problèmes que les ATS conventionnels n'ont pas été conçus pour traiter. Le premier est la modélisation de l'ouverture géographique : toutes les offres labellisées "remote" ne sont pas accessibles aux candidats de tous les pays. Un système cross-border doit distinguer les offres réellement ouvertes à l'international de celles qui sont remote uniquement au niveau national, et croiser cette information avec l'infrastructure de recrutement disponible pour chaque pays.
      </P>
      <P>
        Le deuxième problème est la transférabilité des compétences entre marchés. Un directeur commercial qui a développé un portefeuille de clients PME en Côte d'Ivoire a démontré des compétences commerciales qui sont structurellement similaires à celles d'un account executive qui a fait la même chose en Belgique, même si les titres de postes, les marchés et le vocabulaire professionnel sont différents. Un système de matching cross-border entraîné sur des données d'emploi internationales reconnaît ces équivalences que les ATS conventionnels ratent systématiquement.
      </P>
      <P>
        Le troisième problème est la pondération des signaux. Un système de matching pour le recrutement international doit accorder moins de poids à la localisation géographique du candidat (qui est souvent un signal négatif dans les ATS conventionnels pour les candidats étrangers) et plus de poids aux signaux d'ouverture de l'entreprise au recrutement international, comme l'existence d'autres employés basés dans des pays différents ou l'utilisation de plateformes EOR.
      </P>

      <H2 id="optimiser-profil">Optimiser son profil pour le matching international</H2>
      <P>
        La règle la plus importante pour optimiser votre profil pour un système de matching international est d'écrire dans la langue et avec le vocabulaire du marché que vous ciblez. Si vous ciblez des employeurs anglophones, votre CV et votre profil doivent être rédigés en anglais avec la terminologie professionnelle du marché anglophone ciblé. Cela ne signifie pas traduire votre CV français mot à mot, mais le réécrire dans le format et avec le vocabulaire que les recruteurs de ce marché utilisent et reconnaissent.
      </P>
      <P>
        La complétude de votre profil est également critique. Sur une plateforme avec matching IA, chaque champ vide est une pénalité potentielle dans le score de matching. Les compétences doivent être listées explicitement (pas implicitement), les langues avec leur niveau de maîtrise, et la disponibilité géographique et le fuseau horaire clairement indiqués.
      </P>
      <P>
        L'évitement des mises en forme complexes est une règle fondamentale pour les candidats qui soumettent des CVs à des ATS. Pas de tableaux, pas de colonnes multiples, pas de graphiques de compétences, pas de photos incorporées dans le corps du document. Un format linéaire, un titre de poste clairement identifiable en haut du document, et une progression chronologique claire de l'expérience sont les caractéristiques qui maximisent la fiabilité de l'extraction par les ATS.
      </P>

      <H2 id="competences">Valoriser ses compétences de manière universelle</H2>
      <P>
        La valorisation de vos compétences pour un marché international passe par la traduction de votre expérience locale en termes universels. Une expérience en gestion financière dans un contexte OHADA ne se décrit pas comme "comptabilité OHADA" sur un CV destiné à un recruteur nord-américain, mais comme "financial accounting and reporting in multi-currency environments across multiple regulatory frameworks." Ce n'est pas une déformation de la réalité, c'est une traduction vers le vocabulaire que le recruteur comprend et qui lui permet d'évaluer la valeur de votre expérience.
      </P>
      <P>
        Les compétences interculturelles et multilinguistiques, souvent sous-valorisées par les candidats francophones qui les considèrent comme allant de soi, sont des atouts réels et différenciants pour les employeurs internationaux. Un professionnel qui travaille couramment en français et en anglais, qui a de l'expérience avec des équipes ou des clients de plusieurs pays, et qui comprend les nuances culturelles de plusieurs marchés apporte quelque chose que la majorité des candidats monolingues et monoculturelles ne peuvent pas apporter.
      </P>

      <H2 id="erreurs">Erreurs courantes qui pénalisent le score de matching</H2>
      <P>
        La première erreur est de soumettre un CV conçu pour le marché local à des offres internationales sans l'adapter. La deuxième est d'utiliser des titres de postes locaux sans equivalents anglophones clairs, ce qui empêche le système de matcher votre expérience aux offres pertinentes. La troisième est de décrire ses responsabilités sans quantifier ses résultats, privant l'algorithme de signaux de performance qui lui permettent de calibrer votre niveau d'expérience.
      </P>
      <P>
        Une quatrième erreur fréquente chez les candidats francophones est de compléter les champs "résumé" ou "about" de façon trop courte ou trop générique. Ce champ est souvent l'input principal du modèle sémantique dans les systèmes de matching avancés : un résumé riche, précis et calibré sur les mots-clés du marché ciblé améliore le score de matching de façon disproportionnée par rapport au temps investi dans sa rédaction.
      </P>

      <H2 id="pratique">Ce qu'il faut faire concrètement aujourd'hui</H2>
      <P>
        La première action est de créer ou de mettre à jour une version anglaise de votre CV dans un format linéaire sans tableaux ni colonnes, avec des titres de postes en anglais correspondant aux équivalents de votre marché cible, des descriptions orientées résultats avec des métriques chiffrées, et une liste exhaustive de vos compétences techniques et linguistiques.
      </P>
      <P>
        La deuxième action est de compléter votre profil sur les plateformes de recherche d'emploi que vous utilisez à 100 %, sans laisser de champs vides. Les champs de compétences, de langues, de formations et de certifications doivent être exhaustifs.
      </P>
      <P>
        La troisième action est d'analyser les offres d'emploi qui correspondent à votre profil et d'identifier les termes et compétences qui y reviennent fréquemment. Ces termes doivent apparaître dans votre CV et votre profil, dans leur contexte réel (pas artificiellement insérés pour gonfler un score).
      </P>

      <FAQ items={[
        {
          q: "Mon CV en français peut-il être soumis à des offres en anglais ?",
          a: "Techniquement oui, mais avec un impact significatif sur votre score de matching. Un ATS anglophone aura des difficultés à extraire et à matcher les entités d'un document en français avec des offres en anglais. La solution n'est pas de traduire votre CV mot à mot, mais de créer une version anglaise qui reflète votre expérience avec la terminologie du marché cible. Ces deux versions coexistent et sont utilisées selon le marché ciblé."
        },
        {
          q: "Un diplôme français est-il reconnu par les ATS des entreprises américaines ?",
          a: "Les diplômes des grandes écoles françaises (HEC, Polytechnique, Sciences Po) sont de plus en plus reconnus par les ATS des grandes entreprises internationales qui ont une présence en Europe. En revanche, les diplômes universitaires français moins connus peuvent ne pas être dans la base de données des ATS nord-américains. La solution est de lister explicitement le niveau de diplôme en termes anglophones (Master's degree équivalent, Bachelor's degree) en plus du nom officiel de l'établissement."
        },
        {
          q: "Comment savoir si mon CV est bien lu par les ATS ?",
          a: "Plusieurs outils en ligne permettent de simuler le parsing ATS de votre CV, notamment Jobscan, Resume Worded et Enhancv. Ces outils copient le comportement des ATS courants et vous montrent comment votre CV est extrait et quel score de matching il obtient contre une offre spécifique. Un test rapide contre une offre qui correspond précisément à votre profil révèle souvent des problèmes de parsing que vous n'auriez pas détectés autrement."
        },
        {
          q: "Le matching IA remplace-t-il la lecture humaine du CV ?",
          a: "Non, mais il la précède. Le matching IA détermine quels CVs sont montrés aux recruteurs humains. Un CV qui ne passe pas le filtre automatique ne sera jamais lu par un humain. Un CV qui passe le filtre sera ensuite évalué par un humain selon des critères beaucoup plus nuancés que ceux de l'algorithme. L'objectif du matching IA dans votre candidature est simplement de passer ce premier filtre, pas d'impressionner un algorithme."
        },
      ]} />

      <Conclusion>
        <P>
          Comprendre le matching IA, c'est comprendre les règles du jeu. Ce n'est pas un système magique qui évalue votre valeur réelle : c'est un filtre qui vérifie si votre document correspond aux patterns qu'il reconnaît. Les candidats francophones qui adaptent leurs candidatures à ces règles sans sacrifier l'authenticité de leur expérience passent ce filtre régulièrement, là où leurs équivalents mal adaptés sont systématiquement rejetés avant qu'un humain ait lu une seule ligne.
        </P>
        <P>
          JobConnect AI utilise un modèle de matching calibré sur des données de recrutement international qui tient compte de la transférabilité des compétences entre marchés et de l'ouverture géographique réelle des offres. Le Resume Builder vous aide à reformater votre expérience dans le vocabulaire et la structure qui maximisent votre score de matching sur les offres internationales.
        </P>
      </Conclusion>

    </article>
  )
}
