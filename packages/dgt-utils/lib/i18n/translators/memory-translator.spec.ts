import fetchMock from 'jest-fetch-mock';
import { TRANSLATIONS_LOADED } from '../models/translator';
import { MemoryTranslator } from './memory-translator';

describe('MemoryTranslator', () => {

  let service: MemoryTranslator;

  const mockResponse = JSON.stringify({
    'foo': {
      'foo': 'Foo',
      'bar': 'Bar',
    },
  });

  beforeEach(async () => {

    fetchMock.resetMocks();

    fetchMock.mockResponse(mockResponse);

    service = new MemoryTranslator('en-GB');

  });

  afterEach(() => {

    fetchMock.resetMocks();

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('translate', () => {

    it('Should return an existing key in an existing locale.', () => {

      const value = service.translate('foo.foo');

      expect(value).toBe('Foo');

    });

    it('Should translate by using the default locale when no locale was given.', () => {

      const value = service.translate('foo.bar');

      expect(value).toBe('Bar');

    });

    it('Should return the input key with an non-existing key in an existing locale.', () => {

      const value = service.translate('lorem');

      expect(value).toBe('[lorem]');

    });

    it('Should throw error when key is undefined.', () => {

      expect(()=>service.translate('')).toThrow(Error);

    });

  });

  describe('setLang', () => {

    const newLang = 'en-US';

    it('should not set new language when invalid JSON', async () => {

      fetchMock.mockIf(/en-US/, '<not-json>');
      fetchMock.mockIf(/en-GB/, mockResponse);

      await service.setLang(newLang);

      expect(service.lang).not.toEqual(newLang);

    });

    it('should not set new language when fetch throws error', async () => {

      fetchMock.mockResponse(async (req) => {

        if (req.url.includes('en-US')) {

          throw new Error();

        } else {

          return mockResponse;

        }

      });

      await service.setLang(newLang);

      expect(service.lang).not.toEqual(newLang);

    });

    it('should set new language correctly', async () => {

      await service.setLang('nl-BE');

      expect(service.getLang()).toBe('nl-BE');

    });

    it('should fire event when done', async () => {

      const prom = new Promise<void>((resolve) => {

        service.addEventListener(TRANSLATIONS_LOADED, () => resolve());

      });

      await service.setLang('nl-BE');

      await expect(prom).resolves.toBeUndefined();

    });

  });

  describe('getLang', () => {

    it('should return the current language', async () => {

      expect(service.getLang()).toEqual(service.lang);

    });

  });

});
