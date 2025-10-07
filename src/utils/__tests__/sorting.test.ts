import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { NormalizedFlight } from '../../types/flights';
import { sortFlights } from '../sorting';

const flights: NormalizedFlight[] = [
  {
    signature: 'G3|1000|2025-01-01T10:00:00|2025-01-01T12:00:00',
    airline: 'GOL',
    flightNumber: 'G3 1000',
    origin: 'GRU',
    destination: 'BSB',
    departure: '2025-01-01T10:00:00',
    arrival: '2025-01-01T12:00:00',
    duration: 'PT2H',
    stops: 0,
    type: 'Direto',
    fareFrom: 1200,
    miles: 8000,
  },
  {
    signature: 'LA|800|2025-01-01T09:00:00|2025-01-01T13:30:00',
    airline: 'LATAM',
    flightNumber: 'LA 800',
    origin: 'GRU',
    destination: 'BSB',
    departure: '2025-01-01T09:00:00',
    arrival: '2025-01-01T13:30:00',
    duration: 'PT4H30M',
    stops: 1,
    type: 'Paradas',
    fareFrom: 950,
    miles: 7600,
  },
  {
    signature: 'AZ|4100|2025-01-01T11:00:00|2025-01-01T13:00:00',
    airline: 'Azul',
    flightNumber: 'AD 4100',
    origin: 'GRU',
    destination: 'BSB',
    departure: '2025-01-01T11:00:00',
    arrival: '2025-01-01T13:00:00',
    duration: 'PT2H',
    stops: 0,
    type: 'Direto',
    fareFrom: 1500,
    miles: 8200,
  },
];

describe('sortFlights', () => {
  it('sorts by cheapest fare', () => {
    const sorted = sortFlights(flights, 'CHEAPEST');
    assert.equal(sorted[0].signature, 'LA|800|2025-01-01T09:00:00|2025-01-01T13:30:00');
  });

  it('sorts by fastest duration', () => {
    const sorted = sortFlights(flights, 'FASTEST');
    assert.equal(sorted[0].duration, 'PT2H');
  });

  it('sorts by best heuristic', () => {
    const sorted = sortFlights(flights, 'BEST');
    assert.equal(sorted[0].stops, 0);
  });
});
