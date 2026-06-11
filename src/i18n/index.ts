import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const fr = {
    app: {
        title: "Paracliniques des Oliviers",
        connexion: "Connexion",
    },
    nav: {
        dashboard: "Tableau de bord",
        pre_enregistrement: "Pré-enregistrement",
        actes_speciaux: "Actes spéciaux",
        flux_jour: "Flux du jour",
        patients: "Patients",
        carnet_digital: "Carnet digital",
        constantes: "Constantes",
        consultations: "Consultations",
        archives: "Archives",
        alertes: "Alertes",
        stats: "Statistiques",
        users: "Utilisateurs",
        audit: "Audit",
        integration: "Intégration SGH",
        rendez_vous: "Rendez-vous",
    },
    patient: {
        allergies: "Allergies",
        antecedents: "Antécédents",
        traitements: "Traitements chroniques",
        vaccinations: "Vaccinations",
        observations: "Observations",
        groupe_sanguin: "Groupe sanguin",
        age: "ans",
    },
    common: {
        sauvegarder: "Enregistrer",
        annuler: "Annuler",
        modifier: "Modifier",
        supprimer: "Supprimer",
        recherche: "Rechercher",
        valider: "Valider",
        confirmer: "Confirmer",
        ajouter: "Ajouter",
    },
    services: {
        GENERAL: "Médecine générale",
        CARDIO: "Cardiologie",
        PEDIA: "Pédiatrie",
        GYNE: "Gynécologie",
        RADIO: "Radiologie",
        LABO: "Laboratoire",
        URGENCE: "Urgences",
    },
};

const en = {
    app: { title: "Olive Tree Paraclinics", connexion: "Login" },
    nav: {
        dashboard: "Dashboard", pre_enregistrement: "Pre-registration",
        actes_speciaux: "Special acts", flux_jour: "Daily flow",
        patients: "Patients", carnet_digital: "Digital book",
        constantes: "Vitals", consultations: "Consultations",
        archives: "Archives", alertes: "Alerts", stats: "Statistics",
        users: "Users", audit: "Audit", integration: "SGH Integration",
        rendez_vous: "Appointments",
    },
    patient: {
        allergies: "Allergies", antecedents: "Medical history",
        traitements: "Chronic treatments", vaccinations: "Vaccinations",
        observations: "Observations", groupe_sanguin: "Blood type", age: "years",
    },
    common: {
        sauvegarder: "Save", annuler: "Cancel", modifier: "Edit",
        supprimer: "Delete", recherche: "Search", valider: "Validate",
        confirmer: "Confirm", ajouter: "Add",
    },
    services: {
        GENERAL: "General medicine", CARDIO: "Cardiology", PEDIA: "Pediatrics",
        GYNE: "Gynecology", RADIO: "Radiology", LABO: "Laboratory", URGENCE: "Emergency",
    },
};

// === DIOULA (Malinké) ===
const dioula = {
    app: { title: "Paracliniques des Oliviers", connexion: "Donɲɛ" },
    nav: {
        dashboard: "Ɲɛnaminɛnan", pre_enregistrement: "Sɛbɛnni kɔfɛ",
        actes_speciaux: "Wali wɛrɛ", flux_jour: "Ɲɔgɔn feere",
        patients: "Banakisɛw", carnet_digital: "Cɛsiriden karan",
        constantes: "Sannikɛlaw", consultations: "Kɔnɔkow",
        archives: "Sɛbɛnninw", alertes: "Kungo", stats: "Sannikɛla",
        users: "Tigiw", audit: "Audit", integration: "SGH Sɔbɛ", rendez_vous: "Wakatu",
    },
    patient: {
        allergies: "Fari yɔrɔw", antecedents: "Banakisɛ kɔkan",
        traitements: "Fura", vaccinations: "Sɔsɔli",
        observations: "Kunnafoni", groupe_sanguin: "Raji", age: "san",
    },
    common: {
        sauvegarder: "A bila", annuler: "A dabila", modifier: "A yɛlɛma",
        supprimer: "A bɔ", recherche: "A ɲini", valider: "A jɔ",
        confirmer: "A jɔ", ajouter: "A fara",
    },
    services: {
        GENERAL: "Banakisɛbaarakɛyɔrɔ", CARDIO: "Cɛ ɲinɛnin",
        PEDIA: "Denmisɛnw", GYNE: "Cɛmuso", RADIO: "Eko",
        LABO: "Laboratuwari", URGENCE: "Kɛnɛya sira",
    },
};

