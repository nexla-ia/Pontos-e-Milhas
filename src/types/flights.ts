export interface SearchParams {
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
  somenteIda: boolean;
  adultos: number;
  criancas: number;
  bebes: number;
  classe: 'economica' | 'executiva';
  companhias: string[];
  ordenacao: 'BEST' | 'CHEAPEST' | 'FASTEST';
}

export type NormalizedFlight = {
  signature: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  aircraft?: string;
  operatedBy?: string;
  type: 'Direto' | 'Paradas';
  fareFrom?: number;
  miles?: number | null;
};

export interface FormErrors {
  [key: string]: string;
}
