# Bearer Token Rules

## Correct
```js
// api/auth.api.js — token lives in memory
let _token = null;

export function setToken(t) { _token = t; }
export function clearToken() { _token = null; }

export function authedFetch(url, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
      Authorization: _token ? `Bearer ${_token}` : undefined,
    },
  });
}
```

## WRONG — blocks git commit
```js
// Never do these:
const token = localStorage.getItem('token');                 // localStorage
fetch('/api/data', { body: JSON.stringify({ token }) });     // token in body
fetch(`/api/data?token=${token}`);                          // token in URL
```
