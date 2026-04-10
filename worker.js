export default {
	async fetch(request, env) {
		const objects = await env.MY_BUCKET.list();

		return new Response(JSON.stringify(objects, null, 2), {
			headers: { 'Content-Type': 'application/json' },
		});
	},
};
