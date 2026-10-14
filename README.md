# Tantara An-tsoratra — Next.js

Tranonkala famakiana tantara an-tsoratra misy fikarohana sy pejy admin ahafahana manampy, manova ary mamafa tantara.

## Ilaina
- Node.js 18.17+ (tsara kokoa ny Node.js 20 LTS)
- PostgreSQL (local na cloud)

## Fametrahana
1. Esory ny ZIP ary sokafy ny terminal ao amin'ilay lahatahiry.
2. Apetraho ny dependencies:
   ```bash
   npm install
   ```
3. Adikao ny `.env.example` ho `.env`, dia fenoy ny tena PostgreSQL URL sy secrets:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/stories_db?schema=public"
   ADMIN_PASSWORD="tenimiafina-mafy-sy-miafina"
   JWT_SECRET="secret-lava-random-tsy-averina"
   ```
   Aza mampakatra ny `.env` amin'ny GitHub.
4. Mamoròna ny Prisma Client sy ny database table:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Alefaso:
   ```bash
   npm run dev
   ```
6. Sokafy `http://localhost:3000`. Pejy admin: `http://localhost:3000/admin`.

## Fanamarihana
- Mila mandeha sy azo idirana ny PostgreSQL alohan'ny hampandehanana ny app.
- Ny bokotra hanovana sy hamafana tantara dia ao amin'ny dashboard admin, aseho amin'ny icon misy `title` sy `aria-label`.
- Raha misy olana amin'ny database, zahao aloha ny `DATABASE_URL` sy ny log ao amin'ny terminal.
