import { test, expect } from '@playwright/test';

test('user can join a public group', async ({ page, request }, testInfo) => {
  const suffix = `${testInfo.project.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const password = 'TestPassword123';
  const ownerUsername = `e2e_owner_${suffix}`;
  const memberUsername = `e2e_user_${suffix}`;
  const groupName = `E2E Testiryhmä ${suffix}`;
  let groupId: number | null = null;

  try {
    // Luo ryhmän omistaja ja julkinen testiryhmä API:n kautta
    const ownerRegisterRes = await request.post('/api/auth/register', {
      data: { username: ownerUsername, password },
    });
    expect(ownerRegisterRes.status()).toBe(201);

    const ownerLoginRes = await request.post('/api/auth/login', {
      data: { username: ownerUsername, password },
    });
    expect(ownerLoginRes.ok()).toBeTruthy();

    const createGroupRes = await request.post('/api/groups', {
      data: {
        name: groupName,
        description: 'Playwright E2E -testiryhmä',
        isPrivate: false,
      },
    });
    expect(createGroupRes.status()).toBe(201);
    const createdGroup = await createGroupRes.json();
    groupId = createdGroup.id;

    // Luo toinen käyttäjä, joka kirjautuu ja liittyy ryhmään
    const memberRegisterRes = await request.post('/api/auth/register', {
      data: { username: memberUsername, password },
    });
    expect(memberRegisterRes.status()).toBe(201);

    // Kirjaudu sisään UI:n kautta
    await page.goto('/kirjaudu');
    await page.getByLabel('Käyttäjätunnus').fill(memberUsername);
    await page.getByLabel('Salasana').fill(password);
    await page.getByRole('button', { name: 'Kirjaudu' }).click();

    await expect(page.getByRole('button', { name: 'Kirjaudu ulos' })).toBeVisible();

    // Avaa Ryhmät-sivu ja siirry julkiseen testiryhmään
    await page.getByRole('link', { name: 'Ryhmät' }).click();
    await page.getByRole('link', { name: groupName }).click();

    // Liity ryhmään ja varmista lopputila
    await page.getByRole('button', { name: 'Liity ryhmään' }).click();

    await expect(page.getByRole('status')).toContainText('Liityit ryhmään onnistuneesti');
    await expect(page.getByRole('button', { name: 'Poistu ryhmästä' })).toBeVisible();
  } finally {
    // Siivoa testiryhmä pois: ensin jäsen poistuu, sitten omistaja -> ryhmä poistuu automaattisesti
    if (groupId !== null) {
      await page.request.delete(`/api/groups/${groupId}/leave`).catch(() => {});
      await request.delete(`/api/groups/${groupId}/leave`).catch(() => {});
    }
  }
});
