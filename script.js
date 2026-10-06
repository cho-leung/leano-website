(() => {
  const header = document.querySelector('[data-header]');
  const year = document.querySelector('[data-year]');
  const copyButton = document.querySelector('[data-copy-rfq]');
  const copyLabel = document.querySelector('[data-copy-label]');
  const copyStatus = document.querySelector('[data-copy-status]');
  const languageButtons = document.querySelectorAll('[data-lang]');
  const metaDescription = document.querySelector('[data-i18n-meta="description"]');
  const rfqForm = document.querySelector('[data-rfq-form]');
  const rfqSubmit = document.querySelector('[data-rfq-submit]');
  const rfqSubmitLabel = document.querySelector('[data-rfq-submit-label]');
  const rfqStatus = document.querySelector('[data-rfq-status]');

  // Production configuration: replace this once after Apps Script is deployed as /exec.
  const RFQ_CONFIG = { endpoint: 'PASTE_APPS_SCRIPT_EXEC_URL_HERE' };
  const isProductionEndpoint = (endpoint) => /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint);

  const languages = {
    en: {
      locale: 'en',
      title: 'LEANO — Cross-border sourcing & second-source procurement',
      description: 'Leano is an independent cross-border sourcing and second-source procurement desk, currently focused on exact-SKU and project sourcing for ICT providers.',
      skipLink: 'Skip to content',
      headerNote: 'Cross-border sourcing / second source',
      sendRequirement: 'Send a requirement',
      heroKickerLeft: '01 / Cross-border sourcing',
      heroKickerRight: 'Current specialization / ICT project sourcing',
      heroTitle: 'A second source<br>for difficult cross-border<br><em>procurement.</em>',
      heroLede: 'Leano is an independent cross-border sourcing and second-source procurement desk. We currently support project-driven requirements including exact-SKU, BOM and ICT project sourcing.',
      heroSide1: 'Current specialization: ICT project procurement.',
      heroSide2: 'We work behind project suppliers and integrators—not in front of their end customers.',
      sendLiveRequirement: 'Send a live requirement',
      rfqAria: 'Information needed for an RFQ',
      startWith: 'Start with',
      quantity: 'Quantity',
      destination: 'Destination',
      deadline: 'Deadline',
      sectionCapabilities: '02 / What we handle',
      capabilitiesTitle: 'Resolve the gap<br>inside a live RFQ.',
      capabilitiesIntro: 'Useful when exact specifications, stock, lead time, incumbent-channel pricing or geography make normal procurement difficult.',
      cap1Title: 'Exact SKU / BOM sourcing',
      cap1Body: 'Part-number-led sourcing when a close substitute is not the requirement.',
      cap2Title: 'Alternative supplier search',
      cap2Body: 'Find viable second-source options when the incumbent route cannot meet the requirement.',
      cap3Title: 'Stock, lead time & project pricing',
      cap3Body: 'Compare availability, timing and practical commercial options across potential sources.',
      cap4Title: 'Supply-route comparison',
      cap4Body: 'Evaluate alternative sourcing routes and, where relevant, compare landed-cost scenarios.',
      cap5Title: 'Freight coordination',
      cap5Body: 'Coordinate the practical handoff between the selected supply route, destination and freight requirement.',
      cap6Title: 'Export documentation coordination',
      cap6Body: 'Surface export-document and routing requirements that need resolution before shipment, where relevant.',
      sectionProcess: '03 / How it works',
      processTitle: 'A short route from requirement<br>to commercial review.',
      process1Title: 'Requirement',
      process1Body: 'Exact SKU or BOM, quantity, destination and deadline.',
      process2Title: 'Source',
      process2Body: 'Identify viable supply routes around the requirement.',
      process3Title: 'Verify',
      process3Body: 'Check stock, pricing, timing and relevant documentation.',
      process4Title: 'Route',
      process4Body: 'Match supply options to freight and destination constraints.',
      process5Title: 'Quote',
      process5Body: 'Return a concise sourcing route for commercial review.',
      sectionAudience: '04 / Who we work with',
      audienceTitle: 'Project-driven buyers<br>with a requirement to solve.',
      clientTypesAria: 'Client types',
      audience1: 'Project suppliers',
      audience2: 'Integrators',
      audience3: 'Distributors',
      audience4: 'Procurement teams',
      audience5: 'ICT VARs & resellers',
      sectionPrinciple: '05 / Operating principle',
      principleTitle: 'Behind your business.<br><span>Not in front of it.</span>',
      principleBody1: 'Leano is designed as a second-source procurement desk for project suppliers, integrators and procurement teams—not as a replacement for their customer relationship.',
      principleBody2: 'We do not compete for your end customer.',
      sectionRfq: '06 / Send a requirement',
      rfqTitle: 'A precise brief<br>is enough to start.',
      rfqIntro: 'If you reached this page from a Leano email, you can reply to that thread or submit the requirement here. Exact SKU / BOM details are ideal, but a clear project requirement is enough to begin.',
      formCompany: 'Company',
      formCompanyPlaceholder: 'Company name',
      formEmail: 'Work email',
      formEmailPlaceholder: 'name@company.com',
      formName: 'Name',
      formNamePlaceholder: 'Your name',
      formPhone: 'Phone / WhatsApp',
      formPhonePlaceholder: 'Optional',
      formRequirement: 'Requirement / SKU / BOM',
      formRequirementPlaceholder: 'Exact part number, BOM, product specification, or project requirement',
      formQuantityPlaceholder: 'e.g. 60 units',
      formDestinationPlaceholder: 'City, country',
      formDeadlinePlaceholder: 'Required delivery / project date',
      formAdditional: 'Additional requirements',
      formAdditionalPlaceholder: 'Substitutes, freight, documentation, commercial or other constraints',
      formSubmit: 'Submit RFQ',
      formSubmitting: 'Submitting…',
      formUnavailable: 'RFQ form is not connected yet. Please reply to the Leano email you received.',
      formPrivacy: 'By submitting, you ask Leano to use these details to review and respond to this RFQ. Please do not send payment-card or highly sensitive information.',
      rfqChecklistAria: 'RFQ information checklist',
      rfq1Help: 'Exact manufacturer part number where available',
      rfq2Help: 'Required units per item',
      rfq3Help: 'City and country',
      rfq4Help: 'Required delivery or project date',
      emailRequirement: 'Email Leano',
      contactLeano: 'Contact Leano',
      emailSubject: 'RFQ — Leano Sourcing',
      copyChecklist: 'Copy RFQ checklist',
      copiedLabel: 'Copied',
      copiedStatus: 'RFQ checklist copied. Paste it into your reply to Leano.',
      copyBlocked: 'Copy was blocked by the browser. Please copy the four fields above manually.',
      backToTop: 'Back to top',
      footerPositioning: 'Independent cross-border sourcing & second-source procurement.',
      footerKeywords: 'Cross-border sourcing · Exact SKU · BOM · Alternative supply · Project RFQ',
      footerNote: 'Availability, commercial terms, routing and documentation are evaluated per requirement.',
      template: `Leano RFQ\n\nSKU / BOM:\nQuantity:\nDestination:\nDeadline:\n\nOptional notes:\n- Preferred brand / manufacturer:\n- Substitutes acceptable? Yes / No\n- Freight or documentation constraints:`
    },
    zh: {
      locale: 'zh-CN',
      title: 'LEANO — 跨境采购与第二供应源',
      description: 'Leano 是一家独立的跨境采购与第二供应源采购服务台，目前重点支持精准 SKU、BOM 与 ICT 项目采购。',
      skipLink: '跳到正文',
      headerNote: '跨境采购 / 第二供应源',
      sendRequirement: '发送采购需求',
      heroKickerLeft: '01 / 跨境采购',
      heroKickerRight: '当前重点 / ICT 项目采购',
      heroTitle: '为困难的跨境采购<br>找到第二条<br><em>供应路径。</em>',
      heroLede: 'Leano 是一家独立的跨境采购与第二供应源采购服务台。我们目前重点支持项目驱动型需求，包括精准 SKU、BOM 与 ICT 项目采购。',
      heroSide1: '当前重点：ICT 项目采购。',
      heroSide2: '我们作为项目供应商与集成商背后的采购支持，不直接争夺其终端客户。',
      sendLiveRequirement: '发送真实采购需求',
      rfqAria: '提交 RFQ 所需的信息',
      startWith: '先提供',
      quantity: '数量',
      destination: '目的地',
      deadline: '截止时间',
      sectionCapabilities: '02 / 我们处理什么',
      capabilitiesTitle: '解决真实 RFQ 中的<br>采购缺口。',
      capabilitiesIntro: '当精准规格、库存、交期、既有渠道价格或地域因素让常规采购变得困难时，我们介入寻找可执行的替代路径。',
      cap1Title: '精准 SKU / BOM 采购',
      cap1Body: '以准确料号为核心进行采购，而不是用“相近替代品”代替明确要求。',
      cap2Title: '替代供应商搜索',
      cap2Body: '当现有供应路径无法满足需求时，寻找可执行的第二供应源。',
      cap3Title: '库存、交期与项目价格',
      cap3Body: '比较不同潜在供应源的可得性、时间与实际商业条件。',
      cap4Title: '供应路径比较',
      cap4Body: '评估不同采购路径，并在适用时比较落地成本情景。',
      cap5Title: '国际货运协调',
      cap5Body: '协调选定供应路径、目的地与货运需求之间的实际衔接。',
      cap6Title: '出口文件协调',
      cap6Body: '在适用时，提前识别并协调发运前需要解决的出口文件与路线要求。',
      sectionProcess: '03 / 如何运作',
      processTitle: '从采购需求到商业评估，<br>保持路径简洁。',
      process1Title: '需求',
      process1Body: '精准 SKU 或 BOM、数量、目的地与截止时间。',
      process2Title: '寻源',
      process2Body: '围绕明确需求寻找可行的供应路径。',
      process3Title: '核验',
      process3Body: '核对库存、价格、时间与相关文件。',
      process4Title: '路线',
      process4Body: '将供应方案与货运及目的地约束进行匹配。',
      process5Title: '报价',
      process5Body: '返回简洁的采购方案，供你进行商业评估。',
      sectionAudience: '04 / 我们服务谁',
      audienceTitle: '为项目驱动型买家<br>解决明确的采购需求。',
      clientTypesAria: '客户类型',
      audience1: '项目供应商',
      audience2: '系统集成商',
      audience3: '分销商',
      audience4: '采购团队',
      audience5: 'ICT VAR 与经销商',
      sectionPrinciple: '05 / 运营原则',
      principleTitle: '站在你的业务背后。<br><span>不站到你的客户面前。</span>',
      principleBody1: 'Leano 作为项目供应商、集成商和采购团队的第二供应源采购支持而存在，而不是取代他们与终端客户之间的关系。',
      principleBody2: '我们不与你争夺终端客户。',
      sectionRfq: '06 / 发送采购需求',
      rfqTitle: '一份清晰需求，<br>即可开始。',
      rfqIntro: '如果你是从 Leano 的邮件进入本页，可以直接回复原邮件，也可以在这里提交采购需求。准确 SKU / BOM 最理想，但清晰的项目采购需求也足以开始。',
      formCompany: '公司',
      formCompanyPlaceholder: '公司名称',
      formEmail: '工作邮箱',
      formEmailPlaceholder: 'name@company.com',
      formName: '姓名',
      formNamePlaceholder: '你的姓名',
      formPhone: '电话 / WhatsApp',
      formPhonePlaceholder: '选填',
      formRequirement: '采购需求 / SKU / BOM',
      formRequirementPlaceholder: '准确料号、BOM、产品规格或项目采购需求',
      formQuantityPlaceholder: '例如：60 台',
      formDestinationPlaceholder: '城市，国家',
      formDeadlinePlaceholder: '要求交付日期 / 项目截止时间',
      formAdditional: '其他要求',
      formAdditionalPlaceholder: '替代型号、货运、文件、商业条件或其他限制',
      formSubmit: '提交 RFQ',
      formSubmitting: '正在提交…',
      formUnavailable: 'RFQ 表单尚未连接。请直接回复你收到的 Leano 邮件。',
      formPrivacy: '提交后，Leano 将使用这些信息评估并回复本次 RFQ。请不要提交银行卡或高度敏感的信息。',
      rfqChecklistAria: 'RFQ 信息清单',
      rfq1Help: '如有，请提供准确的制造商料号',
      rfq2Help: '每个项目所需数量',
      rfq3Help: '城市与国家',
      rfq4Help: '要求交付日期或项目截止时间',
      emailRequirement: '邮件发送给 Leano',
      contactLeano: '联系 Leano',
      emailSubject: 'RFQ — Leano Sourcing 采购需求',
      copyChecklist: '复制 RFQ 清单',
      copiedLabel: '已复制',
      copiedStatus: 'RFQ 清单已复制，可直接粘贴到给 Leano 的回复邮件中。',
      copyBlocked: '浏览器阻止了复制操作，请手动复制上方四项信息。',
      backToTop: '返回顶部',
      footerPositioning: '独立跨境采购与第二供应源采购支持。',
      footerKeywords: '跨境采购 · 精准 SKU · BOM · 替代供应源 · 项目 RFQ',
      footerNote: '库存、商业条件、运输路径与文件要求均按具体采购需求逐项评估。',
      template: `Leano RFQ\n\nSKU / BOM：\n数量：\n目的地：\n截止时间：\n\n可选备注：\n- 首选品牌 / 制造商：\n- 是否接受替代型号：是 / 否\n- 货运或文件要求：`
    },
    fr: {
      locale: 'fr',
      title: 'LEANO — Sourcing transfrontalier & seconde source',
      description: 'Leano est un bureau indépendant de sourcing transfrontalier et de seconde source, actuellement spécialisé dans les références exactes, les BOM et les achats de projets ICT.',
      skipLink: 'Aller au contenu',
      headerNote: 'Sourcing transfrontalier / seconde source',
      sendRequirement: 'Envoyer un besoin',
      heroKickerLeft: '01 / Sourcing transfrontalier',
      heroKickerRight: 'Spécialisation actuelle / sourcing de projets ICT',
      heroTitle: 'Une seconde source<br>pour les achats transfrontaliers<br><em>complexes.</em>',
      heroLede: 'Leano est un bureau indépendant de sourcing transfrontalier et de seconde source. Nous accompagnons actuellement des besoins orientés projet, notamment les références exactes, les BOM et les achats de projets ICT.',
      heroSide1: 'Spécialisation actuelle : achats de projets ICT.',
      heroSide2: 'Nous travaillons en soutien des fournisseurs de projets et intégrateurs, sans nous placer devant leurs clients finaux.',
      sendLiveRequirement: 'Envoyer un besoin réel',
      rfqAria: 'Informations nécessaires pour une RFQ',
      startWith: 'Pour commencer',
      quantity: 'Quantité',
      destination: 'Destination',
      deadline: 'Échéance',
      sectionCapabilities: '02 / Ce que nous traitons',
      capabilitiesTitle: 'Résoudre le blocage<br>dans une RFQ active.',
      capabilitiesIntro: 'Utile lorsque la référence exacte, le stock, le délai, le prix du canal habituel ou la géographie compliquent l’achat normal.',
      cap1Title: 'Sourcing de SKU / BOM exacts',
      cap1Body: 'Recherche guidée par la référence lorsque le besoin n’accepte pas un substitut approximatif.',
      cap2Title: 'Recherche de fournisseurs alternatifs',
      cap2Body: 'Identifier une seconde source viable lorsque la voie d’approvisionnement habituelle ne répond pas au besoin.',
      cap3Title: 'Stock, délais & prix projet',
      cap3Body: 'Comparer disponibilité, calendrier et options commerciales réalistes entre plusieurs sources potentielles.',
      cap4Title: 'Comparaison des routes d’approvisionnement',
      cap4Body: 'Évaluer différentes routes de sourcing et, lorsque pertinent, comparer des scénarios de coût rendu.',
      cap5Title: 'Coordination du fret',
      cap5Body: 'Coordonner le passage pratique entre la source retenue, la destination et les contraintes de fret.',
      cap6Title: 'Coordination des documents export',
      cap6Body: 'Faire ressortir les exigences documentaires et de routage à résoudre avant expédition, lorsque pertinent.',
      sectionProcess: '03 / Comment ça marche',
      processTitle: 'Un chemin court du besoin<br>à la revue commerciale.',
      process1Title: 'Besoin',
      process1Body: 'SKU ou BOM exact, quantité, destination et échéance.',
      process2Title: 'Sourcer',
      process2Body: 'Identifier des routes d’approvisionnement viables autour du besoin.',
      process3Title: 'Vérifier',
      process3Body: 'Contrôler stock, prix, calendrier et documentation pertinente.',
      process4Title: 'Acheminer',
      process4Body: 'Adapter les options d’approvisionnement aux contraintes de fret et de destination.',
      process5Title: 'Devis',
      process5Body: 'Retourner une option de sourcing concise pour revue commerciale.',
      sectionAudience: '04 / Avec qui nous travaillons',
      audienceTitle: 'Des acheteurs orientés projet<br>avec un besoin précis à résoudre.',
      clientTypesAria: 'Types de clients',
      audience1: 'Fournisseurs de projets',
      audience2: 'Intégrateurs',
      audience3: 'Distributeurs',
      audience4: 'Équipes achats',
      audience5: 'VAR & revendeurs ICT',
      sectionPrinciple: '05 / Principe de fonctionnement',
      principleTitle: 'Derrière votre activité.<br><span>Pas devant votre client.</span>',
      principleBody1: 'Leano agit comme une seconde source pour les fournisseurs de projets, intégrateurs et équipes achats, sans remplacer leur relation avec le client final.',
      principleBody2: 'Nous ne concurrençons pas votre relation client.',
      sectionRfq: '06 / Envoyer un besoin',
      rfqTitle: 'Un besoin précis<br>suffit pour commencer.',
      rfqIntro: 'Si vous arrivez depuis un e-mail Leano, vous pouvez répondre à ce fil ou soumettre le besoin ici. Un SKU / BOM exact est idéal, mais un besoin projet clairement défini suffit pour commencer.',
      formCompany: 'Entreprise',
      formCompanyPlaceholder: 'Nom de l’entreprise',
      formEmail: 'E-mail professionnel',
      formEmailPlaceholder: 'nom@entreprise.com',
      formName: 'Nom',
      formNamePlaceholder: 'Votre nom',
      formPhone: 'Téléphone / WhatsApp',
      formPhonePlaceholder: 'Facultatif',
      formRequirement: 'Besoin / SKU / BOM',
      formRequirementPlaceholder: 'Référence exacte, BOM, spécification produit ou besoin projet',
      formQuantityPlaceholder: 'ex. 60 unités',
      formDestinationPlaceholder: 'Ville, pays',
      formDeadlinePlaceholder: 'Date de livraison / échéance projet',
      formAdditional: 'Exigences complémentaires',
      formAdditionalPlaceholder: 'Substituts, fret, documentation, conditions commerciales ou autres contraintes',
      formSubmit: 'Envoyer la RFQ',
      formSubmitting: 'Envoi…',
      formUnavailable: 'Le formulaire RFQ n’est pas encore connecté. Répondez directement à l’e-mail Leano reçu.',
      formPrivacy: 'En envoyant ce formulaire, vous demandez à Leano d’utiliser ces informations pour examiner et répondre à cette RFQ. N’envoyez pas de données de carte bancaire ni d’informations hautement sensibles.',
      rfqChecklistAria: 'Liste des informations RFQ',
      rfq1Help: 'Référence fabricant exacte lorsqu’elle est disponible',
      rfq2Help: 'Nombre d’unités requises par article',
      rfq3Help: 'Ville et pays',
      rfq4Help: 'Date de livraison requise ou échéance projet',
      emailRequirement: 'Écrire à Leano',
      contactLeano: 'Contacter Leano',
      emailSubject: 'RFQ — Leano Sourcing',
      copyChecklist: 'Copier la liste RFQ',
      copiedLabel: 'Copié',
      copiedStatus: 'Liste RFQ copiée. Collez-la dans votre réponse à Leano.',
      copyBlocked: 'Le navigateur a bloqué la copie. Veuillez copier manuellement les quatre champs ci-dessus.',
      backToTop: 'Retour en haut',
      footerPositioning: 'Sourcing transfrontalier indépendant & seconde source.',
      footerKeywords: 'Sourcing transfrontalier · SKU exact · BOM · Source alternative · RFQ projet',
      footerNote: 'Disponibilité, conditions commerciales, routage et documentation sont évalués pour chaque besoin.',
      template: `RFQ Leano\n\nSKU / BOM :\nQuantité :\nDestination :\nÉchéance :\n\nNotes facultatives :\n- Marque / fabricant préféré :\n- Substituts acceptés ? Oui / Non\n- Contraintes de fret ou de documentation :`
    },
    ru: {
      locale: 'ru',
      title: 'LEANO — Международный сорсинг и альтернативные поставки',
      description: 'Leano — независимый партнёр по международному сорсингу и альтернативным поставкам, с текущей специализацией на точных SKU, BOM и ICT-проектных закупках.',
      skipLink: 'Перейти к содержанию',
      headerNote: 'Международный сорсинг / второй источник',
      sendRequirement: 'Отправить запрос',
      heroKickerLeft: '01 / Международный сорсинг',
      heroKickerRight: 'Текущая специализация / ICT-проектные закупки',
      heroTitle: 'Второй источник<br>для сложных международных<br><em>закупок.</em>',
      heroLede: 'Leano — независимый партнёр по международному сорсингу и альтернативным поставкам. Сейчас мы поддерживаем проектные потребности, включая точные SKU, BOM и ICT-проектные закупки.',
      heroSide1: 'Текущая специализация: ICT-проектные закупки.',
      heroSide2: 'Мы работаем в поддержку проектных поставщиков и интеграторов, не выходя напрямую к их конечным клиентам.',
      sendLiveRequirement: 'Отправить реальный запрос',
      rfqAria: 'Информация, необходимая для RFQ',
      startWith: 'Для начала',
      quantity: 'Количество',
      destination: 'Назначение',
      deadline: 'Срок',
      sectionCapabilities: '02 / Что мы берём в работу',
      capabilitiesTitle: 'Закрываем разрыв<br>в реальном RFQ.',
      capabilitiesIntro: 'Подходит, когда точная спецификация, наличие, срок, цена действующего канала или география усложняют обычную закупку.',
      cap1Title: 'Сорсинг точных SKU / BOM',
      cap1Body: 'Поиск по точному артикулу, когда близкий аналог не соответствует требованию.',
      cap2Title: 'Поиск альтернативного поставщика',
      cap2Body: 'Поиск жизнеспособного второго источника, если текущий канал не может выполнить требование.',
      cap3Title: 'Наличие, сроки и проектные цены',
      cap3Body: 'Сравнение доступности, сроков и практических коммерческих вариантов у потенциальных источников.',
      cap4Title: 'Сравнение маршрутов поставки',
      cap4Body: 'Оценка альтернативных маршрутов закупки и, когда уместно, сценариев полной стоимости поставки.',
      cap5Title: 'Координация перевозки',
      cap5Body: 'Координация практической передачи между выбранным источником, пунктом назначения и требованиями к перевозке.',
      cap6Title: 'Координация экспортных документов',
      cap6Body: 'Выявление требований к экспортным документам и маршруту, которые необходимо решить до отгрузки, когда это применимо.',
      sectionProcess: '03 / Как это работает',
      processTitle: 'Короткий путь от запроса<br>к коммерческой оценке.',
      process1Title: 'Запрос',
      process1Body: 'Точный SKU или BOM, количество, место назначения и срок.',
      process2Title: 'Поиск',
      process2Body: 'Определяем жизнеспособные маршруты поставки под конкретное требование.',
      process3Title: 'Проверка',
      process3Body: 'Проверяем наличие, цену, сроки и необходимые документы.',
      process4Title: 'Маршрут',
      process4Body: 'Сопоставляем варианты поставки с ограничениями по перевозке и назначению.',
      process5Title: 'Предложение',
      process5Body: 'Возвращаем краткий вариант поставки для коммерческого рассмотрения.',
      sectionAudience: '04 / С кем мы работаем',
      audienceTitle: 'Проектные покупатели<br>с конкретной задачей по закупке.',
      clientTypesAria: 'Типы клиентов',
      audience1: 'Проектные поставщики',
      audience2: 'Интеграторы',
      audience3: 'Дистрибьюторы',
      audience4: 'Отделы закупок',
      audience5: 'ICT VAR и реселлеры',
      sectionPrinciple: '05 / Принцип работы',
      principleTitle: 'За вашей компанией.<br><span>Не перед вашим клиентом.</span>',
      principleBody1: 'Leano работает как альтернативный источник для проектных поставщиков, интеграторов и закупочных команд, а не как замена их отношениям с конечным клиентом.',
      principleBody2: 'Мы не конкурируем за вашего конечного клиента.',
      sectionRfq: '06 / Отправить запрос',
      rfqTitle: 'Чёткого запроса<br>достаточно для начала.',
      rfqIntro: 'Если вы пришли из письма Leano, можно ответить в той же переписке или отправить запрос здесь. Точные SKU / BOM предпочтительны, но для начала достаточно чётко сформулированной проектной потребности.',
      formCompany: 'Компания',
      formCompanyPlaceholder: 'Название компании',
      formEmail: 'Рабочий e-mail',
      formEmailPlaceholder: 'name@company.com',
      formName: 'Имя',
      formNamePlaceholder: 'Ваше имя',
      formPhone: 'Телефон / WhatsApp',
      formPhonePlaceholder: 'Необязательно',
      formRequirement: 'Запрос / SKU / BOM',
      formRequirementPlaceholder: 'Точный артикул, BOM, спецификация или проектная потребность',
      formQuantityPlaceholder: 'например, 60 шт.',
      formDestinationPlaceholder: 'Город, страна',
      formDeadlinePlaceholder: 'Требуемая дата поставки / срок проекта',
      formAdditional: 'Дополнительные требования',
      formAdditionalPlaceholder: 'Аналоги, перевозка, документы, коммерческие или другие ограничения',
      formSubmit: 'Отправить RFQ',
      formSubmitting: 'Отправка…',
      formUnavailable: 'Форма RFQ пока не подключена. Ответьте напрямую на полученное письмо Leano.',
      formPrivacy: 'Отправляя форму, вы просите Leano использовать эти данные для рассмотрения и ответа на RFQ. Не отправляйте данные банковских карт или особо чувствительную информацию.',
      rfqChecklistAria: 'Список данных RFQ',
      rfq1Help: 'Точный номер детали производителя, если доступен',
      rfq2Help: 'Требуемое количество по каждой позиции',
      rfq3Help: 'Город и страна',
      rfq4Help: 'Требуемая дата поставки или проектный срок',
      emailRequirement: 'Написать Leano',
      contactLeano: 'Связаться с Leano',
      emailSubject: 'RFQ — Leano Sourcing',
      copyChecklist: 'Скопировать RFQ',
      copiedLabel: 'Скопировано',
      copiedStatus: 'Список RFQ скопирован. Вставьте его в ответ Leano.',
      copyBlocked: 'Браузер заблокировал копирование. Скопируйте четыре поля выше вручную.',
      backToTop: 'Наверх',
      footerPositioning: 'Независимый международный сорсинг и альтернативные поставки.',
      footerKeywords: 'Международный сорсинг · Точный SKU · BOM · Альтернативный источник · Проектный RFQ',
      footerNote: 'Наличие, коммерческие условия, маршрут и документация оцениваются отдельно по каждому запросу.',
      template: `RFQ Leano\n\nSKU / BOM:\nКоличество:\nНазначение:\nСрок:\n\nДополнительные примечания:\n- Предпочтительный бренд / производитель:\n- Допустимы аналоги? Да / Нет\n- Ограничения по перевозке или документам:`
    },
    es: {
      locale: 'es',
      title: 'LEANO — Sourcing transfronterizo y segunda fuente',
      description: 'Leano es un equipo independiente de sourcing transfronterizo y segunda fuente, actualmente enfocado en SKU exactos, BOM y compras de proyectos ICT.',
      skipLink: 'Ir al contenido',
      headerNote: 'Sourcing transfronterizo / segunda fuente',
      sendRequirement: 'Enviar un requerimiento',
      heroKickerLeft: '01 / Sourcing transfronterizo',
      heroKickerRight: 'Especialización actual / compras de proyectos ICT',
      heroTitle: 'Una segunda fuente<br>para compras transfronterizas<br><em>complejas.</em>',
      heroLede: 'Leano es un equipo independiente de sourcing transfronterizo y segunda fuente. Actualmente apoyamos requerimientos impulsados por proyectos, incluidos SKU exactos, BOM y compras de proyectos ICT.',
      heroSide1: 'Especialización actual: compras de proyectos ICT.',
      heroSide2: 'Trabajamos detrás de proveedores de proyectos e integradores, sin colocarnos delante de sus clientes finales.',
      sendLiveRequirement: 'Enviar un requerimiento real',
      rfqAria: 'Información necesaria para una RFQ',
      startWith: 'Empieza con',
      quantity: 'Cantidad',
      destination: 'Destino',
      deadline: 'Fecha límite',
      sectionCapabilities: '02 / Qué gestionamos',
      capabilitiesTitle: 'Resolver el vacío<br>dentro de una RFQ activa.',
      capabilitiesIntro: 'Útil cuando una especificación exacta, el stock, el plazo, el precio del canal habitual o la geografía dificultan la compra normal.',
      cap1Title: 'Sourcing de SKU / BOM exactos',
      cap1Body: 'Búsqueda guiada por número de parte cuando un sustituto aproximado no cumple el requerimiento.',
      cap2Title: 'Búsqueda de proveedores alternativos',
      cap2Body: 'Encontrar una segunda fuente viable cuando la ruta habitual no puede cumplir el requerimiento.',
      cap3Title: 'Stock, plazo y precio de proyecto',
      cap3Body: 'Comparar disponibilidad, tiempos y opciones comerciales prácticas entre posibles fuentes.',
      cap4Title: 'Comparación de rutas de suministro',
      cap4Body: 'Evaluar rutas alternativas de sourcing y, cuando corresponda, comparar escenarios de coste puesto en destino.',
      cap5Title: 'Coordinación de transporte',
      cap5Body: 'Coordinar la transición práctica entre la fuente elegida, el destino y los requisitos de transporte.',
      cap6Title: 'Coordinación de documentación de exportación',
      cap6Body: 'Identificar requisitos de documentación y ruta que deban resolverse antes del envío, cuando corresponda.',
      sectionProcess: '03 / Cómo funciona',
      processTitle: 'Una ruta corta desde el requerimiento<br>hasta la revisión comercial.',
      process1Title: 'Requerimiento',
      process1Body: 'SKU o BOM exacto, cantidad, destino y fecha límite.',
      process2Title: 'Buscar',
      process2Body: 'Identificar rutas de suministro viables alrededor del requerimiento.',
      process3Title: 'Verificar',
      process3Body: 'Comprobar stock, precio, tiempos y documentación relevante.',
      process4Title: 'Ruta',
      process4Body: 'Ajustar las opciones de suministro a las restricciones de transporte y destino.',
      process5Title: 'Cotizar',
      process5Body: 'Devolver una ruta de sourcing concisa para revisión comercial.',
      sectionAudience: '04 / Con quién trabajamos',
      audienceTitle: 'Compradores orientados a proyectos<br>con un requerimiento que resolver.',
      clientTypesAria: 'Tipos de clientes',
      audience1: 'Proveedores de proyectos',
      audience2: 'Integradores',
      audience3: 'Distribuidores',
      audience4: 'Equipos de compras',
      audience5: 'VAR y revendedores ICT',
      sectionPrinciple: '05 / Principio operativo',
      principleTitle: 'Detrás de tu negocio.<br><span>No delante de tu cliente.</span>',
      principleBody1: 'Leano funciona como segunda fuente para proveedores de proyectos, integradores y equipos de compras, no como sustituto de su relación con el cliente final.',
      principleBody2: 'No competimos por tu cliente final.',
      sectionRfq: '06 / Enviar un requerimiento',
      rfqTitle: 'Un requerimiento preciso<br>basta para empezar.',
      rfqIntro: 'Si llegaste desde un correo de Leano, puedes responder a ese hilo o enviar el requerimiento aquí. Los SKU / BOM exactos son ideales, pero una necesidad de proyecto claramente definida es suficiente para empezar.',
      formCompany: 'Empresa',
      formCompanyPlaceholder: 'Nombre de la empresa',
      formEmail: 'Correo de trabajo',
      formEmailPlaceholder: 'nombre@empresa.com',
      formName: 'Nombre',
      formNamePlaceholder: 'Tu nombre',
      formPhone: 'Teléfono / WhatsApp',
      formPhonePlaceholder: 'Opcional',
      formRequirement: 'Requerimiento / SKU / BOM',
      formRequirementPlaceholder: 'Número de parte exacto, BOM, especificación o necesidad del proyecto',
      formQuantityPlaceholder: 'p. ej. 60 unidades',
      formDestinationPlaceholder: 'Ciudad, país',
      formDeadlinePlaceholder: 'Fecha de entrega / fecha límite del proyecto',
      formAdditional: 'Requisitos adicionales',
      formAdditionalPlaceholder: 'Sustitutos, transporte, documentación, condiciones comerciales u otras restricciones',
      formSubmit: 'Enviar RFQ',
      formSubmitting: 'Enviando…',
      formUnavailable: 'El formulario RFQ aún no está conectado. Responde directamente al correo de Leano que recibiste.',
      formPrivacy: 'Al enviar, solicitas a Leano que use estos datos para revisar y responder esta RFQ. No envíes datos de tarjetas ni información altamente sensible.',
      rfqChecklistAria: 'Lista de información RFQ',
      rfq1Help: 'Número de parte exacto del fabricante, si está disponible',
      rfq2Help: 'Unidades requeridas por artículo',
      rfq3Help: 'Ciudad y país',
      rfq4Help: 'Fecha requerida de entrega o fecha límite del proyecto',
      emailRequirement: 'Escribir a Leano',
      contactLeano: 'Contactar con Leano',
      emailSubject: 'RFQ — Leano Sourcing',
      copyChecklist: 'Copiar lista RFQ',
      copiedLabel: 'Copiado',
      copiedStatus: 'Lista RFQ copiada. Pégala en tu respuesta a Leano.',
      copyBlocked: 'El navegador bloqueó la copia. Copia manualmente los cuatro campos anteriores.',
      backToTop: 'Volver arriba',
      footerPositioning: 'Sourcing transfronterizo independiente y segunda fuente.',
      footerKeywords: 'Sourcing transfronterizo · SKU exacto · BOM · Fuente alternativa · RFQ de proyecto',
      footerNote: 'La disponibilidad, las condiciones comerciales, la ruta y la documentación se evalúan para cada requerimiento.',
      template: `RFQ Leano\n\nSKU / BOM:\nCantidad:\nDestino:\nFecha límite:\n\nNotas opcionales:\n- Marca / fabricante preferido:\n- ¿Se aceptan sustitutos? Sí / No\n- Restricciones de transporte o documentación:`
    }
  };

  let currentLanguage = 'en';
  let submitting = false;
  const supportsLanguage = (language) => Object.prototype.hasOwnProperty.call(languages, language);

  const getStoredLanguage = () => {
    try {
      return window.localStorage.getItem('leano-language');
    } catch {
      return null;
    }
  };

  const storeLanguage = (language) => {
    try {
      window.localStorage.setItem('leano-language', language);
    } catch {
      // Storage can be unavailable in privacy-restricted or local preview contexts.
    }
  };

  const getRequestedLanguage = () => {
    const urlLanguage = new URLSearchParams(window.location.search).get('lang');
    if (urlLanguage && supportsLanguage(urlLanguage)) return urlLanguage;
    const savedLanguage = getStoredLanguage();
    if (savedLanguage && supportsLanguage(savedLanguage)) return savedLanguage;
    return 'en';
  };

  const setLanguage = (language, { updateUrl = true } = {}) => {
    currentLanguage = supportsLanguage(language) ? language : 'en';
    const dictionary = languages[currentLanguage];

    document.documentElement.lang = dictionary.locale;
    document.title = dictionary.title;
    if (metaDescription) metaDescription.setAttribute('content', dictionary.description);

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.dataset.i18n;
      if (dictionary[key] !== undefined) node.textContent = dictionary[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach((node) => {
      const key = node.dataset.i18nHtml;
      if (dictionary[key] !== undefined) node.innerHTML = dictionary[key];
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
      const key = node.dataset.i18nAria;
      if (dictionary[key] !== undefined) node.setAttribute('aria-label', dictionary[key]);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      const key = node.dataset.i18nPlaceholder;
      if (dictionary[key] !== undefined) node.setAttribute('placeholder', dictionary[key]);
    });

    const languageMeta = document.querySelector('[data-rfq-meta="language"]');
    if (languageMeta) languageMeta.value = currentLanguage;

    languageButtons.forEach((button) => {
      const active = button.dataset.lang === currentLanguage;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (copyStatus) copyStatus.textContent = '';
    if (rfqStatus) rfqStatus.textContent = '';
    if (submitting && rfqSubmitLabel) rfqSubmitLabel.textContent = dictionary.formSubmitting;
    storeLanguage(currentLanguage);

    if (updateUrl) {
      try {
        const url = new URL(window.location.href);
        if (currentLanguage === 'en') url.searchParams.delete('lang');
        else url.searchParams.set('lang', currentLanguage);
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      } catch {
        // Language switching should still work even when URL mutation is blocked.
      }
    }
  };

  if (year) year.textContent = new Date().getFullYear();

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });

    document.documentElement.classList.add('has-reveal-motion');
    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  languageButtons.forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang));
  });

  const populateRfqMetadata = () => {
    if (!rfqForm) return;
    const params = new URLSearchParams(window.location.search);
    const values = {
      language: currentLanguage,
      source_page: `${window.location.pathname}${window.location.search}`,
      referrer: document.referrer || '',
      campaign: params.get('utm_campaign') || params.get('campaign') || '',
      outreach_source: params.get('utm_source') || params.get('outreach_source') || params.get('source') || '',
      submission_type: params.get('controlled_test') === '1' ? 'controlled_test' : 'rfq'
    };
    const limits = { language: 10, source_page: 1000, referrer: 1000, campaign: 200, outreach_source: 200, submission_type: 30 };
    Object.entries(values).forEach(([key, value]) => {
      const field = rfqForm.querySelector(`[data-rfq-meta="${key}"]`);
      if (field) field.value = value.slice(0, limits[key]);
    });
  };

  if (rfqForm) {
    if (isProductionEndpoint(RFQ_CONFIG.endpoint)) rfqForm.action = RFQ_CONFIG.endpoint;
    rfqForm.addEventListener('submit', (event) => {
      const dictionary = languages[currentLanguage] || languages.en;
      if (submitting) {
        event.preventDefault();
        return;
      }
      populateRfqMetadata();
      if (!isProductionEndpoint(RFQ_CONFIG.endpoint) || !isProductionEndpoint(rfqForm.action)) {
        event.preventDefault();
        if (rfqStatus) rfqStatus.textContent = dictionary.formUnavailable;
        return;
      }
      if (!rfqForm.checkValidity()) {
        event.preventDefault();
        rfqForm.reportValidity();
        return;
      }
      submitting = true;
      if (rfqSubmit) rfqSubmit.disabled = true;
      rfqForm.setAttribute('aria-busy', 'true');
      if (rfqSubmitLabel) rfqSubmitLabel.textContent = dictionary.formSubmitting;
    });
    // The HTML default is disabled so JavaScript-free visits cannot POST to the static host.
    if (rfqSubmit) rfqSubmit.disabled = false;
    window.addEventListener('pageshow', () => {
      submitting = false;
      rfqForm.removeAttribute('aria-busy');
      if (rfqSubmit) rfqSubmit.disabled = false;
      if (rfqSubmitLabel) rfqSubmitLabel.textContent = languages[currentLanguage].formSubmit;
    });
  }

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const dictionary = languages[currentLanguage] || languages.en;
      try {
        await navigator.clipboard.writeText(dictionary.template);
        if (copyStatus) copyStatus.textContent = dictionary.copiedStatus;
        if (copyLabel) copyLabel.textContent = dictionary.copiedLabel;
        window.setTimeout(() => {
          if (copyLabel) copyLabel.textContent = languages[currentLanguage].copyChecklist;
          if (copyStatus) copyStatus.textContent = '';
        }, 3200);
      } catch {
        if (copyStatus) copyStatus.textContent = dictionary.copyBlocked;
      }
    });
  }

  setLanguage(getRequestedLanguage(), { updateUrl: false });
  populateRfqMetadata();
})();