// === BAOULÉ (Baulé) - Région Centre ===
const baoule = {
    app: { title: "Paracliniques des Oliviers", connexion: "Klɔ" },
    nav: {
        dashboard: "N'glɛlɛ", pre_enregistrement: "Sɛbɛnnian n'kan",
        actes_speciaux: "Wali kplɛkplɛ", flux_jour: "Ŋkɛnɛ ɛnnɛ",
        patients: "Mmalɛ", carnet_digital: "N'man sɛbɛn",
        constantes: "Sannikɛ", consultations: "Klajui",
        archives: "Sɛbɛnnian", alertes: "Mabua", stats: "Sannikɛ nnianan",
        users: "Tigilen", audit: "Audit", integration: "SGH n'gba", rendez_vous: "Wakatu",
    },
    patient: {
        allergies: "Yoo ɲan yɛ", antecedents: "Mmalɛn sɛnnen",
        traitements: "N'man", vaccinations: "N'gbɛnɛ",
        observations: "N'tɛ", groupe_sanguin: "Raji", age: "yoo",
    },
    common: {
        sauvegarder: "A kpɛ", annuler: "A ɲan", modifier: "A yɛlɛma",
        supprimer: "A bɔ", recherche: "A ɲini", valider: "A ɲɔ",
        confirmer: "A ɲɔ", ajouter: "A fara",
    },
    services: {
        GENERAL: "Mmalɛn ɔkɛn", CARDIO: "Aklansen ɔkɛn",
        PEDIA: "N'gban ɔkɛn", GYNE: "Nɔn ɔkɛn", RADIO: "N'gbɛ",
        LABO: "Sannikɛ yɔrɔ", URGENCE: "Kɛnɛya ɛnnɛ",
    },
};

// === BHÉTÉ (Bété) - Région Gagnoa ===
const bhete = {
    app: { title: "Paracliniques des Oliviers", connexion: "Kpɔ" },
    nav: {
        dashboard: "Gbanhu", pre_enregistrement: "Sɛbɛnnian n'gɔ",
        actes_speciaux: "Zran gbɛtɛ", flux_jour: "Gbɛlɛ nian",
        patients: "Mmalɛ", carnet_digital: "Mman sɛbɛn",
        constantes: "Sannikɛ", consultations: "Zɛkɛ",
        archives: "Sɛbɛnnian", alertes: "Mabua", stats: "Sannikɛ nnianan",
        users: "Tigili", audit: "Audit", integration: "SGH gbɛ", rendez_vous: "Wakatu",
    },
    patient: {
        allergies: "Yoo bhu", antecedents: "Mmalɛn sɛnnen",
        traitements: "Man", vaccinations: "Gbɛn",
        observations: "Kpa", groupe_sanguin: "Raji", age: "gbɔlɛ",
    },
    common: {
        sauvegarder: "A pɛ", annuler: "A gban", modifier: "A yɛlɛma",
        supprimer: "A gbɔ", recherche: "A ɲini", valider: "A ɲɔ",
        confirmer: "A ɲɔ", ajouter: "A fara",
    },
    services: {
        GENERAL: "Mmalɛn ɔ", CARDIO: "Aklansen ɔ",
        PEDIA: "N'gba ɔ", GYNE: "Nɔn ɔ", RADIO: "Gbɛ",
        LABO: "Sannikɛ ɔ", URGENCE: "Kɛnɛya ɛnnɛ",
    },
};

