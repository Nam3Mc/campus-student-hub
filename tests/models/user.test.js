const User = require('../../models/User');

describe('User model', () => {
  const baseUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    password: 'Password123!',
    major: 'CS',
  };

  it('creates and reads a user, hashing the password', async () => {
    const created = await User.create(baseUser);
    const found = await User.findById(created._id);
    expect(found).toBeTruthy();
    expect(found.email).toBe(baseUser.email);
    expect(found.password).not.toBe(baseUser.password); // hashed
    expect(found.password.length).toBeGreaterThan(20);
  });

  it('requires firstName, lastName, email', async () => {
    await expect(User.create({})).rejects.toThrow();
  });

  it('toJSON strips password and __v', async () => {
    const user = await User.create(baseUser);
    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });
});