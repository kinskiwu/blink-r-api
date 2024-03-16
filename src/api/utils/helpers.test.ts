import { encodeToBase62, isValidHttpUrl, isValidShortUrl } from './helpers';

describe('encodeToBase62', () => {
  it('correctly encodes a given uniqueId to a base62 string', () => {
    const uniqueId = '123';
    const result = encodeToBase62(uniqueId);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns a known base62 string for a specific uniqueId', () => {
    const uniqueId = 'test';
    const expectedResult = '7e'; //'7e' is the result for encoding 'test'
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

  it('the encoded string should be less than or equal to 7 characters', () => {
    const uniqueId1 = '68f2f6ea-0676-47fc-b998-5e41dedcf2f7';
    const uniqueId2 = 'f8a42fc1-264f-4b90-9176-eba2cd92738c';
    const result1 = encodeToBase62(uniqueId1);
    const result2 = encodeToBase62(uniqueId2);

    expect(result1.length).toBeLessThanOrEqual(7);
    expect(result2.length).toBeLessThanOrEqual(7);
  });
});

describe('isValidShortUrl', () => {
  describe('when given valid shortUrls', () => {
    it.each(['cloud', '123', 'abc123'])(
      'should return true for "%s"',
      (shortUrl) => {
        expect(isValidShortUrl(shortUrl)).toBe(true);
      }
    );
  });

  describe('when given invalid shortUrls', () => {
    it.each(['', 'mock$example', '1 23', '!@#', 'mock|example'])(
      'should return false for "%s"',
      (shortUrl) => {
        expect(isValidShortUrl(shortUrl)).toBe(false);
      }
    );
  });

  describe('when given non-string inputs', () => {
    it.each([
      [123, 'number'],
      [{}, 'object'],
      [[], 'array'],
      [undefined, 'undefined'],
      [null, 'null'],
    ])('should return false for a %s input', (input, description) => {
      expect(isValidShortUrl(input)).toBe(false);
    });
  });
  describe('when input exceeds max length of 7 characters', () => {
    it.each(['12345678', 'abcdefghijklmn'])(
      'should return false for "%s"',
      (shortUrl) => {
        expect(isValidShortUrl(shortUrl)).toBe(false);
      }
    );
  });
});

describe('isValidHttpUrl', () => {
  describe('valid inputs', () => {
    it('should return true for valid http and https URLs', () => {
      const validHttpUrl = 'http://cloudflare.com';
      const validHttpsUrl = 'https://cloudflare.com';
      expect(isValidHttpUrl(validHttpUrl)).toBe(true);
      expect(isValidHttpUrl(validHttpsUrl)).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should return false for non-string inputs', () => {
      const inputs = [123, null, undefined, {}, [], true];
      inputs.forEach((input) => {
        expect(isValidHttpUrl(input)).toBe(false);
      });
    });

    it.each([
      'ftp://cloudflare.com',
      'httpss://cloudflare.com',
      '://cloudflare.com',
      'http:/cloudflare.com',
      'https:/cloudflare.com',
      'http://',
      '',
    ])(
      'should return false for strings that are not valid http or https URLs: %s',
      (url) => {
        expect(isValidHttpUrl(url)).toBe(false);
      }
    );

    it('should return false for valid URLs with protocols other than http or https', () => {
      const validFtpUrl = 'ftp://cloudflare.com';
      expect(isValidHttpUrl(validFtpUrl)).toBe(false);
    });
  });
});
