import { Validator } from "@cfworker/json-schema";

const appRoutesSchema = new Validator({
  type: "object",
  properties: {
    metadata: {
      type: "object",
      properties: {
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
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        user_id: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        impersonator_id: {
          type: ["string", "null"],
          minLength: 1,
          maxLength: 50,
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
          type: ["string", "null"],
        },
        search: {
          type: ["string", "null"],
        },
        referrer: {
          type: ["string", "null"],
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
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        user_id: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        impersonator_id: {
          type: "string",
          minLength: 1,
          maxLength: 50,
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
          type: ["string", "null"],
        },
        search: {
          type: ["string", "null"],
        },
        referrer: {
          type: ["string", "null"],
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
    if (requestSize > 1000000) {
      return new Response(
        "Request exceeded more than 1MB. The request size is " + requestSize
      );
    }
    let text = new TextDecoder().decode(buff);
    const json = JSON.parse(text);

    const client_IP = request.headers.get("X-Forwarded-For").toString();
    console.log(client_IP);
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
              .errors.map((error) => error.error)
        );
      } else if (json.metadata.schema_name === "app_routes") {
        return new Response(
          "Invalid JSON: " +
            appRoutesSchema.validate(json).errors.map((error) => error.error)
        );
      } else {
        return new Response("Invalid Body");
      }
    }
    await fetch("https://gemini.getbeamer.com/async/event", {
      method: request.method,
      headers: {
        ...request.headers,
        "X-Testing-Message": "I'm Syed from Beamer, and I am testing",
      },
      body: json,
    });

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
