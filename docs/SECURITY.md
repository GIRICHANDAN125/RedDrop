# Security

This repository handles authentication, file uploads, email delivery, and real-time events. Treat configuration and secrets with care.

## Secret Handling

- Never commit `.env` files.
- Keep `JWT_SECRET`, database credentials, AWS credentials, SMTP credentials, and API keys in local environment files or deployment secrets.
- Use `.env.example` as the only committed reference for environment variables.

## Reporting Issues

If you find a vulnerability or accidental secret exposure, report it privately through the project maintainer before opening a public issue.

## Deployment Checklist

- Use strong JWT secrets.
- Rotate credentials if they are ever exposed.
- Restrict CORS to the intended client origin.
- Review file upload limits and allowed file types.
