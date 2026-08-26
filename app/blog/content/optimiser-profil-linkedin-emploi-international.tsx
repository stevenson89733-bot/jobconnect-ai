/* eslint-disable react/no-unescaped-entities */
import { H2, H3, P, KeyTakeaway, TOC, FAQ, StatHook, Conclusion } from '@/components/blog/ArticleComponents'

export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <StatHook>Une étude LinkedIn France publiée en 2025 indique que les profils francophones qui rédigent leur résumé en anglais reçoivent 3,8 fois plus de sollicitations de recruteurs internationaux que les profils équivalents rédigés uniquement en français. Pourtant, seulement 12 % des cadres africains actifs sur LinkedIn et 23 % des cadres français ont adopté cette pratique.</StatHook>

      <TOC items={[
        { id: 'pourquoi-linkedin', label: 'Pourquoi LinkedIn est incontournable pour l\'emploi international' },
        { id: 'quand-anglais', label: 'Quand passer son profil en anglais et quand garder le français' },
        { id: 'titre', label: 'Rédiger un titre qui attire les recruteurs étrangers' },
        { id: 'experience', label: 'Présenter son expérience pour un recruteur international' },
        { id: 'mots-cles', label: 'Les mots-clés et hashtags pour le remote international' },
        { id: 'erreurs', label: 'Erreurs classiques sur les profils francophones' },
        { id: 'parametres', label: 'Les paramètres de confidentialité et de visibilité à configurer' },
      ]} />

      <P drop>
        LinkedIn est la plateforme sur laquelle la majorité des recruteurs internationaux cherchent activement des candidats pour des postes remote. Ce n'est pas une plateforme parmi d'autres : c'est le premier outil de sourcing des équipes RH des entreprises européennes et nord-américaines qui recrutent à l'international. Un profil LinkedIn mal optimisé pour ce contexte est, dans les faits, un profil invisible pour les recruteurs qui vous cherchent. Ce guide s'adresse aux candidats francophones d'Afrique, de France, de Belgique, de Suisse et des Caraïbes qui veulent que leur profil soit trouvé par les bons recruteurs internationaux, et qui veulent que la première impression qu'il donne soit à la hauteur de leur expérience réelle.
      </P>

      <H2 id="pourquoi-linkedin">Pourquoi LinkedIn est incontournable pour l'emploi international</H2>
      <P>
        La plupart des postes remote internationaux ne sont jamais publiés sur des jobboards publics. Ils sont pourvus par du sourcing direct : un recruteur cherche activement des profils qui correspondent à ses critères, identifie les candidats les plus pertinents, et les contacte directement par message LinkedIn. Ce processus se déroule sans que le candidat ait postulé quoi que ce soit. Un profil LinkedIn optimisé génère des opportunités que vous ne cherchiez pas, parce que les recruteurs vous trouvent plutôt que l'inverse.
      </P>
      <P>
        Pour les candidats francophones basés hors des grands marchés de l'emploi européens, cette dynamique est particulièrement précieuse. Vous n'avez pas de réseau professionnel local dans le pays de l'employeur. Vous ne participez pas aux événements sectoriels où les recruteurs rencontrent des candidats. LinkedIn est souvent le seul canal par lequel un recruteur basé à Berlin, Amsterdam ou Toronto peut vous trouver et vous considérer. Traiter son profil LinkedIn comme un document secondaire, moins important que son CV, est donc une erreur stratégique majeure dans une recherche d'emploi internationale.
      </P>

      <H2 id="quand-anglais">Quand passer son profil en anglais et quand garder le français</H2>
      <P>
        La réponse dépend de votre marché cible. Si vous ciblez exclusivement des employeurs francophones (entreprises françaises, belges, suisses, ou organisations internationales francophones), un profil en français est parfaitement adapté et peut même être préférable pour certains postes où la maîtrise du français est une compétence clé. Si vous ciblez des employeurs anglophones ou des entreprises multinationales qui recrutent en anglais, un profil entièrement en anglais est nécessaire pour être visible dans leurs recherches.
      </P>
      <P>
        La situation la plus courante pour les candidats francophones qui cherchent un emploi remote international est une cible mixte : des entreprises françaises qui recrutent à l'international ET des entreprises étrangères qui acceptent des candidats francophones. Dans ce cas, la solution la plus efficace est un profil bilingue : résumé en anglais suivi d'une version courte en français, titres de postes dans les deux langues, et une liste de compétences en anglais avec la mention du français comme langue de travail. Ce profil bilingue capture les deux audiences sans sacrifier la visibilité auprès de l'une pour favoriser l'autre.
      </P>
      <P>
        Une règle simple pour trancher : si plus de la moitié des offres d'emploi que vous ciblez sont rédigées en anglais, votre profil doit être prioritairement en anglais. Si moins d'un tiers sont en anglais, gardez le français en priorité et ajoutez de l'anglais comme couche secondaire. Dans tous les autres cas, optez pour le bilinguisme.
      </P>

      <H2 id="titre">Rédiger un titre qui attire les recruteurs étrangers</H2>
      <P>
        Le titre LinkedIn, le champ de 220 caractères qui apparaît sous votre nom, est l'élément le plus visible de votre profil sur l'ensemble de la plateforme. Il apparaît dans les résultats de recherche des recruteurs, dans les messageries, sous vos commentaires et dans les demandes de connexion. C'est le premier texte qu'un recruteur lit sur vous, et c'est souvent le seul s'il ne clique pas sur votre profil.
      </P>
      <P>
        Un titre efficace pour un candidat francophone en recherche d'emploi international contient trois éléments. D'abord, votre identité fonctionnelle dans la terminologie du marché cible : "Data Analyst" plutôt que "Analyste de données", "Project Manager" plutôt que "Chargé de projet", "Full-Stack Developer" plutôt que "Développeur web". Ensuite, votre spécialisation ou votre différenciateur : "Python, SQL, Tableau" pour un analyste, "B2B SaaS" pour un commercial, "Fintech" pour un profil finance. Enfin, un signal de disponibilité remote : "Open to remote worldwide" ou "Remote-first" ou "Available globally".
      </P>
      <P>
        Exemples concrets de titres optimisés : "Senior Data Analyst | Python, SQL, Power BI | Open to remote worldwide" ; "Product Manager | B2B SaaS | Français et anglais | Remote-first" ; "Financial Controller | IFRS, SAP | Available globally | UTC+1". Chacun de ces titres communique en moins de quatre secondes de lecture ce que fait le candidat, ce qui le différencie, et qu'il est disponible pour des postes remote internationaux.
      </P>
      <KeyTakeaway>Votre titre LinkedIn est votre argument commercial en 220 caractères. Il doit répondre à trois questions en quelques secondes : qui êtes-vous professionnellement, qu'est-ce qui vous distingue, et êtes-vous disponible pour des postes remote internationaux ? Si votre titre actuel ne répond pas aux trois, c'est votre première priorité d'optimisation.</KeyTakeaway>

      <H2 id="experience">Présenter son expérience pour un recruteur international</H2>
      <P>
        La différence fondamentale entre un profil optimisé pour un recruteur local et un profil optimisé pour un recruteur international est la manière dont l'expérience est présentée. Un recruteur local connaît les entreprises où vous avez travaillé, comprend le contexte de votre marché, et peut interpréter votre parcours dans ce contexte. Un recruteur international qui ne connaît ni votre employeur, ni votre marché, a besoin que vous lui fournissiez ce contexte directement dans votre profil.
      </P>
      <P>
        Pour chaque expérience significative, ajoutez une phrase de contextualisation qui permet à un recruteur étranger de situer l'entreprise et l'enjeu de votre rôle. "Directeur commercial chez ABC Services" ne dit rien à un recruteur basé à Londres. "Head of Sales at ABC Services, the leading B2B telecom reseller in Francophone West Africa, managing a portfolio of 120 enterprise clients and a team of 12 account managers" fournit immédiatement l'information nécessaire pour évaluer la pertinence de cette expérience.
      </P>
      <P>
        Remplacez systématiquement les listes de responsabilités par des accomplissements quantifiés. "Responsable de la croissance du portefeuille clients" est une description de poste. "Grew the client portfolio from €800K to €2.1M ARR in 18 months through structured account management and upsell campaigns" est un accomplissement. La différence de signal entre les deux est considérable pour tout recruteur habitué à lire des profils orientés résultats.
      </P>

      <H2 id="mots-cles">Les mots-clés et hashtags pour le remote international</H2>
      <P>
        Les mots-clés qui améliorent votre visibilité dans les recherches des recruteurs internationaux doivent être présents dans votre titre, votre résumé, vos descriptions d'expériences et votre section de compétences. La répétition naturelle d'un terme dans plusieurs sections de votre profil renforce le signal envoyé à l'algorithme LinkedIn. L'objectif n'est pas de remplir votre profil de mots-clés artificiellement insérés, mais de s'assurer que les termes que les recruteurs cherchent apparaissent dans les endroits où l'algorithme les indexe.
      </P>
      <P>
        Les termes les plus recherchés par les recruteurs de postes remote internationaux dans les domaines à forte demande incluent, pour la tech : "React," "Node.js," "Python," "AWS," "DevOps," "Agile," "CI/CD," "Figma," "UX design." Pour la finance et les opérations : "financial modeling," "FP&A," "SAP," "Netsuite," "process improvement," "KPI." Pour le marketing et le commercial : "SEO," "SEM," "paid acquisition," "B2B SaaS," "CRM," "HubSpot," "pipeline management." Assurez-vous que les termes pertinents pour votre domaine sont présents dans votre section Compétences et dans au moins deux endroits dans le corps de votre profil.
      </P>
      <P>
        Les hashtags sur LinkedIn ont un impact limité sur la visibilité des profils (ils sont surtout utiles pour les publications), mais les suivre activement vous permet d'apparaître dans les recommandations de personnes qui suivent les mêmes hashtags, et de rester informé des discussions dans votre domaine. Pour les candidats francophones en recherche d'emploi remote, suivre "#remotework," "#remotejobs," "#distributed," "#globaltalent" et les hashtags de votre domaine technique en anglais vous connecte aux conversations pertinentes.
      </P>

      <H2 id="erreurs">Erreurs classiques sur les profils francophones</H2>
      <P>
        La première erreur est la photo de profil inadaptée à un contexte professionnel international. Les standards varient selon les marchés : une photo très formelle (costume sombre, fond neutre strict) est perçue positivement dans certains marchés et comme trop rigide dans d'autres. La photo idéale est professionnelle sans être austère : une tenue de travail normale, un fond neutre ou légèrement flouté, et une expression directe et accessible. Évitez les photos de groupe, les photos de vacances, ou les photos avec des filtres qui altèrent significativement votre apparence.
      </P>
      <P>
        La deuxième erreur est de laisser la section "À propos" vide ou remplie avec une seule phrase générique. Le résumé est l'espace où vous expliquez qui vous êtes professionnellement à quelqu'un qui ne vous connaît pas, dans un contexte où vous n'avez pas d'autre moyen de communication. Un résumé vide signale soit un manque d'effort, soit une absence de réflexion sur son positionnement professionnel, deux signaux négatifs pour un recruteur international.
      </P>
      <P>
        La troisième erreur est de ne pas actualiser son profil régulièrement. LinkedIn récompense l'activité récente dans son algorithme de visibilité : un profil mis à jour récemment, avec des publications récentes, est plus visible dans les résultats de recherche qu'un profil statique. Une mise à jour mensuelle des compétences ou des accomplissements récents, et quelques publications par mois, maintiennent la visibilité algorithmique de votre profil sans nécessiter un investissement de temps significatif.
      </P>

      <H2 id="parametres">Les paramètres de confidentialité et de visibilité à configurer</H2>
      <P>
        Le paramètre le plus important à configurer est "Open to Work." En mode privé (visible uniquement aux recruteurs qui utilisent LinkedIn Recruiter), ce paramètre fait apparaître votre profil dans les résultats de recherche filtrés par disponibilité sans afficher le bandeau vert sur votre photo de profil, ce qui est préférable si vous ne souhaitez pas que votre employeur actuel soit informé de votre recherche. En mode public, le bandeau vert est visible par tous mais augmente légèrement la visibilité globale de votre profil.
      </P>
      <P>
        Activez également le paramètre "Partager les mises à jour de profil avec le réseau" lors d'une recherche active : il notifie vos connexions de chaque mise à jour de profil, générant une visibilité organique supplémentaire auprès des personnes qui vous connaissent déjà et qui pourraient vous référer à des opportunités. Configurez vos alertes d'emploi pour les postes remote dans votre domaine et en anglais ou dans votre langue cible : LinkedIn envoie des notifications quotidiennes ou hebdomadaires pour les nouvelles offres correspondant à vos critères, ce qui vous permet de postuler tôt et d'augmenter vos chances d'être vu par un recruteur.
      </P>

      <FAQ items={[
        {
          q: "Faut-il répondre aux messages LinkedIn des recruteurs même quand leur offre ne m'intéresse pas ?",
          a: "Oui, brièvement et poliment. Décliner une offre avec un message courtois ('Merci pour votre message. Ce poste ne correspond pas à mes priorités actuelles, mais je reste ouvert à des opportunités dans [votre domaine] à l'avenir.') construit votre réputation professionnelle, maintient la relation avec le recruteur, et signale à l'algorithme LinkedIn que vous êtes actif sur la plateforme. Les recruteurs qui vous contactent une fois et reçoivent une réponse positive se souviennent de vous pour de futures opportunités."
        },
        {
          q: "Comment savoir si mon profil est bien optimisé pour les recherches internationales ?",
          a: "La mesure la plus directe est le nombre de visites de profil que vous recevez par semaine de recruteurs basés hors de votre pays. LinkedIn Premium vous montre la liste des personnes qui ont visité votre profil avec leur titre et leur localisation. Si vous recevez peu de visites de recruteurs internationaux, votre profil n'est pas encore suffisamment optimisé pour les recherches cross-border. Augmenter la complétude de votre profil à 100 %, enrichir votre résumé de mots-clés anglophones, et publier régulièrement du contenu en anglais sont les trois actions qui ont le plus d'impact sur cette métrique."
        },
        {
          q: "Combien de connexions LinkedIn faut-il avoir pour être bien visible ?",
          a: "LinkedIn catégorise les connexions en trois niveaux et votre réseau de connexions directes influence votre visibilité auprès de leurs propres connexions. Au-delà d'environ 500 connexions, LinkedIn affiche '500+' sur votre profil, ce qui est un signal de crédibilité pour les recruteurs. Pour atteindre ce seuil rapidement, connectez-vous avec des collègues actuels et anciens, des participants de formations ou de conférences, et des professionnels de votre domaine avec qui vous avez eu des échanges significatifs. La qualité des connexions (des professionnels de votre domaine dans vos marchés cibles) compte plus que la quantité brute."
        },
        {
          q: "LinkedIn est-il aussi utilisé par les recruteurs africains pour les postes remote ?",
          a: "Oui, de plus en plus. Les recruteurs des startups et des multinationales basées en Afrique qui recrutent pour des postes remote utilisent LinkedIn de la même façon que leurs homologues européens. En revanche, pour les marchés d'Afrique francophone spécifiquement, des plateformes locales comme Jobafrica, Africawork et LinkedIn coexistent. Une stratégie de visibilité complète pour un candidat africain francophone combine l'optimisation LinkedIn pour le sourcing international avec une présence sur les jobboards locaux pour les recruteurs africains."
        },
      ]} />

      <Conclusion>
        <P>
          L'optimisation du profil LinkedIn pour l'emploi international est un travail de deux à trois heures qui peut transformer votre visibilité auprès des recruteurs pour les mois suivants. Un titre optimisé, un résumé en anglais avec les bons mots-clés, des descriptions d'expériences orientées résultats, et les paramètres de visibilité correctement configurés positionnent votre profil de manière compétitive dans un marché international où la majorité de vos concurrents n'ont pas fait ce travail.
        </P>
        <P>
          L'outil Career Coach de JobConnect AI analyse votre profil LinkedIn et génère des recommandations personnalisées sur le titre, le résumé, les mots-clés et les descriptions d'expériences, calibrées pour vos marchés cibles et vos types de postes.
        </P>
      </Conclusion>

    </article>
  )
}
