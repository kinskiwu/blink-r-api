import { encodeToBase62, isValidHttpUrl, isValidShortUrl } from './helpers';
//todo: add collision test for encodetoBase62
describe('encodeToBase62', () => {
  it('should correctly encode a given uniqueId to a base62 string', () => {
    expect(encodeToBase62('123')).toMatch(/^[0-9A-Za-z]+$/);
    expect(encodeToBase62('test')).toBe('7e'); // Assuming '7e' is the correct encoding for 'test'
    expect(encodeToBase62('')).toBe('');
  });

  it('should return unique encoded strings for different inputs and ensure they are <= 7 characters', () => {
    const uniqueId1 = 'abc';
    const uniqueId2 = 'def';
    const longUniqueId = '68f2f6ea-0676-47fc-b998-5e41dedcf2f7';

    expect(encodeToBase62(uniqueId1)).not.toBe(encodeToBase62(uniqueId2));
    expect(encodeToBase62(longUniqueId).length).toBeLessThanOrEqual(7);
  });

  it('should handle numeric strings and special characters consistently', () => {
    expect(encodeToBase62('1234567890')).toMatch(/^[0-9A-Za-z]+$/);
    expect(encodeToBase62('test!@#')).toMatch(/^[0-9A-Za-z]{1,7}$/);
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
  describe('when given valid inputs', () => {
    it.each(['http://cloudflare.com', 'https://cloudflare.com'])(
      'should return true for a valid URL: %s',
      (url) => {
        expect(isValidHttpUrl(url)).toBe(true);
      }
    );
  });

  describe('when given invalid inputs', () => {
    it.each([123, null, undefined, {}, [], true])(
      'should return false for non-string inputs: %s',
      (input) => {
        expect(isValidHttpUrl(input)).toBe(false);
      }
    );

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

    it('should return false for URLs with unsupported protocols', () => {
      expect(isValidHttpUrl('ftp://cloudflare.com')).toBe(false);
    });
  });
});
