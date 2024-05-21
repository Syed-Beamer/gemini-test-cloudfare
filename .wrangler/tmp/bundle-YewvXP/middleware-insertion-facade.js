				import worker, * as OTHER_EXPORTS from "/Users/Syedbeamer/Desktop/cf-gemini-test/.wrangler/tmp/pages-I0L3A4/functionsWorker-0.49978547574882115.mjs";
				import * as __MIDDLEWARE_0__ from "/usr/local/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts";
import * as __MIDDLEWARE_1__ from "/usr/local/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts";
				
				worker.middleware = [
					__MIDDLEWARE_0__.default,__MIDDLEWARE_1__.default,
					...(worker.middleware ?? []),
				].filter(Boolean);
				
				export * from "/Users/Syedbeamer/Desktop/cf-gemini-test/.wrangler/tmp/pages-I0L3A4/functionsWorker-0.49978547574882115.mjs";
				export default worker;