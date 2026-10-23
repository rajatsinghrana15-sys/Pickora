# Pickora

Pickora ek affiliate product discovery site hai, jiska Amazon-inspired marketplace layout, search bar, category navigation aur product cards hain. Homepage par poora active catalog dikhaya jata hai. Customer login ke baad hi **Buy Now** se partner seller par ja sakta hai. Signed-in seller visits admin ke **Affiliate clicks** section mein product, user aur time ke saath log hote hain. Pickora external Amazon purchase complete hone ki confirmation nahi paa sakta jab tak affiliate program reporting integration na mile; isliye click logs ko confirmed order na samjhein. Pickora payment ya delivery handle nahi karta. Customer signup/login, editable profile aur profile photo upload/update; aur admin product management included hain.

## Windows par local setup (beginner guide)

### Zaroori cheezein

- Node.js 20+ aur npm
- MongoDB locally, ya MongoDB Atlas account/connection URI

### 1. Server configure karein

`server` folder khol kar `.env.example` ki copy banaayein aur us copy ka naam `.env` rakhein. `.env` file ko Git ya public repo me upload na karein.

PowerShell command:

```powershell
Copy-Item .env.example .env
```

- `MONGODB_URI`: local MongoDB ho to example value rehne dein; Atlas ho to Atlas ka connection URI paste karein.
- `JWT_SECRET`: 32+ characters ka naya random secret set karein.
- `ADMIN_EMAIL` aur `ADMIN_PASSWORD`: apne admin login ke liye unique email/strong password set karein.
- `CLIENT_URL`: local run ke liye `http://localhost:5173` rakhein.

PowerShell me server folder ke andar:

```powershell
npm install
npm run seed
npm run dev
```

`npm run seed` sample product catalog banata/update karta hai aur upar set kiye gaye admin account ko create karta hai. Sample demo customer credentials README me nahi diye gaye; apna account register karein.

### 2. Website chalayein

Doosra PowerShell khol kar `client` folder me jaayein. Zaroorat ho to `.env.example` ki copy `.env` naam se banaayein. Default API URL local server ke saath kaam karega.

```powershell
Copy-Item .env.example .env
```

```powershell
npm install
npm run dev
```

Terminal me jo local URL aaye (aam taur par `http://localhost:5173`) browser me kholein. Product browse karne ke liye login zaroori nahi. Profile photo aur admin dashboard ke liye account login chahiye.

### 3. Admin panel

`server/.env` ke `ADMIN_EMAIL` aur `ADMIN_PASSWORD` se sign in karein. `/admin` overview se protected Orders, Affiliate clicks, Products, Users & admins, Reviews aur Help pages khulenge. Product add/edit form popup mein khulta hai. Admin product hide/restore/delete kar sakta hai aur 12+ character password ke saath naye admins bana sakta hai. Har product ke liye seller ka **real affiliate URL** dijiye. Seed ke sample links Amazon India search links hain, commission link nahi. Amazon Associates ya kisi partner network se approved tracking link lekar hi publish karein.

Customer password bhool jaye to Users & admins page par account verify karke temporary password set karein; use sirf secure channel se share karein. Customer sign in karke Account → Account security mein password badal sakta hai. Automatic reset-email bhejne ke liye email provider aur time-limited reset link alag se configure karna hoga. Optional support email dikhane ke liye `client/.env` mein `VITE_SUPPORT_EMAIL` set karein.

## Features

- Product browse, keyword search aur category filter
- Product details, seller, current/original price aur affiliate disclosure
- Affiliate Buy Now links alag tab me khulte hain
- Buy Now ke liye customer sign-in required; successful seller visits admin mein track hote hain (purchase confirmation nahi)
- Customer signup/login, profile name aur photo update/remove
- Admin-only Orders, Products, Users & admins, Reviews aur Help pages; dashboard se landing page link
- Product add/edit popup, delete confirmation popup, order status controls, account controls aur admin creation
- Admin-assisted temporary customer password reset aur customer-side password update
- MongoDB + Express REST API, password hashing, JWT, request validation, role checks, Helmet aur rate limiting
- Backend band ho tab frontend sample product catalog dikha sakta hai

## Build

Client ka production bundle check/build karne ke liye `client` folder me:

```powershell
npm install
npm run build
```

## Live deployment ke liye abhi jo cheezein chahiye

**Security:** uploaded starter ZIP ke `.env` me live database/admin credentials the. Project copy me unhe safe placeholders se replace kar diya hai. Agar woh credentials abhi bhi kisi service ke liye active hain, MongoDB password aur admin password rotate karein; un values ko production me dobara use na karein.

- Hosted MongoDB (Atlas) aur production environment variables
- Frontend host (jaise Vercel/Netlify) aur backend host (jaise Render/Railway)
- `VITE_API_URL` ko deployed backend ke `/api` URL par set karna; backend `CLIENT_URL` me deployed frontend origin set karna
- Real seller/affiliate network URLs aur unke program approval/terms
- HTTPS, strong unique `JWT_SECRET`, aur admin password. `.env` files kabhi commit na karein.

Affiliate program ke rules ke mutabik site par affiliate disclosure dikhana zaroori ho sakta hai. Header disclosure diya gaya hai; apne partner ki exact wording/placement requirements bhi poori karein. Product price/availability seller site par badal sakti hai.
