import type { NormalizedFlight, SearchParams } from '../types/flights';

const MAX_PRICE = 999999999;

function durationToMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) {
    return MAX_PRICE;
  }

  const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
  return hours * 60 + minutes;
}

export function sortFlights(flights: NormalizedFlight[], mode: SearchParams['ordenacao']): NormalizedFlight[] {
  const copy = [...flights];

  if (mode === 'CHEAPEST') {
    return copy.sort((a, b) => (a.fareFrom ?? MAX_PRICE) - (b.fareFrom ?? MAX_PRICE));
  }

  if (mode === 'FASTEST') {
    return copy.sort((a, b) => durationToMinutes(a.duration) - durationToMinutes(b.duration));
  }

  return copy.sort((a, b) => {
    const priceA = a.fareFrom ?? MAX_PRICE;
    const priceB = b.fareFrom ?? MAX_PRICE;
    const scoreA = priceA + a.stops * 5000;
    const scoreB = priceB + b.stops * 5000;
    return scoreA - scoreB;
  });
}

export { durationToMinutes as durToMin };

