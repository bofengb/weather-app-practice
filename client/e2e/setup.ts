export const testUser = {
  username: 'e2etest',
  email: 'e2e@test.com',
  password: 'Test123456!',
};

// register test user before all tests
async function globalSetup(): Promise<void> {
  try {
    await fetch('http://localhost:4000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
  } catch {
    // user may already exist, that's fine
  }
}

export default globalSetup;
