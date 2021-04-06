import fetch from 'node-fetch';

test('/drivers', async () => {
  const baseUrl = process.env.SERVICE_URL;

  const response = await fetch(`${baseUrl}/drivers`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const { count, data } = await response.json();

  expect(count).toStrictEqual(20);
  expect(data).toHaveLength(20);
});
