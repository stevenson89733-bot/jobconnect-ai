/* eslint-disable react/no-unescaped-entities */
import { H2, H3, P, KeyTakeaway, TOC, FAQ, StatHook, Conclusion } from '@/components/blog/ArticleComponents'

export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <StatHook>En 2025, 68 % des candidats étrangers ayant obtenu un emploi remote pour une entreprise européenne ont déclaré avoir choisi le statut de prestataire indépendant plutôt qu'un contrat de travail, principalement en raison de la complexité administrative des permis de travail transfrontaliers, selon une étude de Deel publiée en 2026.</StatHook>

      <TOC items={[
        { id: 'statuts', label: "Comprendre les statuts : auto-entrepreneur, portage, EOR" },
        { id: 'visa-talent', label: "Le Visa Talent en France : pour qui et comment" },
        { id: 'belgique-suisse', label: "Travailler depuis la Belgique ou la Suisse pour l'étranger" },
        { id: 'rassurer-employeur', label: "Rassurer un employeur européen sur votre statut légal" },
        { id: 'erreurs', label: "Erreurs classiques des candidats francophones" },
        { id: 'negocier', label: "Négocier le cadre administratif dès l'offre" },
        { id: 'durable', label: "Construire une situation légale durable" },
      ]} />

      <P drop>
        La question du visa et du statut légal est l'une des plus fréquemment mal comprises par les candidats francophones qui cherchent à travailler pour des entreprises étrangères. La confusion vient d'une hypothèse qui semble intuitive mais est souvent fausse : que travailler pour un employeur étranger nécessite une autorisation de travail dans le pays de cet employeur. En réalité, pour la grande majorité des arrangements de télétravail international, la question du visa concerne votre pays de résidence, pas le pays de l'entreprise. Ce guide explique la réalité juridique, les statuts disponibles selon votre pays de résidence, et comment présenter votre situation à un employeur européen de façon à accélérer le processus plutôt qu'à le bloquer.
      </P>

      <H2 id="statuts">Comprendre les statuts : auto-entrepreneur, portage, EOR</H2>
      <P>
        Pour un professionnel basé en France qui travaille à distance pour une entreprise étrangère, trois structures contractuelles principales sont disponibles. La compréhension de leurs différences est essentielle avant de postuler à quoi que ce soit.
      </P>
      <H3>Le statut auto-entrepreneur (micro-entrepreneur)</H3>
      <P>
        Le statut auto-entrepreneur permet à tout résident fiscal français de facturer des clients étrangers en tant qu'entreprise individuelle, avec un régime fiscal simplifié basé sur un pourcentage fixe du chiffre d'affaires. Les plafonds de chiffre d'affaires annuel (77 700 euros pour les prestations de services en 2026) couvrent la grande majorité des situations de télétravail international pour les débuts de carrière internationale. Ce statut est la structure la plus simple à mettre en place, ne nécessite pas d'avocat ni de comptable pour la création, et est parfaitement adapté aux premières collaborations avec des clients étrangers.
      </P>
      <H3>Le portage salarial</H3>
      <P>
        Le portage salarial est une institution légale française qui permet à un consultant indépendant d'être salarié d'une société de portage, qui facture à sa place et lui verse un salaire après déduction des charges sociales et de sa commission. L'avantage principal du portage est d'accéder au statut de salarié (droits au chômage, cotisations retraite, arrêt maladie rémunéré) tout en conservant une activité indépendante. Son inconvénient est son coût : la société de portage prélève généralement entre 5 et 10 % du chiffre d'affaires facturé.
      </P>
      <H3>L'Employer of Record (EOR)</H3>
      <P>
        Lorsque l'entreprise étrangère préfère une relation de travail formalisée plutôt qu'un contrat de prestation, elle peut vous employer via une plateforme EOR (Deel, Remote, Papaya Global). L'EOR vous emploie localement en France, gère votre paie et vos cotisations sociales selon le droit du travail français, et facture l'entreprise étrangère. Pour vous, c'est la structure la plus protectrice : vous avez un contrat de travail français, un bulletin de salaire, et tous les droits associés. Pour l'entreprise, c'est une façon de recruter légalement en France sans ouvrir de filiale française.
      </P>
      <KeyTakeaway>Pour une première collaboration internationale depuis la France, le statut auto-entrepreneur est la voie la plus rapide et la moins coûteuse. Passé un certain niveau de revenus ou si vous souhaitez les protections du statut salarié, le portage ou l'EOR sont des alternatives structurellement supérieures, mais plus coûteuses à gérer.</KeyTakeaway>

      <H2 id="visa-talent">Le Visa Talent en France : pour qui et comment</H2>
      <P>
        Le Visa Talent (anciennement Passeport Talent) est un titre de séjour français conçu pour attirer des professionnels qualifiés en France. Il concerne les ressortissants non-européens souhaitant résider et travailler en France, pas les résidents français travaillant pour des entreprises étrangères. Si vous êtes déjà résident en France (citoyen français ou titulaire d'un titre de séjour valide), le Visa Talent n'est pas pertinent pour vous.
      </P>
      <P>
        En revanche, si vous êtes un professionnel qualifié basé à l'étranger et souhaitez vous installer en France pour travailler en télétravail pour des clients étrangers, le Visa Talent peut être une voie d'entrée. La catégorie "Salarié en mission" couvre les salariés d'entreprises étrangères détachés en France pour une mission de longue durée. La catégorie "Talent" couvre des professions spécifiques avec un niveau de qualification ou de revenus démontrable. Les critères évoluent régulièrement et une consultation auprès d'un avocat spécialisé en droit de l'immigration française est indispensable avant d'entamer une démarche.
      </P>

      <H2 id="belgique-suisse">Travailler depuis la Belgique ou la Suisse pour l'étranger</H2>
      <H3>Belgique</H3>
      <P>
        La Belgique dispose d'un statut de travailleur indépendant (indépendant à titre principal ou complémentaire) qui permet aux résidents fiscaux belges de facturer des clients étrangers sans restriction particulière. L'affiliation à une caisse d'assurances sociales pour indépendants est obligatoire et couvre la pension, les allocations familiales, et une assurance maladie de base. La Belgique a conclu des conventions fiscales bilatérales avec la plupart de ses partenaires commerciaux, ce qui évite généralement la double imposition sur les revenus de prestations de services étrangers.
      </P>
      <H3>Suisse</H3>
      <P>
        La Suisse permet aux résidents (y compris les titulaires d'un permis B ou C) d'exercer une activité indépendante accessoire ou principale pour des clients étrangers. La déclaration de l'activité indépendante auprès de la Caisse de compensation AVS est obligatoire, et les cotisations sociales (AVS/AI/APG) sont prélevées sur le revenu net de l'activité. La fiscalité suisse varie selon le canton et requiert une consultation auprès d'un fiduciaire local pour optimiser la structure en fonction de votre situation spécifique. La Suisse n'est pas membre de l'UE, ce qui crée des spécificités dans les relations avec des clients européens, notamment sur le plan de la TVA.
      </P>

      <H2 id="rassurer-employeur">Rassurer un employeur européen sur votre statut légal</H2>
      <P>
        La plupart des blocages administratifs dans le recrutement international viennent non pas de problèmes légaux réels mais de l'incertitude d'un recruteur ou d'un responsable RH qui ne connaît pas votre situation et ne sait pas comment la gérer. Un candidat qui anticipe ces questions et y répond clairement et proactivement transforme ce qui pourrait être un obstacle en une démonstration de maturité professionnelle.
      </P>
      <P>
        Les informations à communiquer spontanément sont les suivantes : votre pays de résidence fiscale, votre statut légal (auto-entrepreneur, portage, ou capacité à travailler sous EOR), le numéro SIRET de votre structure si vous en avez une, et une phrase explicite sur le fait que vous gérez vos propres cotisations sociales et obligations fiscales locales. Cette clarté montre à l'employeur que vous avez déjà réfléchi aux questions de compliance et que l'intégration de votre collaboration dans leur structure administrative sera simple.
      </P>
      <P>
        Si l'employeur préfère une relation de travail formalisée, proposer spécifiquement Deel ou Remote comme plateforme EOR est souvent plus efficace que d'expliquer abstraitement ce qu'est un EOR. Ces plateformes sont connues des équipes RH internationales, et mentionner leur nom ramène immédiatement la conversation à quelque chose de concret et de gérable.
      </P>

      <H2 id="erreurs">Erreurs classiques des candidats francophones</H2>
      <P>
        La première erreur est de supposer qu'une mention de visa dans une offre d'emploi s'applique à vous. Les mentions "sponsorship non disponible" ou "candidats autorisés à travailler dans le pays X" concernent les arrangements d'emploi avec présence physique dans ce pays. Pour un prestataire travaillant depuis la France, ces mentions sont généralement non pertinentes, et une courte clarification dans la lettre de motivation suffit souvent à lever le frein.
      </P>
      <P>
        La deuxième erreur est d'attendre que l'employeur pose les questions administratives pour y répondre. Les recruteurs non familiers avec le recrutement international international peuvent simplement rejeter un candidat étranger parce qu'ils ne savent pas comment gérer la situation, sans jamais formuler explicitement la question qui les bloque. Le candidat qui anticipe et répond à ces questions sans être interrogé supprime l'obstacle avant qu'il devienne un motif de rejet.
      </P>
      <P>
        La troisième erreur est de confondre la loi qui régit le contrat commercial et la loi qui régit vos obligations personnelles. Vous pouvez signer un contrat régi par le droit anglais ou américain tout en restant soumis au droit français pour vos cotisations sociales et votre imposition. Ce n'est pas contradictoire : c'est la réalité normale de toute collaboration internationale.
      </P>

      <H2 id="negocier">Négocier le cadre administratif dès l'offre</H2>
      <P>
        Le bon moment pour fixer le cadre administratif est au moment de l'offre, pas après avoir accepté. Les questions à résoudre avant de signer sont : quelle entité juridique signe le contrat, dans quelle devise et par quel mécanisme le paiement est effectué, dans quelle juridiction le contrat est régi, et qui est responsable de la conformité dans chaque pays concerné. Ces questions n'ont rien d'inhabituelles dans un contexte international, et un employeur qui a déjà recruté des prestataires étrangers saura y répondre sans hésitation.
      </P>

      <H2 id="durable">Construire une situation légale durable</H2>
      <P>
        La première collaboration internationale est toujours la plus complexe à mettre en place, parce que c'est la première fois que vous naviguez les questions administratives. À partir de la deuxième, le cadre est établi, votre structure est en place, et l'ajout d'un nouveau client international est marginal en termes d'effort administratif. Les professionnels qui font cet investissement tôt construisent un avantage concurrentiel durable par rapport à ceux qui continuent de se limiter au marché local.
      </P>

      <FAQ items={[
        {
          q: "En tant qu'auto-entrepreneur français, puis-je facturer des clients en dehors de l'UE sans problème ?",
          a: "Oui. Le statut auto-entrepreneur ne restreint pas la géographie de vos clients. Vous pouvez facturer des clients aux États-Unis, au Canada, au Royaume-Uni ou ailleurs dans le monde. Les règles TVA varient selon le pays du client et le type de service, mais pour les prestations de services B2B à destination d'entreprises hors UE, vous facturez généralement sans TVA avec la mention appropriée sur votre facture. Un expert-comptable peut valider votre configuration de facturation lors d'une consultation initiale."
        },
        {
          q: "Le portage salarial est-il reconnu par les employeurs étrangers comme équivalent à un contrat de travail ?",
          a: "Les employeurs étrangers ne connaissent généralement pas le portage salarial, qui est une institution spécifiquement française. Ce qu'ils voient est une facture émise par la société de portage pour le compte du consultant. Depuis leur perspective, c'est une prestation de services, pas un contrat de travail, et les protections du droit du travail français que le portage procure ne leur sont pas visibles. Si vous souhaitez une relation de travail formalisée reconnue internationalement, un EOR est généralement plus adapté."
        },
        {
          q: "Comment déclarer mes revenus étrangers dans ma déclaration fiscale française ?",
          a: "Les revenus de prestations de services pour des clients étrangers sont déclarés en tant que revenus professionnels (BIC ou BNC selon votre activité) dans votre déclaration de revenus annuelle. Si vous êtes auto-entrepreneur, vous déclarez votre chiffre d'affaires trimestriellement ou mensuellement sur le portail auto-entrepreneur, et ces déclarations alimentent automatiquement votre déclaration de revenus annuelle. Les conventions fiscales bilatérales peuvent prévoir des mécanismes de crédit d'impôt pour éviter la double imposition si vous avez déjà payé des taxes à la source dans le pays du client."
        },
        {
          q: "Un employeur peut-il refuser de travailler avec moi parce que je suis auto-entrepreneur ?",
          a: "Oui. Certains employeurs préfèrent ou exigent une structure de facturation via une société (SASU, SARL) plutôt que via une micro-entreprise, principalement pour des raisons de perception de professionnalisme ou de politique interne. D'autres exigent un contrat de travail formel et ne peuvent pas travailler avec des prestataires indépendants pour des raisons de compliance ou de politique sociale. Ces préférences sont souvent mentionnées dans les offres ou soulevées lors de la phase de négociation, et il vaut mieux les clarifier tôt que découvrir l'incompatibilité après plusieurs entretiens."
        },
      ]} />

      <Conclusion>
        <P>
          Le statut légal pour travailler en remote pour une entreprise étrangère est un problème résolu pour les professionnels qui prennent le temps de comprendre leurs options. La complexité perçue est souvent bien supérieure à la complexité réelle, et un investissement de quelques heures en consultation avec un expert-comptable ou un avocat spécialisé suffit généralement à clarifier votre situation et à vous donner un cadre stable pour les années suivantes.
        </P>
        <P>
          JobConnect AI regroupe des offres d'entreprises qui ont déjà une expérience du recrutement international et une infrastructure de compliance en place. Le Skill Gap vous aide à identifier les compétences complémentaires à développer pour accéder aux rôles les plus demandés dans votre domaine.
        </P>
      </Conclusion>

    </article>
  )
}