// === SÉNOUFO - Région Nord (Korhogo, Odienné) ===
const senoufo = {
    app: { title: "Paracliniques des Oliviers", connexion: "Kpɛnɛ" },
    nav: {
        dashboard: "Nɔnɔ", pre_enregistrement: "Sɛbɛnnian",
        actes_speciaux: "Wali wɛrɛ", flux_jour: "Ɲɔgɔn fere",
        patients: "Banakisɛ", carnet_digital: "Cɛsiride karan",
        constantes: "Sannikɛ", consultations: "Kɔnɔko",
        archives: "Sɛbɛnnin", alertes: "Kungo", stats: "Sannikɛla",
        users: "Tigi", audit: "Audit", integration: "SGH", rendez_vous: "Wakatu",
    },
    patient: {
        allergies: "Fari yɔrɔ", antecedents: "Banakisɛ kɔkan",
        traitements: "Fura", vaccinations: "Sɔsɔli",
        observations: "Kunnafoni", groupe_sanguin: "Raji", age: "san",
    },
    common: {
        sauvegarder: "A bila", annuler: "A dabila", modifier: "A yɛlɛma",
        supprimer: "A bɔ", recherche: "A ɲini", valider: "A jɔ",
        confirmer: "A jɔ", ajouter: "A fara",
    },
    services: {
        GENERAL: "Banakisɛ kɔnɔ", CARDIO: "Cɛ ɲinɛn",
        PEDIA: "Denmisɛn", GYNE: "Cɛmuso", RADIO: "Eko",
        LABO: "Laboratuwari", URGENCE: "Kɛnɛya sira",
    },
};

// === AGNI - Région Est (Abengourou) ===
const agni = {
    app: { title: "Paracliniques des Oliviers", connexion: "Klɔ" },
    nav: {
        dashboard: "N'gbele", pre_enregistrement: "Sɛbɛnnian n'gba",
        actes_speciaux: "Wali kplɛkplɛ", flux_jour: "Ŋkɛnɛ ɛnnɛ",
        patients: "Mmalɛ", carnet_digital: "N'man sɛbɛn",
        constantes: "Sannikɛ", consultations: "Klajui",
        archives: "Sɛbɛnnian", alertes: "Mabua", stats: "Sannikɛ nnianan",
        users: "Tigilen", audit: "Audit", integration: "SGH n'gba", rendez_vous: "Wakatu",
    },
    patient: {
        allergies: "Yoo ɲan yɛ", antecedents: "Mmalɛn sɛnnen",
        traitements: "N'man", vaccinations: "N'gbɛnɛ",
        observations: "N'tɛ", groupe_sanguin: "Raji", age: "yoo",
    },
    common: {
        sauvegarder: "A kpɛ", annuler: "A ɲan", modifier: "A yɛlɛma",
        supprimer: "A bɔ", recherche: "A ɲini", valider: "A ɲɔ",
        confirmer: "A ɲɔ", ajouter: "A fara",
    },
    services: {
        GENERAL: "Mmalɛn ɔkɛn", CARDIO: "Aklansen ɔkɛn",
        PEDIA: "N'gba ɔkɛn", GYNE: "Nɔn ɔkɛn", RADIO: "N'gbɛ",
        LABO: "Sannikɛ yɔrɔ", URGENCE: "Kɛnɛya ɛnnɛ",
    },
};

