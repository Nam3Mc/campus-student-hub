const Resource = require('../../models/Resource');

describe('Resource model', () => {
  it('creates and reads a resource', async () => {
    const created = await Resource.create({
      title: 'Big-O cheatsheet',
      url: 'https://example.com/bigo.pdf',
      type: 'pdf',
      description: 'Handy reference',
    });
    const found = await Resource.findById(created._id);
    expect(found).toBeTruthy();
    expect(found.title).toBe('Big-O cheatsheet');
  });

  it('requires title, url, type, description', async () => {
    await expect(Resource.create({})).rejects.toThrow();
  });

  it('rejects an invalid type', async () => {
    await expect(
      Resource.create({
        title: 'x', url: 'x', type: 'invalid', description: 'x',
      })
    ).rejects.toThrow();
  });
});