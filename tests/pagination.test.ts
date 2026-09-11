import test from 'node:test';
import assert from 'node:assert/strict';
import { pageRange } from '../src/lib/pagination';

test('compact pages preserve endpoints, current position and bounded output', () => {
  for (const total of [1, 2, 7, 8, 20, 1000]) {
    for (let current = 1; current <= total; current++) {
      const pages = pageRange(current, total);
      const numbers = pages.filter(
        (page): page is number => typeof page === 'number',
      );
      assert.equal(numbers[0], 1);
      assert.equal(numbers.at(-1), total);
      assert.ok(numbers.includes(current));
      assert.ok(pages.length <= 7);
      assert.equal(new Set(numbers).size, numbers.length);
      assert.deepEqual(
        numbers,
        [...numbers].sort((a, b) => a - b),
      );
      if (total <= 7) assert.equal(numbers.length, total);
    }
  }
});
test('pagination normalizes out-of-range positions', () => {
  assert.deepEqual(pageRange(-2, 3), [1, 2, 3]);
  assert.deepEqual(pageRange(200, 10), [1, 'gap', 6, 7, 8, 9, 10]);
});
