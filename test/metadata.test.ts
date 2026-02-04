import nock from 'nock';
import {URL} from 'url';
import {expect, jest, describe, afterEach, it, test} from '@jest/globals';

import {privateExports} from '../src/metadata';
import {
  ENTERPRISE_METADATA_URL,
  COMMUNITY_METADATA_URL
} from '../src/constants';
import {loadFixture} from './utils/fixtures';

describe('Metadata module', () => {
  const metadataContent = loadFixture('maven.xml');
  const metadata = privateExports.functions!;

  afterEach(() => {
    jest.restoreAllMocks();
    nock.cleanAll();
  });

  test.each([
    ['community', COMMUNITY_METADATA_URL],
    ['enterprise', ENTERPRISE_METADATA_URL]
  ])(
    'should loads remote metadata from %s endpoint',
    async (edition, metaDataUrl) => {
      const url = new URL(metaDataUrl);
      const scope = nock(url.origin)
        .get(url.pathname)
        .reply(200, metadataContent, {
          'Content-Type': 'text/plain'
        });

      const versions = await metadata.downloadToolMetadata(metaDataUrl);
      expect(versions).toBe(metadataContent);
      expect(scope.isDone()).toBe(true);
    }
  );

  it('parses the versions', async () => {
    const meta = await metadata.parseAvailableVersions(metadataContent);
    expect(meta.latest).toBe('10.11.0');
    expect(meta.availableVersions).toHaveLength(18);
  });

  test.each([
    ['application/xml', true],
    ['application/xml;charset=UTF-8', true],
    ['text/plain', true],
    ['application/json', false],
    ['text/html', false]
  ])('allows content type %p: %p', (contentType, result) => {
    expect(metadata.isAllowedContentType(contentType)).toBe(result);
  });
});
