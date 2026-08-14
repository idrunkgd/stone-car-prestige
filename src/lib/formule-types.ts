/** Formule (package) commercialisée — configurable depuis l'admin. */
export type Formule = {
  id: string;
  name: string;
  description: string;
  /** Mise en avant (badge « Le plus choisi »). */
  highlight?: boolean;
  order: number;
  /** Prestations incluses (ids du catalogue). Le prix « dès » est la somme
   *  du plus petit tarif de chaque prestation incluse. */
  serviceIds: string[];
};
