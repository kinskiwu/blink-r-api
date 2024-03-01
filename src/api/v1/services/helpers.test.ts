import { encodeToBase62 } from "./helpers";

describe('encodeToBase62', () => {
  it('correctly encodes a given unique ID to a base62 string', () => {
    const uniqueId = '123';
    const result = encodeToBase62(uniqueId);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  })
});

