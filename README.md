# KITeGG Directus LLP Chat API Bundle

A bundle of an endpoint and hook extension to interact with the [LLP Chat API](https://gitlab.rlp.net/kitegg/kitegg-lehr-lernplattform/llp-chat-api).

## Environment Variables

The following environment variables need to be set on the Directus instance where these extensions are installed.

```dotenv
CHAT_API_URL=YOUR_CHAT_API_URL # default: https://chat.kitegg.de/
```

## API

The following endpoints are implemented. This extension bundle tries to mirror the endpoints of the [LLP Chat API](https://gitlab.rlp.net/kitegg/kitegg-lehr-lernplattform/llp-chat-api), which are documented [here](https://gitlab.rlp.net/kitegg/kitegg-lehr-lernplattform/llp-chat-api/-/blob/main/docs/api.md?ref_type=heads).

### Endpoint extensions

The endpoint extensions exposes almost all endpoints needed to interact with the LLP Chat API.

#### Ingest data

```http
POST /llp-chat/database/ingest
```

This endpoint ingest all data from Directus based on this query:

```json
{
    "id,"
    "status,"
    "type,"
    "slug,"
    "title,"
    "semester,"
    "translations.*,"
    "user_created.first_name,"
    "user_created.last_name,"
    "collaborators.directus_users_id.first_name,"
    "collaborators.directus_users_id.last_name,"

    "course_sections.*,"
    "course_sections.course_id.id,"
    "course_sections.course_id.slug,"
    "course_sections.course_id.title,"
    "course_sections.translations.*,"
    "course_sections.repositories.*,"
    "course_sections.files.*,"
    "course_sections.user_created.first_name,"
    "course_sections.user_created.last_name"
}
```

> This should be executed once after starting the API to automatically ingest all needed data to the database. Maybe this could become a Directus Flow.

#### Invoke the chat

```http
POST /llp-chat/chat/invoke
```

Inkove the chat and get back the full chat response.

Requested body (required):

```json
{
	"input": {
		"prompt": "What is the course about?",
		"slug": "desiging-prompts",
		"course_id": "2f69ec48-ae09-4f4c-8348-8f1ef53d5152"
	},
	"config": {},
	"kwargs": {}
}
```

#### Batch invoke the chat

```http
POST /llp-chat/chat/batch
```

Invoke a batch request and get a response per entry in body.

Requested body (required):

```json
[
	{
		"input": {
			"prompt": "What is the course about?",
			"slug": "desiging-prompts",
			"course_id": "2f69ec48-ae09-4f4c-8348-8f1ef53d5152"
		},
		"config": {},
		"kwargs": {}
	},
	{
		"input": {
			"prompt": "What is the course about?",
			"slug": "desiging-prompts",
			"course_id": "2f69ec48-ae09-4f4c-8348-8f1ef53d5152"
		},
		"config": {},
		"kwargs": {}
	}
]
```

#### Stream the chat

```http
POST /llp-chat/chat/stream
```

Streams back the output of the chat agent. This endpoint uses The endpoint uses a server sent event stream to stream the output.  
https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

Requested body (required):

```json
{
	"input": {
		"prompt": "string",
		"slug": "string",
		"course_id": "string"
	},
	"config": {},
	"kwargs": {}
}
```

### Hook extensions

Additionally a hook extension is setup to automatically post new and updated courses to the vector database.
This endpoint is not exposed through the endpoint extension and therefore not accessible via the Directus SDK or API

```http
POST /database/post
```

Through this endpoint additional documents can be posted to the database, i.e. on creation of a new course.
Only post the ID and type of the created or updated data, the fetch of the needed content happens inside this API.

Requested body (required):

```json
{
  "type": "courses" | "course_sections",
  "id": "2f69ec48-ae09-4f4c-8348-8f1ef53d5152"
}
```
