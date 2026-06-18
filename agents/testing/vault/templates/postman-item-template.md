# Postman Item Template (v2.1)

```json
{
  "name": "POST /api/users — positive",
  "request": {
    "method": "POST",
    "header": [
      { "key": "Content-Type", "value": "application/json" },
      { "key": "Authorization", "value": "Bearer {{bearerToken}}" }
    ],
    "body": {
      "mode": "raw",
      "raw": "{ \"email\": \"test@example.com\", \"password\": \"securePass123\" }",
      "options": { "raw": { "language": "json" } }
    },
    "url": { "raw": "{{baseUrl}}/api/users", "host": ["{{baseUrl}}"], "path": ["api", "users"] }
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "pm.test('Status is 201', () => pm.response.to.have.status(201));",
          "pm.test('Response time < 2000ms', () => pm.expect(pm.response.responseTime).to.be.below(2000));",
          "pm.test('success is true', () => { const j = pm.response.json(); pm.expect(j.success).to.be.true; });"
        ]
      }
    }
  ]
}
```

## Negative test: invalid payload
- Send missing required fields or wrong types
- Assert status >= 400
- Assert json.success === false

## Auth test: missing token
- Remove Authorization header entirely
- Assert status 401
