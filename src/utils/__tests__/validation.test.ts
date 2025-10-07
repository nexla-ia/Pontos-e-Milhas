import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SearchParams } from '../../types/flights';
import { isIATA, validateSearchParams } from '../validation';

const baseParams: SearchParams = {
  origem: 'GRU',
  destino: 'CGB',
  dataIda: '2099-12-01',
  dataVolta: '2099-12-10',
  somenteIda: false,
  adultos: 1,
  criancas: 0,
  bebes: 0,
  classe: 'economica',
  companhias: ['G3'],
  ordenacao: 'BEST',
};

describe('validation utils', () => {
  it('validates IATA codes', () => {
    assert.equal(isIATA('GRU'), true);
    assert.equal(isIATA('gru'), false);
    assert.equal(isIATA('GR'), false);
    assert.equal(isIATA('123'), false);
  });

  it('returns no errors for valid parameters', () => {
    const errors = validateSearchParams(baseParams);
    assert.deepEqual(errors, {});
  });

  it('detects invalid dates, routes and passengers', () => {
    const errors = validateSearchParams({
      ...baseParams,
      origem: 'AAA',
      destino: 'AAA',
      dataIda: '2020-01-01',
      dataVolta: '2019-12-31',
      adultos: 0,
      criancas: -1,
      bebes: -1,
    });

    assert.equal(errors.origem, undefined);
    assert.equal(errors.destino, 'Destino deve ser diferente da origem');
    assert.ok(errors.dataIda);
      assert.ok(errors.adultos);
    assert.ok(errors.criancas);
    assert.ok(errors.bebes);
    assert.ok(errors.passageiros);
  });
});
