import { encodeToBase62, isValidUrl } from "./helpers";

describe('encodeToBase62', () => {
  it('correctly encodes a given uniqueId to a base62 string', () => {
    const uniqueId = '123';
    const result = encodeToBase62(uniqueId);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  })

  it('returns a known base62 string for a specific uniqueId', () => {
    const uniqueId = 'test';
    const expectedResult = '7e';//'7e' is the result for encoding 'test'
    const result = encodeToBase62(uniqueId);

    expect(result).toBe(expectedResult);
  });

  it('handles an empty string input', () => {
    const uniqueId = '';
    const result = encodeToBase62(uniqueId);

    expect(result).toBe('');
  });

  it('returns different encoded strings for different uniqueIds', () => {
    const uniqueId1 = 'abc';
    const uniqueId2 = 'def';
    const result1 = encodeToBase62(uniqueId1);
    const result2 = encodeToBase62(uniqueId2);

    expect(result1).not.toBe(result2);
  });
});

describe('isValidUrl', () => {
  test('returns true for valid strings', () => {
    expect(isValidUrl('http://mockexample.com')).toBe(true);
    expect(isValidUrl('https://www.mockexample.com/path?name=query')).toBe(true);
    expect(isValidUrl('  https://www.mockexample.com/path?name=query  ')).toBe(true);
  });

  test('returns false for invalid strings', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl(' ')).toBe(false);
    expect(isValidUrl(null)).toBe(false);
    expect(isValidUrl(undefined)).toBe(false);
    expect(isValidUrl(123)).toBe(false);
  });
});


