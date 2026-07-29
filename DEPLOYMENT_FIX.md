# Vercel deployment fix

This copy was adjusted so external services are not contacted while Next.js is importing modules during `next build`.

## Minimum variables for the UI deployment

Add these in **Vercel → Project → Settings → Environment Variables**:

```env
AUTH_SECRET=replace-with-a-long-random-secret
AUTH_TRUST_HOST=true
NEXT_PUBLIC_BASE_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_REVALIDATION_TIME=600
```

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

## When the backend is enabled

Use a cloud MongoDB URL. Never use `mongodb://localhost...` on Vercel.

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/golobe_travel_agency
```

Stripe, Mailjet, OAuth, cron, and private API variables can be added later using `.env.example` as the checklist. The related feature returns a configuration error until its variables are supplied.

## Deploy

1. Copy these changes into the GitHub repository and push them.
2. Add the environment variables above in Vercel.
3. Redeploy from Vercel.
4. After the Vercel URL works, add the Hostinger domain under **Vercel → Settings → Domains** and copy the exact DNS records Vercel shows into Hostinger DNS Zone Editor.
