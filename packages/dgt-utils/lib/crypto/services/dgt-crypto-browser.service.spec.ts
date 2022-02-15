/**
 * @jest-environment node
 */
import { DGTLoggerService } from '../../logging/services/dgt-logger.service';
import { DGTCryptoBrowserService } from './dgt-crypto-browser.service';

describe('DGTCryptoBrowserService', () => {

  let service: DGTCryptoBrowserService;

  const mockLogger: DGTLoggerService = {
    debug: jest.fn(),
  } as any;

  beforeEach(async () => {

    service = new DGTCryptoBrowserService(mockLogger);

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

});
