const NECKLACE_ID_PATTERN = /^\d{3,6}$/;

const redirectToHomepage = (request) => {
	const homepage = new URL('/', request.url);

	return new Response(null, {
		status: 302,
		headers: {
			Location: homepage.toString(),
			'Cache-Control': 'no-store',
			'X-Robots-Tag': 'noindex, nofollow'
		}
	});
};

export const onRequestGet = async ({ env, params, request }) => {
	const redirect = redirectToHomepage(request);
	const necklaceId = typeof params.necklace === 'string' ? params.necklace : '';

	if (!NECKLACE_ID_PATTERN.test(necklaceId)) return redirect;

	try {
		if (!env.TRACKING_DB) throw new Error('The TRACKING_DB binding is missing.');

		const result = await env.TRACKING_DB
			.prepare(`
				INSERT INTO necklace_events (necklace_id, event)
				SELECT id, 'QR visit'
				FROM necklaces
				WHERE id = ?1
			`)
			.bind(necklaceId)
			.run();

		if ((result.meta?.changes ?? 0) === 0) {
			console.warn(`Ignored QR visit for unknown necklace ${necklaceId}.`);
		}
	} catch (error) {
		// A tracking failure should never prevent somebody from reaching the site.
		console.error('Could not record necklace QR visit.', error);
	}

	return redirect;
};
