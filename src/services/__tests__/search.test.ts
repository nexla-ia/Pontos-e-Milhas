import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { NormalizedFlight } from '../../types/flights';
import { deduplicateFlights, normalizeOffer, signatureOf, type SimplifiedOffer } from '../search';

const sampleOffer: SimplifiedOffer = {
  airline: 'G3',
  flightNumber: 'G3 1448',
  outbound: {
    departure: { airport: 'GRU', time: '2099-12-01T08:00:00' },
    arrival: { airport: 'CGB', time: '2099-12-01T11:15:00' },
    duration: 'PT3H15M',
    stops: 0,
  },
  price: { total: '1234.56', currency: 'BRL' },
  aircraft: 'B737',
};

describe('search services helpers', () => {
  it('normalizes offers into the expected shape', () => {
    const normalized = normalizeOffer(sampleOffer);
    assert.ok(normalized);
    assert.match(normalized!.signature, /GOL/);
    assert.ok(normalized?.fareFrom && Math.abs(normalized.fareFrom - 1234.56) < 0.01);
    assert.equal(normalized?.type, 'Direto');
  });

  it('deduplicates flights by signature', () => {
    const first = normalizeOffer(sampleOffer) as NormalizedFlight;
    const duplicate = { ...first, fareFrom: 9999 };
    const flights = deduplicateFlights([first, duplicate]);
    assert.equal(flights.length, 1);
    assert.equal(flights[0].fareFrom, first.fareFrom);
  });

  it('generates stable signatures', () => {
    const signature = signatureOf({
      airline: 'Test Airline',
      flightNumber: 'TA 100',
      departure: '2099-01-01T10:00:00',
      arrival: '2099-01-01T12:00:00',
    });
    assert.equal(signature, 'Test Airline|TA 100|2099-01-01T10:00:00|2099-01-01T12:00:00');
  });
});