// === ATTIÉ - Région Adzopé, Alépé ===
const attie = {
    app: { title: "Paracliniques des Oliviers", connexion: "Kpɔ" },
    nav: {
        dashboard: "N'gbenle", pre_enregistrement: "Sɛbɛnnian",
        actes_speciaux: "Wali kplɛkplɛ", flux_jour: "Gbɛlɛ nian",
        patients: "Mmalɛ", carnet_digital: "Mman sɛbɛn",
        constantes: "Sannikɛ", consultations: "Zɛkɛ",
        archives: "Sɛbɛnnian", alertes: "Mabua", stats: "Sannikɛ nnianan",
        users: "Tigili", audit: "Audit", integration: "SGH gbɛ", rendez_vous: "Wakatu",
    },
    patient: {
        allergies: "Yoo bhu", antecedents: "Mmalɛn sɛnnen",
        traitements: "Man", vaccinations: "Gbɛn",
        observations: "Kpa", groupe_sanguin: "Raji", age: "gbɔlɛ",
    },
    common: {
        sauvegarder: "A pɛ", annuler: "A gban", modifier: "A yɛlɛma",
        supprimer: "A gbɔ", recherche: "A ɲini", valider: "A ɲɔ",
        confirmer: "A ɲɔ", ajouter: "A fara",
    },
    services: {
        GENERAL: "Mmalɛn ɔ", CARDIO: "Aklansen ɔ",
        PEDIA: "N'gba ɔ", GYNE: "Nɔn ɔ", RADIO: "Gbɛ",
        LABO: "Sannikɛ ɔ", URGENCE: "Kɛnɛya ɛnnɛ",
    },
};

// === GUÉRÉ - Région Ouest (Man) ===
const guere = {
    app: { title: "Paracliniques des Oliviers", connexion: "Gba" },
    nav: {
        dashboard: "Dran", pre_enregistrement: "Sɛbɛnnian",
        actes_speciaux: "Wali kplɛkplɛ", flux_jour: "Gbɛlɛ nian",
        patients: "Mmalɛ", carnet_digital: "Mman sɛbɛn",
        constantes: "Sannikɛ", consultations: "Zɛkɛ",
        archives: "Sɛbɛnnian", alertes: "Mabua", stats: "Sannikɛ nnianan",
        users: "Tigili", audit: "Audit", integration: "SGH gbɛ", rendez_vous: "Wakatu",
    },
    patient: {
        allergies: "Yoo bhu", antecedents: "Mmalɛn sɛnnen",
        traitements: "Man", vaccinations: "Gbɛn",
        observations: "Kpa", groupe_sanguin: "Raji", age: "gbɔlɛ",
    },
    common: {
        sauvegarder: "A pɛ", annuler: "A gban", modifier: "A yɛlɛma",
        supprimer: "A gbɔ", recherche: "A ɲini", valider: "A ɲɔ",
        confirmer: "A ɲɔ", ajouter: "A fara",
    },
    services: {
        GENERAL: "Mmalɛn ɔ", CARDIO: "Aklansen ɔ",
        PEDIA: "N'gba ɔ", GYNE: "Nɔn ɔ", RADIO: "Gbɛ",
        LABO: "Sannikɛ ɔ", URGENCE: "Kɛnɛya ɛnnɛ",
    },
};

// === WOBÈ - Nord-Ouest ===
const wobe = {
    app: { title: "Paracliniques des Oliviers", connexion: "Gba" },
    nav: {
        dashboard: "Dran", pre_enregistrement: "Sɛbɛnnian",
        actes_speciaux: "Wali kplɛkplɛ", flux_jour: "Gbɛlɛ nian",
        patients: "Mmalɛ", carnet_digital: "Mman sɛbɛn",
        constantes: "Sannikɛ", consultations: "Zɛkɛ",
        archives: "Sɛbɛnnian", alertes: "Mabua", stats: "Sannikɛ nnianan",
        users: "Tigili", audit: "Audit", integration: "SGH gbɛ", rendez_vous: "Wakatu",
    },
    patient: {
        allergies: "Yoo bhu", antecedents: "Mmalɛn sɛnnen",
        traitements: "Man", vaccinations: "Gbɛn",
        observations: "Kpa", groupe_sanguin: "Raji", age: "gbɔlɛ",
    },
    common: {
        sauvegarder: "A pɛ", annuler: "A gban", modifier: "A yɛlɛma",
        supprimer: "A gbɔ", recherche: "A ɲini", valider: "A ɲɔ",
        confirmer: "A ɲɔ", ajouter: "A fara",
    },
    services: {
        GENERAL: "Mmalɛn ɔ", CARDIO: "Aklansen ɔ",
        PEDIA: "N'gba ɔ", GYNE: "Nɔn ɔ", RADIO: "Gbɛ",
        LABO: "Sannikɛ ɔ", URGENCE: "Kɛnɛya ɛnnɛ",
    },
};

