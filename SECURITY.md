# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **DO NOT** open a public issue
2. Email the details to: support@bynolo.ca
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Best Practices

### For Developers

- **Never commit secrets** - Use `.env` for sensitive data
- **Keep dependencies updated** - Run `npm audit` and `pip-audit` regularly
- **Validate all inputs** - Sanitize user data before processing
- **Use HTTPS in production** - Never transmit tokens over HTTP
- **Implement rate limiting** - Prevent abuse of API endpoints

### For Deployment

- **Use environment variables** for all secrets
- **Enable CORS properly** - Don't use `*` in production
- **Set secure session cookies** - `secure=True, httponly=True, samesite='Lax'`
- **Regular backups** - Backup database regularly
- **Monitor logs** - Watch for suspicious activity
- **Update regularly** - Keep all dependencies current

## Known Security Considerations

### OAuth Flow
- Requires HTTPS in production
- State parameter prevents CSRF attacks
- Tokens stored in session (server-side)

### Admin Access
- Database-based admin flags (not tokens)
- Requires authentication
- No public admin token endpoints

### Database
- SQLAlchemy ORM prevents SQL injection
- Prepared statements used throughout
- No raw SQL queries

### CORS
- Configured to accept credentials
- Should restrict origins in production

## Disclosure Policy

We will:
- Acknowledge receipt within 48 hours
- Provide a timeline for a fix
- Credit you in the security advisory (if desired)
- Notify you when the fix is deployed

Thank you for helping keep The Simulation secure! 🔒
