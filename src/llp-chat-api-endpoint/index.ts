import { defineEndpoint } from "@directus/extensions-sdk";
import { Readable } from "node:stream";

type ChatInput = {
	prompt: string;
	slug?: string;
	course_id?: string;
};

export default defineEndpoint({
	id: "llp-chat",
	handler: (router, { env }) => {
		const { CHAT_API_URL } = env;

		// Ping
		router.get("/ping", async (req, res) => {
			res.send("pong");
		});

		// ---------------------
		// Database endpoints
		// ---------------------

		// Ingest data
		router.post("/database/ingest", async (req, res) => {
			try {
				const response = await fetch(`${CHAT_API_URL}/database/ingest`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(req.body),
				});

				const data = await response.json();

				res.send(data);
			} catch (error: unknown) {
				res.status(500).send({ error: (error as Error)?.message });
			}
		});

		// ---------------------
		// Chat endpoints
		// ---------------------

		// Invoke the chat
		router.post("/chat/invoke", async (req, res) => {
			const {
				input,
				config,
				kwargs,
			}: { input: ChatInput; config: Object; kwargs: Object } = req.body;

			try {
				const response = await fetch(`${CHAT_API_URL}/chat/invoke`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ input, config, kwargs }),
				});

				const data = await response.json();

				res.send(data);
			} catch (error: unknown) {
				res.status(500).send({ error: (error as Error)?.message });
			}
		});

		// Batch invoke the chat
		router.post("/chat/batch", async (req, res) => {
			const batch: {
				input: ChatInput;
				config: Object;
				kwargs: Object;
			}[] = req.body;

			try {
				const response = await fetch(`${CHAT_API_URL}/chat/batch`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(batch),
				});

				const data = await response.json();

				res.send(data);
			} catch (error: unknown) {
				res.status(500).send({ error: (error as Error)?.message });
			}
		});

		// Stream the chat
		router.post("/chat/stream", async (req, res) => {
			const {
				input,
				config,
				kwargs,
			}: { input: ChatInput; config: Object; kwargs: Object } = req.body;

			try {
				const response = await fetch(`${CHAT_API_URL}/chat/stream`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ input, config, kwargs }),
				});

				// Set headers
				response.headers.forEach((value, key) => {
					res.setHeader(key, value);
				});

				// Create a readable stream from the Python API response
				const responseBody = response.body as ReadableStream<Uint8Array>;

				const reader = responseBody.getReader();
				const readableBody = new Readable({
					async read() {
						const { done, value } = await reader.read();
						if (done) {
							this.push(null);
						} else {
							this.push(value);
						}
					},
				});

				// Pipe converted Python API SSE stream to the client response
				readableBody.pipe(res);

				// Handle client disconnection
				try {
					res.on("close", () => {
						readableBody.destroy();
					});
				} catch (error: unknown) {
					console.error("Error handling client disconnection", error);
				}
			} catch (error: unknown) {
				res.status(500).send({ error: (error as Error)?.message });
			}
		});
	},
});
