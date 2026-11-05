# Advocate Ghulam Mujtaba: website and admin panel

A dynamic legal-portfolio website with a built-in admin panel. The advocate logs in and manages everything himself (profile, practice areas, cases, landmark judgments, achievements, legal updates, files and contact messages). Nothing about him is hard-coded in the React code. The public site reads everything from the API.

```
MongoDB Atlas  →  Express API (server/)  →  React website + admin (client/)
```

| Part | Stack | Deploy to |
|---|---|---|
| `client/` | React 18, Vite, Tailwind CSS, React Router | Vercel |
| `server/` | Node.js, Express, Mongoose, JWT, bcrypt, Multer | Render or Railway |
| Database | MongoDB Atlas | Atlas (free M0 tier is enough) |
| Files | Cloudinary (images, PDFs, documents) | Cloudinary |

## 1. Run it on your computer

You need Node.js 18 or newer and a MongoDB database (a free MongoDB Atlas cluster is fine). For local development, the server automatically falls back to an in-memory MongoDB instance if no valid `MONGODB_URI` is configured, so the app can still boot and be tested.

```bash
# Terminal 1: API
cd server
cp .env.example .env        # then edit .env (see the variables below)
npm install
npm run seed                # creates the admin login, profile and practice areas
npm run dev                 # API on http://localhost:5000

# Terminal 2: website
cd client
npm install
npm run dev                 # website on http://localhost:5173
```

The server's `start`, `dev` and `seed` scripts preload `server/dns-resolver.cjs` so Node can resolve MongoDB Atlas SRV records on this Windows network. If you move to a network with a different DNS resolver, update the address in that file.

* Website: http://localhost:5173
* Admin: http://localhost:5173/admin/login (use `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`)

Without Cloudinary keys, uploaded files are saved in `server/uploads/` (fine for development).

### Server environment variables (`server/.env`)

| Variable | Meaning |
|---|---|
| `MONGODB_URI` | Atlas connection string, ending in a database name such as `/advocate_site` |
| `JWT_SECRET` | Random string of 32+ characters. The API refuses to start without it |
| `CLIENT_URL` | Website address(es) allowed to call the API, comma-separated (e.g. `https://your-site.vercel.app`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | First admin account created by `npm run seed` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | File storage (required in production) |
| `PUBLIC_URL` | Only for local file storage behind a proxy |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## 2. Put it online

1. **MongoDB Atlas**: create a free cluster and a database user, then copy the connection string. Under *Network Access* allow `0.0.0.0/0` (Render and Railway use changing IPs).
2. **Cloudinary**: create a free account and copy the cloud name, API key and API secret from the dashboard. In *Settings → Security*, enable **“Allow delivery of PDF and ZIP files”**. It is off by default and judgment PDFs will not open without it.
3. **API on Render** (Railway works the same way): New *Web Service* from your Git repository.
   * Root directory `server`, build command `npm install`, start command `npm start`.
   * Add all the environment variables above. Set `NODE_ENV=production` and `CLIENT_URL` to your Vercel address (you can fill it in after step 4).
4. **Website on Vercel**: import the repository, set the root directory to `client`, and add the variable `VITE_API_URL` = your API address (for example `https://advocate-api.onrender.com`, no trailing slash). `client/vercel.json` already makes page links such as `/cases/123` work on refresh.
5. **Create the admin account in production**: run the seed once against the production database. Easiest is from your computer: put the production `MONGODB_URI` and your chosen `ADMIN_PASSWORD` in `server/.env` and run `npm run seed`. It never overwrites existing content. To reset a forgotten password later, run `npm run seed -- --reset-password`.
6. Sign in at `https://your-site/admin/login`, open **Settings** and confirm the login email and password.

Free Render services go to sleep when idle, so the first visit after a quiet period can take about 30 seconds. A paid instance avoids this.

## 3. What the advocate can manage (`/admin`)

* **Dashboard**: totals, recent messages, quick “add” buttons.
* **Profile**: name, title, headline, biography, photo, phone, WhatsApp, email, office address, chamber, map, years of experience, homepage statistics, education, memberships, criminal-law section, call-to-action text, social links.
* **Practice Areas**: add, edit, reorder (up/down), delete, publish/unpublish.
* **Important Cases**: all requested fields, documents and images, tags, featured star, publish/unpublish, search, status filter, sorting, pagination.
* **Landmark Judgments**: all requested fields, judgment PDF and related documents, sorting by newest, oldest, court, category or year.
* **Achievements**, **Legal Updates**: create, edit, publish, unpublish, delete (articles support headings and bullet points; see the hint under the content box).
* **Media**: every uploaded file, with copy-link and delete.
* **Messages**: contact-form messages with unread badge, mark read/unread, delete.
* **Settings**: change login email and password.

Items saved as *Draft* are never shown on the public site or returned by the public API.

## 4. Security notes

* Admin API routes require a valid JWT; passwords are hashed with bcrypt (`bcryptjs`, same algorithm, no native build step); login is rate-limited (10 attempts per 15 minutes).
* Input is validated (express-validator and Mongoose schemas); `$`-operator and dotted keys are stripped to block NoSQL injection; request bodies are capped at 1 MB.
* Uploads accept only JPG, PNG, WEBP, GIF, PDF, DOC and DOCX up to 15 MB, and the file's real signature must match its type.
* CORS only allows the origins in `CLIENT_URL`; Helmet security headers are on; the contact form is rate-limited and has a spam trap.
* The admin session token is kept in the browser's local storage and expires after 7 days. The site never renders user text as HTML.
* Never commit `server/.env`. Use a strong, unique admin password.

## 5. Notes on the content

* Only the information supplied for the advocate is pre-filled. There are **no** invented cases, judgments, achievements, awards or membership numbers; empty sections show a polite “will be added” message.
* Education is entered exactly as supplied (“U.B”, “MBA”, “P.G.D Business, London”). If “U.B” was meant to be LL.B, correct it in **Profile → Education**.
* The WhatsApp number is the phone number in international format (`923009427810`). Change it in **Profile** if a different number should receive WhatsApp messages.
* The homepage photo is `client/public/images/advocate.jpg`. Replace it by uploading a new **Profile photo** in the admin panel (a higher-resolution original is recommended).

## 6. API overview

Public: `GET /api/profile`, `/api/practice-areas`, `/api/cases`, `/api/landmark-judgments`, `/api/achievements`, `/api/legal-updates` (each also `/:id`, and list endpoints support `q`, `page`, `limit`, `sort` and filters; `/meta` returns the filter values), `POST /api/messages`.
Auth: `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/password`, `PUT /api/auth/account`.
Admin (Bearer token): `/api/admin/{practice-areas,cases,landmark-judgments,achievements,legal-updates}` (GET, POST, PUT/PATCH, DELETE), `/api/admin/profile`, `/api/admin/messages`, `/api/admin/media`, `POST /api/admin/upload`, `/api/admin/stats`.

## 7. Adding a new section later

Add a Mongoose model in `server/src/models`, one entry in `server/src/routes/resources.js` (this gives public and admin CRUD routes automatically), then one page in `client/src/pages/admin/Resources.jsx` (a field list) and a public page. The admin screens for existing sections are generated from those field lists.
