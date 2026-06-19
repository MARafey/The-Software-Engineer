# Server Hardening

## Firewall (UFW)
- Enable UFW; block all incoming traffic by default.
- Open only required ports: SSH (22), HTTP (80), HTTPS (443).

## SSH security
- Disable password auth in `/etc/ssh/sshd_config` (`PasswordAuthentication no`).
- Permit access strictly via pre-authorized SSH public keys.

## Intrusion prevention (Fail2Ban)
- Enable the default SSH jail to ban IPs with repeated failed logins.
- Enable Nginx jails: `nginx-http-auth`, `nginx-badbots`, `nginx-noscript`.

## SSL/TLS
- Provision and auto-renew Let's Encrypt certs with Certbot.
- Enforce global HTTP→HTTPS redirect (port 80 → 443) in Nginx.

## Environment
- No Anaconda/Conda on production VMs. Use system Python + `venv`, or Docker isolation.
