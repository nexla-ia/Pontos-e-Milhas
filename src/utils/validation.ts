import type { FormErrors, SearchParams } from '../types/flights';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const isIATA = (value: string): boolean => /^[A-Z]{3}$/.test(value.trim());

export function validateSearchParams(params: SearchParams): FormErrors {
  const errors: FormErrors = {};

  const origin = params.origem.trim().toUpperCase();
  const destination = params.destino.trim().toUpperCase();

  if (!origin) {
    errors.origem = 'Origem é obrigatória';
  } else if (!isIATA(origin)) {
    errors.origem = 'Informe um código IATA válido';
  }

  if (!destination) {
    errors.destino = 'Destino é obrigatório';
  } else if (!isIATA(destination)) {
    errors.destino = 'Informe um código IATA válido';
  } else if (!errors.origem && origin === destination) {
    errors.destino = 'Destino deve ser diferente da origem';
  }

  if (!params.dataIda) {
    errors.dataIda = 'Data de ida é obrigatória';
  } else if (!DATE_REGEX.test(params.dataIda)) {
    errors.dataIda = 'Data de ida inválida';
  } else {
    const departure = new Date(`${params.dataIda}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(departure.getTime())) {
      errors.dataIda = 'Data de ida inválida';
    } else if (departure < today) {
      errors.dataIda = 'Data de ida não pode estar no passado';
    }
  }

  if (!params.somenteIda) {
    if (!params.dataVolta) {
      errors.dataVolta = 'Data de volta é obrigatória';
    } else if (!DATE_REGEX.test(params.dataVolta)) {
      errors.dataVolta = 'Data de volta inválida';
    } else if (!errors.dataIda) {
      const departure = new Date(`${params.dataIda}T00:00:00`);
      const returnDate = new Date(`${params.dataVolta}T00:00:00`);
      if (Number.isNaN(returnDate.getTime())) {
        errors.dataVolta = 'Data de volta inválida';
      } else if (returnDate < departure) {
        errors.dataVolta = 'Data de volta deve ser após a data de ida';
      }
    }
  }

  if (params.adultos < 1) {
    errors.adultos = 'Ao menos 1 adulto é obrigatório';
  }

  if (params.criancas < 0) {
    errors.criancas = 'Valor inválido';
  }

  if (params.bebes < 0) {
    errors.bebes = 'Valor inválido';
  }

  const totalPassengers = params.adultos + params.criancas + params.bebes;
  if (totalPassengers < 1) {
    errors.passageiros = 'Informe ao menos um passageiro';
  }

  return errors;
}

export function sanitizeSearchParams(params: SearchParams): SearchParams {
  return {
    ...params,
    origem: params.origem.trim().toUpperCase(),
    destino: params.destino.trim().toUpperCase(),
    dataVolta: params.somenteIda ? '' : params.dataVolta,
    companhias: [...new Set(params.companhias)].sort(),
  };
}
