import { md5 } from '.';

describe('md5', () => {
  it('should return a correct hash', () => {
    expect(md5('sausage')).toBe('8b433670258f79578f9a4e5ea388b007');
  });
});