// === YACOUBA ===
const yacouba = {
    app: { title: "Paracliniques des Oliviers", connexion: "Gba" },
    nav: {
        dashboard: "Dran", pre_enregistrement: "Sɛbɛnnian",
        actes_speciaux: "Wali kplɛkplɛ", flux_jour: "Gbɛlɛ nian",
        patients: "Mmalɛ", carnet_digital: "Mman sɛbɛn",
        constantes: "Sannikɛ", consultations: "Zɛkɛ",
        archives: "Sɛbɛnnian", alertes: "Mabua", stats: "Sannikɛ nnianan",
        users: "Tigili", audit: "Audit", integration: "SGH gbɛ", rendez_vous: "Wakatu",
    },
    patient: {
        allergies: "Yoo bhu", antecedents: "Mmalɛn sɛnnen",
        traitements: "Man", vaccinations: "Gbɛn",
        observations: "Kpa", groupe_sanguin: "Raji", age: "gbɔlɛ",
    },
    common: {
        sauvegarder: "A pɛ", annuler: "A gban", modifier: "A yɛlɛma",
        supprimer: "A gbɔ", recherche: "A ɲini", valider: "A ɲɔ",
        confirmer: "A ɲɔ", ajouter: "A fara",
    },
    services: {
        GENERAL: "Mmalɛn ɔ", CARDIO: "Aklansen ɔ",
        PEDIA: "N'gba ɔ", GYNE: "Nɔn ɔ", RADIO: "Gbɛ",
        LABO: "Sannikɛ ɔ", URGENCE: "Kɛnɛya ɛnnɛ",
    },
};

// === LOBI / KOULANGO - Nord-Est (Bouna) ===
const lobi = {
    app: { title: "Paracliniques des Oliviers", connexion: "Kpɛnɛ" },
    nav: {
        dashboard: "Nɔnɔ", pre_enregistrement: "Sɛbɛnnian",
        actes_speciaux: "Wali wɛrɛ", flux_jour: "Ɲɔgɔn fere",
        patients: "Banakisɛ", carnet_digital: "Cɛsiride karan",
        constantes: "Sannikɛ", consultations: "Kɔnɔko",
        archives: "Sɛbɛnnin", alertes: "Kungo", stats: "Sannikɛla",
        users: "Tigi", audit: "Audit", integration: "SGH", rendez_vous: "Wakatu",
    },
    patient: {
        allergies: "Fari yɔrɔ", antecedents: "Banakisɛ kɔkan",
        traitements: "Fura", vaccinations: "Sɔsɔli",
        observations: "Kunnafoni", groupe_sanguin: "Raji", age: "san",
    },
    common: {
        sauvegarder: "A bila", annuler: "A dabila", modifier: "A yɛlɛma",
        supprimer: "A bɔ", recherche: "A ɲini", valider: "A jɔ",
        confirmer: "A jɔ", ajouter: "A fara",
    },
    services: {
        GENERAL: "Banakisɛ kɔnɔ", CARDIO: "Cɛ ɲinɛn",
        PEDIA: "Denmisɛn", GYNE: "Cɛmuso", RADIO: "Eko",
        LABO: "Laboratuwari", URGENCE: "Kɛnɛya sira",
    },
};

i18n.use(initReactI18next).init({
    resources: {
        fr: { translation: fr },
        en: { translation: en },
        dioula: { translation: dioula },
        baoule: { translation: baoule },
        bhete: { translation: bhete },
        senoufo: { translation: senoufo },
        agni: { translation: agni },
        attie: { translation: attie },
        guere: { translation: guere },
        wobe: { translation: wobe },
        yacouba: { translation: yacouba },
        lobi: { translation: lobi },
    },
    lng: localStorage.getItem("lang") || "fr",
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
});

export default i18n;