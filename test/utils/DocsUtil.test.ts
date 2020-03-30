import DocsUtil from '../../src/utils/DocsUtil';

describe('Docs Util functionality', () => {
  test('It should fail due to invalid docs', () => {
    expect(DocsUtil.load).toThrow();
  });

  test('It should pass due to a valid docs', () => {
    expect(typeof DocsUtil.load(DocsUtil.API_VERSION.V1)).toBe('object');
  });
});
