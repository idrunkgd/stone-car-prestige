export type RequestStatus = "nouveau" | "traite";

/** Demande de réservation / devis envoyée depuis le site public. */
export type BookingRequest = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  vehicle?: string;
  service: string;
  preferredDate?: string;
  atHome: boolean;
  message?: string;
  status: RequestStatus;
};
