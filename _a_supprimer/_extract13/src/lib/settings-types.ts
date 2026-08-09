export type BusinessSettings = {
  name: string;
  companyNumber: string;
  vat: string;
  iban: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
};

export const DEFAULT_SETTINGS: BusinessSettings = {
  name: "Stone Car Prestige",
  companyNumber: "BE 0123.456.789",
  vat: "BE0123.456.789",
  iban: "BE00 0000 0000 0000",
  address: "Thuin, Belgique",
  phone: "0499 91 29 32",
  email: "contact@stonecarprestige.be",
  hours: "Lun–Ven 9h–18h · Sam 9h–13h",
};
