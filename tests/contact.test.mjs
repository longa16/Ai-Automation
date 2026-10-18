import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server.mjs';

const valid = { name: 'Camille Test', email: 'camille@example.test', company: 'Entreprise de test', service: 'Mes prospects', message: 'Je souhaite simplifier le suivi de mes rendez-vous.', consent: 'on', website: '' };

test('Le formulaire conserve une demande validée et refuse les données invalides', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'agency-test-'));
  const app = await createApp({ dataDirectory: directory });
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.address().port}`;
  const post = (data, headers = {}) => fetch(base + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(data) });
  try {
    assert.equal((await fetch(base + '/api/health')).status, 200);
    assert.equal((await fetch(base + '/api/contact')).status, 405);
    assert.equal((await post({ ...valid, consent: false })).status, 400);
    assert.equal((await post({ ...valid, email: 'bad-email' })).status, 400);
    assert.equal((await post({ ...valid, service: 'inconnu' })).status, 400);
    assert.equal((await post({ ...valid, message: 'court' })).status, 400);
    assert.equal((await post(valid, { Origin: 'https://autre.example' })).status, 403);
    const response = await post(valid);
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.equal(result.ok, true);
    const stored = JSON.parse((await readFile(path.join(directory, 'contacts.jsonl'), 'utf8')).trim());
    assert.equal(stored.id, result.id);
    assert.equal(stored.email, valid.email);
    assert.equal(stored.message, valid.message);
    assert.equal(stored.consent, true);
  } finally { await new Promise(resolve => app.close(resolve)); await rm(directory, { recursive: true }); }
});

test('Un robot détecté ne crée aucune demande', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'agency-bot-test-'));
  const app = await createApp({ dataDirectory: directory });
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${app.address().port}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...valid, website: 'spam' }) });
    assert.equal(response.status, 200);
    assert.deepEqual(await readdir(directory), []);
  } finally { await new Promise(resolve => app.close(resolve)); await rm(directory, { recursive: true }); }
});
