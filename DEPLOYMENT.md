# Deploy Unnati Charitable Trust (Free)

This guide deploys the project using **free tiers**:

| Service | Hosts | Free URL |
|---------|-------|----------|
| **Neon** | PostgreSQL database | `*.neon.tech` |
| **Render** | Express backend API | `*.onrender.com` |
| **Vercel** | React frontend | `*.vercel.app` |

---

## Step 1: Push code to GitHub

1. Create a new repo on [github.com/new](https://github.com/new) named `unnati-charitable`
2. In PowerShell:

```powershell
cd "c:\Users\Divya\Documents\Unnati Charitable"
git init
git add .
git commit -m "Prepare Unnati Charitable Trust for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/unnati-charitable.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2: Create free PostgreSQL (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Create a project named `unnati-charitable`
3. Copy the **connection string** (looks like):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this for Render env vars

---

## Step 3: Deploy backend on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New +** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create the web service
5. When prompted, set these **Environment Variables**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `CASHFREE_APP_ID` | Your Cashfree sandbox App ID |
| `CASHFREE_SECRET_KEY` | Your Cashfree sandbox Secret Key |
| `CASHFREE_ENV` | `sandbox` |
| `CASHFREE_BASE_URL` | `https://sandbox.cashfree.com/pg` |
| `FRONTEND_URL` | Leave blank for now — update after Step 4 |
| `BACKEND_URL` | Your Render URL, e.g. `https://unnati-charitable-api.onrender.com` |

6. Click **Apply** and wait for deploy (~5–10 min first time)
7. Test: open `https://YOUR-APP.onrender.com/api/health`

You should see:
```json
{"status":"ok","message":"Unnati Charitable Trust API is running"}
```

---

## Step 4: Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click **Add New Project** → import your GitHub repo
3. Configure:
   - **Root Directory:** `Frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR-APP.onrender.com/api` |
| `VITE_CASHFREE_MODE` | `sandbox` |

5. Click **Deploy**
6. Copy your Vercel URL, e.g. `https://unnati-charitable.vercel.app`

---

## Step 5: Connect frontend ↔ backend

1. Go back to **Render** → your backend service → **Environment**
2. Update:
   ```
   FRONTEND_URL=https://unnati-charitable.vercel.app
   ```
   (use your actual Vercel URL)
3. Save — Render will redeploy automatically

---

## Step 6: Cashfree webhook (optional)

In [Cashfree Dashboard](https://merchant.cashfree.com) → **Developers** → **Webhooks**:

```
https://YOUR-APP.onrender.com/api/donations/webhook
```

---

## Your live URLs

After deployment:

- **Website:** `https://unnati-charitable.vercel.app`
- **API:** `https://unnati-charitable-api.onrender.com/api`
- **Health check:** `https://unnati-charitable-api.onrender.com/api/health`

---

## Notes

- **Render free tier** sleeps after 15 min inactivity — first request may take ~30 seconds to wake up
- **Sandbox Cashfree** works with HTTPS Vercel/Render URLs for testing
- For **live payments**, switch to production Cashfree keys and set `CASHFREE_ENV=production`
- Never commit `.env` files — secrets go only in Render/Vercel dashboards

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend shows "Cannot reach backend" | Check `VITE_API_URL` in Vercel matches Render URL + `/api` |
| CORS error | Set `FRONTEND_URL` in Render to exact Vercel URL (no trailing slash) |
| Database error on Render | Verify `DATABASE_URL` from Neon includes `?sslmode=require` |
| Cashfree auth failed | Use matching sandbox keys with `CASHFREE_ENV=sandbox` |
| 404 on page refresh | `vercel.json` rewrites are already configured |
