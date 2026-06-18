# Third-Party API Stub Template

```js
// src/integrations/<service-name>.js
'use strict';

/**
 * @module <ServiceName>Integration
 * Auth strategy: apiKey | oauth2 | bearerToken | webhook-secret
 */

const BASE_URL = process.env.<SERVICE>_BASE_URL;
const API_KEY  = process.env.<SERVICE>_API_KEY;

/**
 * @param {string} endpoint - API path (e.g. '/v1/messages')
 * @param {Object} opts - fetch options
 * @returns {Promise<any>}
 */
async function request(endpoint, opts = {}) {
  // TODO: implement
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...opts.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`<ServiceName> API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

module.exports = { request };
```
