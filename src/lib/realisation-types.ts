/** Un jeu de photos avant / après (une voiture peut en avoir plusieurs). */
export type PhotoSet = {
  id: string;
  /** Étiquette optionnelle du set (ex. « Extérieur », « Jantes », « Habitacle »). */
  label?: string;
  before: string; // data URL
  after: string; // data URL
};

/**
 * Une réalisation = un véhicule mis en avant sur le blog photo, avec un ou
 * plusieurs sets avant/après (« plusieurs set de photo par voiture »).
 */
export type Realisation = {
  id: string;
  title: string; // ex. « Chrysler 300C »
  vehicle?: string; // détail véhicule / plaque (optionnel)
  description?: string; // texte affiché sous le titre
  tag?: string; // ex. « Céramique », « Polissage », « Rénovation vitrage »
  /** Mise en avant sur le site (affichée en premier). */
  featured?: boolean;
  /** Visible sur le site public. Décoché = brouillon admin. */
  published: boolean;
  createdAt: string;
  order: number;
  sets: PhotoSet[];
};
