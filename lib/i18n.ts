export type Lang = "en" | "fr";

export const EVENT = {
  name: "Cameroon for Jesus Crusade & Conference",
  organizer: "CMFI Cameroon",
  presenter: "The Body of Christ in Cameroon",
  location: "Yaoundé, Cameroon",
  dateRange: "September 30 – October 4, 2026",
  contacts: ["+237 699 518 339", "+237 677 716 611"],
  speakers: [
    { name: "Bishop Robinson Fondong", role: { en: "Speaker", fr: "Orateur" } },
    { name: "Dr. Elizabeth Fondong", role: { en: "Speaker", fr: "Oratrice" } },
    { name: "Pastor Nathaniel Bassey", role: { en: "Worship leader", fr: "Chef de louange" } },
    { name: "Apostle Gideon Odoma", role: { en: "Speaker", fr: "Orateur" } },
    { name: "Prophet Bernard Nwaka", role: { en: "Speaker", fr: "Orateur" } },
    { name: "Apostle Arome Osay", role: { en: "Speaker", fr: "Orateur" } },
  ],
};

export const dict = {
  en: {
    langToggle: "Français",
    eyebrow: "Save the date",
    heroTitle: "Cameroon for Jesus Crusade & Conference",
    heroSubtitle: "Presented by The Body of Christ in Cameroon",
    heroDates: "September 30 – October 4, 2026",
    heroLocation: "Yaoundé",
    speakersHeading: "Speakers",
    contactHeading: "Contacts",

    formEyebrow: "New Convert Follow-up Sheet — CMFI Cameroon",
    formTitle: "Today, something changed.",
    formIntro:
      "This follow-up sheet is filled out with the new convert, in person, right after their decision — by a counselor or worker at the crusade.",

    sectionIntake: "About this record",
    workerName: "Counselor / worker name",
    workerNameHint: "You — the person filling out this sheet",
    campaignName: "Event name",
    campaignLocation: "Crusade location",

    sectionAbout: "Personal information",
    fullName: "Full name",
    sex: "Sex",
    sexM: "M",
    sexF: "F",
    ageRange: "Age range",
    age1: "12–17 years",
    age2: "18–25 years",
    age3: "26–35 years",
    age4: "36 years and above",
    phone: "Phone (call / WhatsApp)",
    quartier: "Neighborhood / precise address",
    profession: "Profession / school",

    sectionSpiritual: "Spiritual situation",
    sectionDecision: "Decision made today",
    decisionFirstTime: "First commitment (Salvation)",
    decisionRededication: "Reconciliation",
    decisionPrayer: "Prayer only — not ready to decide yet",

    hasBible: "Do they own a Bible?",
    yes: "Yes",
    no: "No",

    attendsChurch: "Do they already attend a church?",
    homeChurchName: "Name of that church",

    sectionPrayer: "Main prayer topics",
    addictions: "Addictions (if any)",
    addictionsPlaceholder: "e.g. alcohol, tobacco — leave blank if none",
    immediateNeeds: "Immediate needs",
    needHealing: "Healing",
    needDeliverance: "Deliverance",
    needPeace: "Peace",
    needFamily: "Family",
    needOther: "Other",
    needOtherPlaceholder: "Specify",

    sectionNext: "Follow-up interest",
    wantsBibleStudy: "Interested in a Bible study or discipleship group",
    wantsChurchReferral: "Would like help finding a church nearby",
    notesLabel: "Anything else to note (optional)",
    notesPlaceholder: "Any other detail worth passing to the follow-up team",

    submit: "Save this record",
    submitting: "Saving…",
    privacyNote:
      "This information is shared only with CMFI Cameroon and LCOW follow-up teams and is never sold or published.",
    errWorkerName: "Please enter your name as the counselor filling this out.",
    errDecision: "Please choose the decision made today.",
    errGeneric: "We could not save this record. Please try again.",
    errOffline: "You may be offline. Check your connection and try again.",

    thankYouEyebrow: "New Convert Follow-up Sheet",
    thankYouTitle: "Record saved.",
    thankYouBody:
      "This new convert's information has been saved. The follow-up team will assign a local church and a discipleship contact.",
    thankYouBody2: "Thank you for walking with them through this decision today.",
    thankYouAgain: "Fill out another record",
  },
  fr: {
    langToggle: "English",
    eyebrow: "Réservez la date",
    heroTitle: "Cameroun pour Jésus Croisade & Conférence",
    heroSubtitle: "Présenté par The Body of Christ in Cameroon",
    heroDates: "30 septembre – 4 octobre 2026",
    heroLocation: "Yaoundé",
    speakersHeading: "Orateurs",
    contactHeading: "Contacts",

    formEyebrow: "Fiche de Suivi - Nouveaux Convertis — CMFI Cameroun",
    formTitle: "Aujourd'hui, quelque chose a changé.",
    formIntro:
      "Cette fiche est remplie avec le nouveau converti, en personne, juste après sa décision — par un ouvrier ou conseiller de la croisade.",

    sectionIntake: "À propos de cette fiche",
    workerName: "Nom de l'ouvrier / conseiller",
    workerNameHint: "Vous — la personne qui remplit cette fiche",
    campaignName: "Nom de l'événement",
    campaignLocation: "Lieu de la croisade",

    sectionAbout: "Informations personnelles",
    fullName: "Nom et prénom",
    sex: "Sexe",
    sexM: "M",
    sexF: "F",
    ageRange: "Tranche d'âge",
    age1: "12-17 ans",
    age2: "18-25 ans",
    age3: "26-35 ans",
    age4: "36 ans et plus",
    phone: "Téléphone (appel / WhatsApp)",
    quartier: "Quartier / adresse précise",
    profession: "Profession / école",

    sectionSpiritual: "Situation spirituelle",
    sectionDecision: "Décision prise ce jour",
    decisionFirstTime: "Premier engagement (Salut)",
    decisionRededication: "Réconciliation",
    decisionPrayer: "Prière seulement — pas encore prêt(e) à décider",

    hasBible: "Possède-t-il / elle une Bible ?",
    yes: "Oui",
    no: "Non",

    attendsChurch: "Fréquente-t-il / elle déjà une église ?",
    homeChurchName: "Nom de cette église",

    sectionPrayer: "Principaux sujets de prière",
    addictions: "Addictions (le cas échéant)",
    addictionsPlaceholder: "ex. alcool, tabac — laisser vide si aucune",
    immediateNeeds: "Besoins immédiats",
    needHealing: "Guérison",
    needDeliverance: "Délivrance",
    needPeace: "Paix",
    needFamily: "Famille",
    needOther: "Autre",
    needOtherPlaceholder: "Préciser",

    sectionNext: "Intérêt pour le suivi",
    wantsBibleStudy: "Intéressé(e) par un groupe d'étude biblique ou de discipulat",
    wantsChurchReferral: "Aimerait qu'on l'aide à trouver une église à proximité",
    notesLabel: "Autre chose à noter (facultatif)",
    notesPlaceholder: "Tout autre détail utile pour l'équipe de suivi",

    submit: "Enregistrer cette fiche",
    submitting: "Enregistrement…",
    privacyNote:
      "Ces informations sont partagées uniquement avec les équipes de suivi de CMFI Cameroun et LCOW, et ne sont jamais vendues ni publiées.",
    errWorkerName: "Veuillez indiquer votre nom en tant qu'ouvrier remplissant cette fiche.",
    errDecision: "Veuillez choisir la décision prise ce jour.",
    errGeneric: "Nous n'avons pas pu enregistrer cette fiche. Veuillez réessayer.",
    errOffline: "Vous êtes peut-être hors ligne. Vérifiez votre connexion et réessayez.",

    thankYouEyebrow: "Fiche de Suivi - Nouveaux Convertis",
    thankYouTitle: "Fiche enregistrée.",
    thankYouBody:
      "Les informations de ce nouveau converti ont été enregistrées. L'équipe de suivi lui affectera une église locale et un contact de discipulat.",
    thankYouBody2: "Merci de l'avoir accompagné(e) dans cette décision aujourd'hui.",
    thankYouAgain: "Remplir une autre fiche",
  },
} as const;

export type DictKey = keyof typeof dict["en"];
