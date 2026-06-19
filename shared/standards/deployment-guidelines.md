# Deployment Guidelines

Owned by the Git/DevOps agent. Covers source control, pre-deployment security,
documentation, containerization, and server hardening.

## 1. Source control & branching (GitHub)

### Branch naming
- Features: `feature/<feature-title>` (e.g. `feature/user-authentication`)
- Bug fixes: `bug/<bug-title>` or `fix/<bug-title>` (e.g. `bug/login-jwt-expired`)

> The orchestrator's automated agent commits use the internal
> `<type>/<slug>-<sessionId>` convention (see the gitdevops vault `naming-rules.md`).
> The convention above is for human GitHub PR collaboration.

### Pull requests
- **Protected branches**: no direct pushes to `main` (production).
- **PR required**: all code modifications go through a Pull Request.
- **Merge**: use **Squash and merge** to keep a clean history.

## 2. Pre-deployment security check
- **Dependency scanning**: vulnerability checks on third-party packages (`npm audit`,
  Dependabot).
- **Secret detection**: scan for hardcoded credentials, API keys, or certificates before
  pushing.
- **AI review**: use AI agents to review the commit for security and performance bugs.

## 3. Repository documentation
- Store asset files in a `/docs` directory at the repo root.
- Keep an up-to-date **architecture diagram** (microservices, databases, third-party
  integrations).
- Maintain code documentation in `.md` files.

## 4. Containerization
- **Mandatory**: all deployments run in Docker containers — host-level native deployments
  are forbidden.
- **Multi-stage builds**: separate build dependencies from the final runtime to minimize
  image size.
- **Numbered tags**: always tag images with explicit version numbers, never `latest`.

```dockerfile
# Stage 1: Build environment
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production environment (minimizes image size)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm install pm2 -g
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ecosystem.config.js ./
EXPOSE 3000
CMD ["npm", "start"]
```

## 5. Server hardening

### Firewall (UFW)
- Enable UFW; block all incoming traffic by default.
- Open only required ports: SSH (22), HTTP (80), HTTPS (443).

### SSH security
- Disable password auth in `/etc/ssh/sshd_config` (`PasswordAuthentication no`).
- Permit access strictly via pre-authorized SSH public keys.

### Intrusion prevention (Fail2Ban)
- Enable the default SSH jail to ban IPs with repeated failed logins.
- Enable Nginx jails: `nginx-http-auth`, `nginx-badbots`, `nginx-noscript`.

### SSL/TLS
- Provision and auto-renew Let's Encrypt certificates with Certbot.
- Enforce global HTTP→HTTPS redirection (port 80 → 443) in Nginx.

### Environment management
- No Anaconda/Conda on production VMs. Use system Python + `venv`, or Docker isolation.
