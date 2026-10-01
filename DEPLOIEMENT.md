# Déploiement de think.anas

## Variables Vercel

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Supabase

1. Appliquer la migration `supabase/migrations/20261001000100_user_state.sql`.
2. Activer **Authentication → Passkeys**.
3. Définir le nom RP sur `think.anas`, le RP ID sur `thinkanas.com` et l’origine sur `https://thinkanas.com`.
4. Définir l’URL du site sur `https://thinkanas.com` et ajouter `https://thinkanas.com/acces` aux URL de redirection.

La table `user_state` active RLS : chaque compte ne peut lire et modifier que sa propre ligne.

## Domaine

Le proxy redirige les domaines techniques de production vers `https://thinkanas.com`. Le domaine doit donc être attaché au projet Vercel avant l’ouverture publique.
