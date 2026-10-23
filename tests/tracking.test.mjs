import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { onRequestGet } from '../functions/n/[necklace].js';

test('the migration creates the registry and visit log', () => {
	const database = new DatabaseSync(':memory:');
	database.exec(fs.readFileSync('migrations/0001_create_necklace_tracking.sql', 'utf8'));

	assert.deepEqual(
		database.prepare('SELECT id FROM necklaces ORDER BY id').all().map((row) => row.id),
		['001', '002', '003']
	);

	database
		.prepare('INSERT INTO necklace_events (necklace_id, event) VALUES (?, ?)')
		.run('002', 'QR visit');

	assert.deepEqual(
		Array.from(database.prepare('SELECT Necklace, Event FROM necklace_visit_log').all(), (row) => ({ ...row })),
		[{ Necklace: '002', Event: 'QR visit' }]
	);
});

test('a registered-looking necklace visit is recorded and redirected', async () => {
	let recordedNecklace = '';
	const env = {
		TRACKING_DB: {
			prepare: () => ({
				bind: (necklaceId) => ({
					run: async () => {
						recordedNecklace = necklaceId;
						return { meta: { changes: 1 } };
					}
				})
			})
		}
	};

	const response = await onRequestGet({
		env,
		params: { necklace: '002' },
		request: new Request('https://spirluma.pages.dev/n/002')
	});

	assert.equal(recordedNecklace, '002');
	assert.equal(response.status, 302);
	assert.equal(response.headers.get('Location'), 'https://spirluma.pages.dev/');
	assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('an invalid necklace ID redirects without touching D1', async () => {
	const response = await onRequestGet({
		env: {
			TRACKING_DB: {
				prepare: () => assert.fail('D1 should not be queried')
			}
		},
		params: { necklace: 'not-a-necklace' },
		request: new Request('https://spirluma.pages.dev/n/not-a-necklace')
	});

	assert.equal(response.status, 302);
});
