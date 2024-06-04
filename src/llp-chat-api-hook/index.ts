import { defineHook } from "@directus/extensions-sdk";

const updateCourse = async (id: string, type: string, CHAT_API_URL: string) => {
	const response = await fetch(`${CHAT_API_URL}/database/post/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			type: type,
			id,
		}),
	});

	const data = await response.json();

	console.log("Sucessfully added course to chat vector database: ", data);
};

export default defineHook(({ action }, { env }) => {
	const { CHAT_API_URL } = env;

	action("courses.items.create", async ({ payload }) => {
		console.log("Creating course: ", payload);

		await updateCourse(payload.id, "courses", CHAT_API_URL);
	});

	action("courses.items.update", async ({ payload }) => {
		console.log("Updating course: ", payload);

		await updateCourse(payload.id, "courses", CHAT_API_URL);
	});

	action("course_sections.items.create", async ({ payload }) => {
		console.log("Creating course section: ", payload);

		await updateCourse(payload.course_id.id, "course_sections", CHAT_API_URL);
	});

	action("course_sections.items.update", async ({ payload }) => {
		console.log("Updating course section: ", payload);

		await updateCourse(payload.course_id.id, "course_sections", CHAT_API_URL);
	});

	action("git_imports.items.create", async ({ payload }) => {
		console.log("Creating import from Gitlab: ", payload);

		await updateCourse(payload.course_id.id, "gitlab_import", CHAT_API_URL);
	});

	action("git_imports.items.update", async ({ payload }) => {
		console.log("Updating import from Gitlab: ", payload);

		await updateCourse(payload.course_id.id, "gitlab_import", CHAT_API_URL);
	});
});
