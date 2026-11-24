This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Stockage des images des actualités

Configurez `SUPABASE_URL` et `SUPABASE_SECRET_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY`) dans l'environnement du serveur. Dans Supabase Storage, créez un bucket **public** nommé `news-images`. Les images des actualités publiées seront accessibles publiquement ; ne placez pas de fichiers confidentiels dans ce bucket. La clé secrète doit rester côté serveur et ne doit jamais utiliser le préfixe `NEXT_PUBLIC_`.

Le formulaire accepte de une à trois images JPEG, PNG ou WebP de 3 Mo maximum chacune. Elles sont converties en WebP avant leur enregistrement. Redémarrez le serveur après toute modification des variables d'environnement ou de `next.config.ts`. Vérifiez également les limites de taille de requête de votre hébergeur ou de votre proxy.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
