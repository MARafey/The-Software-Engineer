# 10 Principles of Secure by Design

Security is baked in, not bolted on — a vulnerability found at deployment costs far more
than one prevented at design. These principles are design inputs for EVERY domain agent;
gitdevops verifies them at the gate. Shift left.

| # | Principle | What it means here |
|---|-----------|--------------------|
| 1 | **Least privilege** | No more access than the job needs, only for as long as needed. Maps to the vault ACL (write-own-only), read-only AI SQL tools, per-route `authRequired`, scoped API keys. |
| 2 | **Defense in depth** | Never rely on one mechanism: validation middleware + auth middleware + parameterized queries + CSP + the pre-commit scan all overlap on purpose. |
| 3 | **Fail safe** | On failure, land in the secure position: the bridge BLOCKS the commit when validation fails; auth middleware rejects on any token error (401, never a pass-through 500); a broken check never defaults to "allow". |
| 4 | **KISS / economy of mechanism** | Complexity is the enemy of security — the ponytail agent exists for this reason. Fewer components, fewer twists, fewer vulnerabilities. |
| 5 | **Separation of duties** | No single actor releases code: designer ≠ checker. The agent that writes code never signs its own commit — bridge validates, gitdevops commits (see mcpbridge `contracts/release-signoff.md`). |
| 6 | **Open design** | No security by obscurity. Kerckhoffs's principle: the only secret is the key/credential (in env vars), never the mechanism. Document how auth works; hide only secrets. |
| 7 | **Segmentation** | Isolate blast radius: per-agent vaults + ACL, feature folders, separate DB users per service, network segmentation in deployment. A fire in one unit must not burn the building. |
| 8 | **Usability (human factors)** | Security that's too hard to use gets bypassed (the password sticky note). Prefer SSO/managed secrets over 32-char rotate-monthly rules; make the secure path the easy path. |
| 9 | **Minimize attack surface** | Fewer external interfaces, no unneeded remote access, fewer components. Every route, port, and dependency added is target area. |
| 10 | **Secure by default** | Out of the box: only required features on, no default passwords (must-supply at setup), no default admin IDs, deny-first CORS/firewall rules. |

Rule of use: when reviewing a design or a diff, name the principle a finding violates —
it makes the risk explainable to non-engineers (see the Challenger lesson in the
release sign-off note).
