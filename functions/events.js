import { Validator } from "@cfworker/json-schema";

const appRoutesSchema = new Validator({
  type: "object",
  properties: {
    metadata: {
      type: "object",
      properties: {
        uuid: {
          type: "string",
          pattern:
            "^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}$",
        },
        schema_name: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
        deployment_stage: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        triggered_at: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        trigger_origin: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        trigger_location: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        user_agent: {
          type: "string",
          minLength: 1,
          maxLength: 200,
        },
      },
      required: [
        "schema_name",
        "deployment_stage",
        "triggered_at",
        "trigger_origin",
        "trigger_location",
      ],
    },
    identity: {
      type: "object",
      properties: {
        ip_address: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        cookie_id: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
        account_id: {
          oneOf: [
            { type: "string", minLength: 1, maxLength: 50 },
            { type: "null" },
          ],
        },
        user_id: {
          oneOf: [
            { type: "string", minLength: 1, maxLength: 50 },
            { type: "null" },
          ],
        },
        impersonator_id: {
          oneOf: [
            { type: "string", minLength: 1, maxLength: 50 },
            { type: "null" },
          ],
        },
      },
      required: ["ip_address", "cookie_id"],
    },
    attributes: {
      type: "object",
      properties: {
        host: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
        path: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
        hash_path: {
          oneOf: [{ type: "string" }, { type: "null" }],
        },
        search: {
          oneOf: [{ type: "string" }, { type: "null" }],
        },
        referrer: {
          oneOf: [{ type: "string" }, { type: "null" }],
        },
      },
      required: ["host", "path"],
    },
  },
  required: ["metadata", "identity", "attributes"],
});

const marketingRoutesSchema = new Validator({
  type: "object",
  properties: {
    metadata: {
      type: "object",
      properties: {
        uuid: {
          type: "string",
          pattern:
            "^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}$",
        },
        schema_name: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
        deployment_stage: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        triggered_at: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        trigger_origin: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        trigger_location: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        token_claims: {
          oneOf: [{ type: "object" }, { type: "null" }],
        },
        user_agent: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
      },
      required: [
        "schema_name",
        "deployment_stage",
        "triggered_at",
        "trigger_origin",
        "trigger_location",
      ],
    },
    identity: {
      type: "object",
      properties: {
        ip_address: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        cookie_id: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
        account_id: {
          oneOf: [{ type: "string", maxLength: 255 }, { type: "null" }],
        },
        user_id: {
          oneOf: [{ type: "string", maxLength: 255 }, { type: "null" }],
        },
        impersonator_id: {
          oneOf: [{ type: "string", maxLength: 255 }, { type: "null" }],
        },
        other_ids: {
          oneOf: [{ type: "string", maxLength: 255 }, { type: "null" }],
        },
      },
      required: ["ip_address", "cookie_id"],
    },
    attributes: {
      type: "object",
      properties: {
        host: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
        path: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
        hash_path: {
          oneOf: [{ type: "string", maxLength: 255 }, { type: "null" }],
        },
        search: {
          oneOf: [{ type: "string", maxLength: 255 }, { type: "null" }],
        },
        referrer: {
          oneOf: [{ type: "string", maxLength: 255 }, { type: "null" }],
        },
      },
      required: ["host", "path"],
    },
  },
  required: ["metadata", "identity", "attributes"],
});

export async function onRequest(context) {
  const request = context.request;

  // Check if request method is POST
  if (request.method !== "POST") {
    return new Response("Only POST requests are allowed.", {
      status: 405,
    });
  }

  try {
    //Parse JSON from request body

    let isValid;

    let buff = await request.arrayBuffer();
    let requestSize = buff.byteLength;
    if (requestSize > 1024 * 1024) {
      return new Response(
        "Request exceeded more than 1MB. The request size is " + requestSize,
        {
          status: 400,
        }
      );
    }
    let text = new TextDecoder().decode(buff);
    const json = JSON.parse(text);

    const client_IP = request.headers.get("CF-Connecting-IP").toString();
    json.identity.ip_address = client_IP;
    json.metadata.triggered_at = new Date().toISOString();
    console.log(json);

    if (json.metadata.schema_name === "marketing_routes") {
      isValid = marketingRoutesSchema.validate(json).valid;
    } else if (json.metadata.schema_name === "app_routes") {
      isValid = appRoutesSchema.validate(json).valid;
    } else {
      isValid = false;
    }

    if (!isValid) {
      if (json.metadata.schema_name === "marketing_routes") {
        return new Response(
          "Invalid JSON: " +
            marketingRoutesSchema
              .validate(json)
              .errors.map((error) => error.error),
          { status: 400 }
        );
      } else if (json.metadata.schema_name === "app_routes") {
        return new Response(
          "Invalid JSON: " +
            appRoutesSchema.validate(json).errors.map((error) => error.error),
          { status: 400 }
        );
      } else {
        return new Response("Invalid Body", { status: 400 });
      }
    }

    try {
      await fetch("https://gemini.getbeamer.com/async/event", {
        method: request.method,
        headers: {
          ...request.headers,
          "X-Testing-Message": "I'm Syed from Beamer, and I am testing",
        },
        body: json,
      });
    } catch (e) {
      console.log("Gemini Request Failed: " + error.message);
      return new Response("Unable to Register Event", {
        status: 500,
      });
    }

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Return response with error message if parsing fails
    console.log(error.message);
    return new Response("Error: " + error.message, {
      status: 500,
    });
  }
}
