/* eslint-disable react/no-unescaped-entities */
import { H2, H3, P, KeyTakeaway, TOC, FAQ, StatHook, Conclusion } from '@/components/blog/ArticleComponents'

export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <StatHook>En 2025, Wise, Deel et Remote ont traité collectivement plus de 12 milliards de dollars de paiements pour des travailleurs indépendants internationaux, signe que travailler à distance pour une entreprise étrangère est devenu une infrastructure mature, pas une exception.</StatHook>

      <TOC items={[
        { id: 'legal', label: 'Cadre juridique : comprendre votre situation réelle' },
        { id: 'contrat', label: "Types de contrats internationaux et ce qu'ils impliquent" },
        { id: 'paiement', label: 'Recevoir et gérer des paiements internationaux' },
        { id: 'fiscal', label: 'Fiscalité et déclaration des revenus étrangers' },
        { id: 'protection', label: "Protection sociale quand l'employeur est à l'étranger" },
        { id: 'negocier', label: "Négocier un contrat étranger : ce qui est standard, ce qui ne l'est pas" },
        { id: 'pratique', label: 'La vie pratique en télétravail international' },
      ]} />

      <P drop>
        Travailler pour une entreprise étrangère sans déménager soulève des questions pratiques que la plupart des guides sur le télétravail ignorent complètement. Comment signer un contrat avec une entité juridique dans un autre pays ? Comment recevoir un salaire en euros ou en dollars sur un compte bancaire local ? Quelles cotisations sociales devez-vous verser, et à qui ? Comment déclarer des revenus étrangers dans votre pays de résidence ? Ce guide répond à ces questions dans l'ordre où elles se posent dans la réalité d'une collaboration internationale, des premiers contrats jusqu'aux situations durables.
      </P>
      <P>
        L'objectif n'est pas de fournir un avis juridique ou fiscal, qui doit toujours être personnalisé selon votre pays de résidence et votre situation spécifique, mais de vous donner le cadre conceptuel pour poser les bonnes questions, aux bonnes personnes, avant de signer quoi que ce soit.
      </P>

      <H2 id="legal">Cadre juridique : comprendre votre situation réelle</H2>
      <P>
        Quand vous travaillez pour une entreprise étrangère depuis votre pays de résidence, deux systèmes juridiques sont simultanément pertinents : le droit du travail et la fiscalité de votre pays de résidence, et la législation du pays où l'entreprise est enregistrée. La règle générale est que votre statut fiscal et vos obligations sociales sont déterminés par votre pays de résidence, tandis que vos obligations contractuelles vis-à-vis de l'employeur sont régies par la loi spécifiée dans votre contrat.
      </P>
      <P>
        Cette dualité crée une situation asymétrique : vous pouvez signer un contrat régi par le droit français, britannique ou américain, mais vos cotisations à la sécurité sociale, votre impôt sur le revenu et vos droits aux allocations chômage restent entièrement déterminés par votre pays de résidence. Il est fréquent que des candidats découvrent cette réalité tardivement, après avoir signé un contrat qui ne prévoit aucune couverture sociale dans leur pays.
      </P>
      <KeyTakeaway>Le pays dans lequel vous résidez fiscalement détermine vos obligations fiscales et sociales, indépendamment du pays d'enregistrement de votre employeur. Ne confondez pas la loi qui régit votre contrat commercial avec la loi qui régit vos obligations personnelles de résidence.</KeyTakeaway>

      <H2 id="contrat">Types de contrats internationaux et ce qu'ils impliquent</H2>
      <P>
        Il existe trois structures contractuelles principales pour travailler à distance pour une entreprise étrangère. Comprendre laquelle s'applique à votre situation change radicalement ce que vous devez faire en termes de compliance.
      </P>
      <H3>Le contrat de prestation de services (freelance ou indépendant)</H3>
      <P>
        C'est la structure la plus courante pour les premières collaborations internationales. Vous facturez la société étrangère en tant que personne physique ou en tant qu'entreprise individuelle. Le contrat est un contrat commercial, pas un contrat de travail : vous n'êtes pas salarié, vous êtes prestataire. Cela signifie que vous ne bénéficiez d'aucune protection liée au droit du travail (préavis légal, indemnités de licenciement, droits aux congés payés) dans le pays de l'entreprise. En revanche, vous avez le contrôle total sur votre temps, vos autres clients et votre mode de facturation.
      </P>
      <H3>L'Employer of Record (EOR)</H3>
      <P>
        Un EOR est une société tierce qui vous emploie formellement dans votre pays de résidence pour le compte de l'entreprise étrangère. Vous avez un contrat de travail local, soumis au droit du travail de votre pays. L'EOR gère la paie, les cotisations sociales et la compliance locale. L'entreprise étrangère paie l'EOR, qui vous reverse votre salaire net selon les règles locales. Dei, Remote, Papaya Global et Multiplier sont des exemples de plateformes EOR actives dans de nombreux pays. Cette structure est plus protectrice pour le candidat et de plus en plus privilégiée par les entreprises européennes qui veulent recruter à l'international sans ouvrir de structure locale.
      </P>
      <H3>L'emploi dans une filiale locale</H3>
      <P>
        Si l'entreprise étrangère a une entité juridique dans votre pays de résidence, il est possible d'être embauché directement par cette filiale avec un contrat de travail entièrement local. C'est la structure la plus simple et la plus protectrice pour le candidat, mais elle suppose que l'entreprise ait fait l'investissement de créer une structure légale dans votre pays, ce qui n'est pas le cas de la majorité des entreprises qui recrutent internationalement.
      </P>

      <H2 id="paiement">Recevoir et gérer des paiements internationaux</H2>
      <P>
        La question du paiement est souvent la première préoccupation pratique des candidats qui entrent dans une collaboration internationale. Les virements bancaires internationaux classiques (SWIFT) fonctionnent mais sont coûteux : les frais peuvent atteindre 2 à 4 % de la transaction entre les frais de change et les frais bancaires des deux côtés.
      </P>
      <H3>Wise</H3>
      <P>
        Wise (anciennement TransferWise) est la solution privilégiée par la majorité des freelances internationaux. Wise permet d'ouvrir un compte multidevises qui reçoit des paiements en euros, dollars, livres sterling ou autres devises comme si vous aviez un compte bancaire local dans ces pays. La conversion vers la monnaie locale se fait au taux interbancaire avec des frais transparents, généralement inférieurs à 0,5 % pour les devises principales. La grande majorité des entreprises étrangères sont familières avec Wise et l'acceptent comme moyen de paiement standard.
      </P>
      <H3>Deel et Remote</H3>
      <P>
        Quand la collaboration est structurée via une plateforme EOR comme Deel ou Remote, le paiement est entièrement géré par la plateforme. Vous recevez votre salaire net dans votre compte bancaire local sans avoir à gérer de conversion ou de virement international. La plateforme gère également la génération des fiches de paie et le versement des cotisations sociales locales.
      </P>
      <H3>PayPal et alternatives</H3>
      <P>
        PayPal est accepté par certaines entreprises mais applique des taux de change défavorables et des frais de retrait qui peuvent représenter 3 à 5 % du montant total. Il est préférable de négocier un paiement via Wise ou un virement bancaire direct et de convertir soi-même. Pour les montants importants, la différence de frais est significative sur une année entière.
      </P>
      <KeyTakeaway>Wise est le standard de fait pour les freelances internationaux qui souhaitent recevoir des paiements en devises étrangères à des frais raisonnables. Négocier son utilisation dès le début de la collaboration évite les discussions complexes plus tard sur les modalités de paiement.</KeyTakeaway>

      <H2 id="fiscal">Fiscalité et déclaration des revenus étrangers</H2>
      <P>
        Les revenus perçus d'une entreprise étrangère sont imposables dans votre pays de résidence fiscale dans la quasi-totalité des cas. La majorité des pays imposent leurs résidents fiscaux sur leurs revenus mondiaux, ce qui inclut les revenus d'activité provenant de sources étrangères. Les conventions fiscales bilatérales entre votre pays et le pays de l'entreprise peuvent créer des mécanismes de crédit d'impôt ou d'exonération partielle pour éviter la double imposition, mais elles ne suppriment pas l'obligation déclarative dans votre pays de résidence.
      </P>
      <P>
        En pratique, cela signifie que vous devez déclarer vos revenus étrangers dans votre déclaration de revenus annuelle, dans la catégorie et selon les modalités prévues par votre administration fiscale locale pour les revenus d'activité étrangers. Dans de nombreux pays africains et asiatiques, cette catégorie existe formellement mais les procédures sont peu documentées. Un expert-comptable local familier avec les revenus d'activité étrangers est le conseil le plus fiable pour votre situation spécifique.
      </P>
      <P>
        Pour les freelances dont les revenus internationaux sont significatifs et réguliers, envisager la création d'une entreprise individuelle ou d'une structure simplifiée peut offrir des avantages fiscaux (déductibilité des charges professionnelles) et une séparation plus claire entre revenus personnels et revenus professionnels.
      </P>

      <H2 id="protection">Protection sociale quand l'employeur est à l'étranger</H2>
      <P>
        La protection sociale est le domaine où les différences entre statut salarié local et prestataire indépendant international sont les plus importantes. Sous un contrat de prestation de services, vous n'avez pas accès aux protections sociales liées au statut salarié : pas de couverture chômage, pas de congé maladie rémunéré, pas de cotisations retraite versées par un employeur. Vous êtes seul responsable de votre protection sociale.
      </P>
      <P>
        Cela implique plusieurs actions pratiques. Premièrement, souscrire à une assurance maladie privée si la couverture publique de votre pays n'est pas accessible aux travailleurs indépendants ou est insuffisante. Deuxièmement, constituer une réserve de trésorerie équivalant à deux à trois mois de revenus pour faire face aux interruptions de contrat ou aux périodes de transition. Troisièmement, mettre en place dès le début une épargne retraite volontaire, puisqu'aucun employeur ne cotise pour vous.
      </P>
      <P>
        Sous structure EOR, ces risques sont largement mitigés : le contrat local prévoit des cotisations sociales locales, des congés payés et une couverture chômage selon le droit local. Le coût de cette protection est intégré dans les frais de service EOR payés par l'entreprise, ce qui fait de l'EOR une structure plus protectrice même si le salaire brut affiché peut paraître légèrement inférieur à un tarif freelance équivalent.
      </P>

      <H2 id="negocier">Négocier un contrat étranger : ce qui est standard, ce qui ne l'est pas</H2>
      <P>
        Plusieurs clauses dans les contrats internationaux méritent une attention particulière avant signature. Les clauses de propriété intellectuelle (IP assignment) transfèrent généralement à l'entreprise la totalité des droits sur le travail produit dans le cadre de la mission. C'est standard et attendu pour le travail effectué dans le cadre du contrat, mais vérifiez que la formulation ne couvre pas votre travail personnel ou vos projets existants.
      </P>
      <P>
        Les clauses de non-concurrence (non-compete) sont courantes dans les contrats américains mais ont une valeur juridique variable selon les pays. Dans certaines juridictions, elles sont difficilement exécutoires contre des prestataires indépendants. Il est légitime de demander à restreindre la portée géographique ou sectorielle d'une clause de non-concurrence trop large avant de signer.
      </P>
      <P>
        La devise de facturation et les modalités de paiement (délai, moyen, traitement des frais de change) doivent être explicitement précisées dans le contrat. Une clause vague sur le "paiement mensuel" sans précision de devise, de délai et de mécanisme crée des malentendus systématiques.
      </P>

      <H2 id="pratique">La vie pratique en télétravail international</H2>
      <P>
        Au-delà des aspects juridiques et financiers, travailler pour une entreprise étrangère au quotidien requiert des adaptations pratiques. Les outils de communication asynchrone (Slack, Notion, Linear, Loom) sont le cœur opérationnel de la plupart des équipes distribuées. Maîtriser ces outils et adopter les normes de communication écrite de l'équipe est aussi important que la qualité technique du travail produit.
      </P>
      <P>
        La gestion du fuseau horaire mérite une attention proactive. Définissez clairement avec votre manager vos heures de disponibilité, les créneaux où vous participez aux réunions synchrones, et les délais de réponse attendus en dehors de ces créneaux. Les équipes distribuées les plus efficaces ont des normes explicites sur ces points, et si votre équipe ne les a pas encore formalisées, prendre l'initiative de les définir pour vous-même est une contribution à la culture d'équipe.
      </P>

      <FAQ items={[
        {
          q: 'Quelle est la différence entre un EOR et une agence de portage salarial ?',
          a: "Ces deux structures ont des fonctions similaires mais des origines différentes. Le portage salarial est une institution légale française qui permet à un consultant indépendant d'être salarié d'une société de portage qui facture à sa place et lui verse un salaire après déduction des charges. Un EOR international est une structure similaire mais conçue spécifiquement pour les collaborations transfrontalières, avec une infrastructure juridique et bancaire dans de nombreux pays. Les deux permettent d'avoir un contrat de travail tout en gardant une activité indépendante, mais l'EOR est mieux adapté aux collaborations avec des entreprises étrangères qui ne sont pas familières avec le cadre français du portage."
        },
        {
          q: "Dois-je informer l'administration fiscale de mon pays que je travaille pour une entreprise étrangère ?",
          a: "Dans la plupart des pays, les revenus étrangers doivent être déclarés dans la déclaration de revenus annuelle. Il n'y a généralement pas d'obligation de notification préalable à l'administration fiscale avant de commencer une mission internationale, mais la déclaration annuelle est obligatoire. Certains pays ont des régimes spéciaux pour les revenus d'activité étrangers avec des formulaires dédiés. Renseignez-vous auprès de l'administration fiscale de votre pays ou d'un conseiller fiscal local avant votre premier encaissement."
        },
        {
          q: 'Comment gérer les fluctuations de change quand je suis payé en euros ou en dollars ?',
          a: "La fluctuation de change est un risque réel pour les prestataires payés en devise étrangère dont les dépenses sont en monnaie locale. Plusieurs stratégies permettent de le gérer : facturer dans la devise de l'entreprise et convertir mensuellement en conservant une réserve en devise forte pour absorber les fluctuations, ou négocier une clause d'indexation dans le contrat pour les missions longues. Dans les périodes de forte volatilité, convertir par tranches plutôt qu'en une seule fois peut réduire l'impact des pics de marché."
        },
        {
          q: 'Est-il possible de travailler simultanément pour plusieurs entreprises étrangères ?',
          a: "En tant que prestataire indépendant, oui, sous réserve de vérifier qu'aucun contrat en cours ne contient de clause d'exclusivité. Travailler pour plusieurs clients est courant et reconnu dans le cadre du freelance international. Si vous êtes sous contrat EOR, le contrat de travail peut inclure une clause de non-concurrence ou d'exclusivité. Vérifiez les termes précis de chaque contrat et signalez systématiquement à chaque client les autres activités professionnelles significatives, même si la transparence n'est pas formellement requise."
        },
      ]} />

      <Conclusion>
        <P>
          Travailler à distance pour une entreprise étrangère est une opportunité réelle, mais c'est aussi un arrangement qui demande une préparation sérieuse sur les aspects juridiques, fiscaux et financiers. Les professionnels qui abordent ces aspects de façon proactive, en comprenant leur statut, en choisissant la bonne structure contractuelle et en gérant leurs obligations locales correctement, construisent des carrières internationales durables sans mauvaises surprises.
        </P>
        <P>
          JobConnect AI regroupe des offres remote d'entreprises qui ont déjà mis en place l'infrastructure pour recruter à l'international, que ce soit via EOR, contrat freelance ou filiale locale. Chaque offre indique clairement la structure envisagée et les contraintes géographiques, pour que vous puissiez évaluer immédiatement si la collaboration est réalisable dans votre situation.
        </P>
      </Conclusion>

    </article>
  )
}
