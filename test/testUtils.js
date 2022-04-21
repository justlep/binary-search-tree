import chai from 'chai';

chai.should();

/**
 * Return an array with the numbers from 0 to n-1, in a random order
 */
export const getRandomArray = (n) => new Array(n).fill(0).map((foo,i) => i).sort(() => Math.random() - 0.5);

export const {assert, expect} = chai;
