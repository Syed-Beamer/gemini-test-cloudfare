import { onRequest as __events_js_onRequest } from "/Users/Syedbeamer/Desktop/cf-gemini-test/functions/events.js"

export const routes = [
    {
      routePath: "/events",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__events_js_onRequest],
    },
  ]