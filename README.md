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


## Fametrahana amin'ny Vercel (PostgreSQL)

1. Alefaso any amin'ny GitHub ny code (tsy ao anatiny ny `.env`).
2. Vercel > **Add New > Project** > Import ny repo.
3. Vercel > ilay project > **Storage** > **Create / Connect Database** (Neon na Supabase) > **Connect Project**.
   Mifidiana ny environments **Production + Preview + Development**.
   Mameno ho azy ny `DATABASE_URL`, `POSTGRES_URL`, ... ny Vercel (ny code dia mahita azy na inona na inona prefix).
4. Vercel > Settings > **Environment Variables** > ampio:
   - `JWT_SECRET` = string lava random (`openssl rand -base64 32`)
   - `ADMIN_PASSWORD` (tsy voatery)
5. **Deployments > Redeploy** (tsy maintsy atao redeploy aorian'ny fanampiana variable).

Ny `npm run build` dia manao ho azy: `db-push` (mamorona ny table) > `prisma generate` > `next build`.
Raha tsy hita ny database, mijanona ny build ary milaza mazava ao amin'ny Build Logs.
Hamorona user `admin` / `zakaranda` ho azy ny login voalohany (soloy avy hatrany ao amin'ny dashboard).

## User par défaut

- **name:** `admin`
- **password:** `zakaranda`

Mamorona azy ho azy raha tsy mbola misy user ao anaty DB (amin'ny login voalohany), na:

```bash
npx prisma db push
npm run db:seed
```

## Users (mot de passe ao anaty base de données)

- Model `User`: **id** / **name** / **password** (hashé (scrypt))
- CRUD feno ao amin'ny dashboard admin (`/admin/dashboard`)
- API:
  - `GET/POST /api/users`
  - `GET/PUT/DELETE /api/users/[id]`
- Raha tsy mbola misy user ao anaty DB → mbola azo ampiasaina ny `ADMIN_PASSWORD` ao amin'ny `.env` (bootstrap).
- Rehefa misy user efa voaforona → ny login dia mijery ny password hash ao anaty table `User` ihany.

## Fanamarihana
- Mila mandeha sy azo idirana ny PostgreSQL alohan'ny hampandehanana ny app.
- Ny bokotra hanovana sy hamafana tantara dia ao amin'ny dashboard admin.
- Raha misy olana amin'ny database, zahao aloha ny `DATABASE_URL` sy ny log ao amin'ny terminal.
