import { encodeToBase62, isValidHttpUrl, isValidShortUrl } from "./helpers";

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

describe('isValidShortUrl', () => {
  test('returns true for valid shortUrl', () => {
    expect(isValidShortUrl('mockexample')).toBe(true);
    expect(isValidShortUrl('123')).toBe(true);
  });

  test('returns false for invalid shortUrl', () => {
    expect(isValidShortUrl('')).toBe(false);
    expect(isValidShortUrl('mock$example')).toBe(false);
    expect(isValidShortUrl('1 23')).toBe(false);
  });

});

describe('isValidHttpUrl', () => {
  test('returns true for valid http url', () => {
    expect(isValidHttpUrl('https://www.example.com/')).toBe(true);
    expect(isValidHttpUrl('http://www.example.com/')).toBe(true);
    expect(isValidHttpUrl('https://www.google.com/')).toBe(true);
  })

  test('return false for invalid http url', () => {
    expect(isValidHttpUrl('www.example.com/')).toBe(false);
    expect(isValidHttpUrl('mailto://www.example.com/')).toBe(false);
    expect(isValidHttpUrl('google')).toBe(false);
  })
})


