# Instagram Reels Auto-Sync — one-time setup (~15 minutes)

Your website now reads the latest 5 reels from **`src/data/reels.json`**
instead of a hardcoded list. A GitHub Action
(`.github/workflows/sync-reels.yml`) refreshes that file every 6 hours from
the **official Instagram Graph API**, and every change auto-deploys to Vercel.

**Data safety:** this touches no database and no customer data — it only
rewrites one JSON file with your reel list.

---

## Step 1 — Prerequisites (5 min)

1. Your Instagram **@manatechbazar** must be a **Business or Creator**
   account (it already is if you have professional tools).
2. You need a **Facebook Page** connected to that Instagram account
   (Meta's API reads reels through the Page link):
   - Instagram app → Settings → **Accounts and privacy** →
     **Switch into linked Facebook Page** / or facebook.com → your Page →
     Settings → Linked accounts → Instagram → connect `manatechbazar`.
3. A Facebook account that is **admin of that Page**.

## Step 2 — Create the Meta app + token (7 min)

1. Go to <https://developers.facebook.com/apps> → **Create App** →
   app type **Business** → name it anything (e.g. "ManaTechBazar Site") →
   Create.
2. In the app dashboard left sidebar → **Add products** →
   **Instagram Graph API** → (no need to fill anything extra).
3. Open **Graph API Explorer**: <https://developers.facebook.com/tools/explorer>
   - Select **your app** from the dropdown (top-right, next to "Get Token").
   - Click **Generate Access Token** → log in with the Facebook account that
     manages your Page → approve the prompts.
   - In the permissions list add at least: `instagram_basic`,
     `instagram_manage_insights`, `pages_read_engagement`,
     `pages_show_list`, `business_management`.
   - Copy the token.
4. **Exchange it for a 60-day token** (the script then auto-renews it
   forever, so you never do this again) — open this URL in your browser,
   replacing `APP_ID`/`APP_SECRET` with your app's values
   (App Settings → Basic) and `TOKEN` with the token from step 3:

   ```
   https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=TOKEN
   ```

   Copy the new `access_token` from the JSON response.
5. Still in Graph API Explorer, run `me/accounts` (the explorer has a
   "Get Access Token" field) or simply note your **Instagram business
   account id** by querying:
   `GET /me/accounts?fields=instagram_business_account{id,username}` —
   copy the numeric **instagram_business_account id**.

## Step 3 — Add GitHub secrets (2 min)

Open your repo on GitHub → **Settings → Secrets and variables →
Actions → New repository secret** and add all seven:

| Secret | Value |
| --- | --- |
| `INSTAGRAM_ACCESS_TOKEN` | the 60-day token from Step 2.4 |
| `META_APP_ID` | your Meta app id |
| `META_APP_SECRET` | your Meta app secret |
| `IG_USER_ID` | instagram_business_account numeric id from Step 2.5 |
| `CLOUDINARY_CLOUD_NAME` | `j8ly7tsg` |
| `CLOUDINARY_API_KEY` | from `.env` (CLOUDINARY_API_KEY) |
| `CLOUDINARY_API_SECRET` | from `.env` (CLOUDINARY_API_SECRET) |

`META_APP_ID`/`META_APP_SECRET` are what let the script **auto-refresh the
token every run** so it never expires — do not skip them.

## Step 4 — Test (1 min)

Repo → **Actions → Sync Instagram reels → Run workflow** → wait ~30 s.
It should log the 5 newest reel shortcodes, then commit
`Update Instagram reels to latest …` if the list changed.
Vercel picks up the push and redeploys within ~1 minute.

You can also run it locally:

```bash
node scripts/sync-reels.mjs
```

## How it behaves day-to-day

- **You post a new reel** → within 6 hours (or press "Run workflow") it
  appears in position 1 on the site and the 5th/oldest reel drops off.
- Videos are re-hosted on your Cloudinary (already used by the site), so
  they play natively with the 🔊 buttons — no Instagram iframe.
- The reel's Instagram link opens the original post.
- If a reel video fails to upload, the previous entry is kept — the
  section never goes blank.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `No INSTAGRAM_ACCESS_TOKEN` | Step 3 secrets missing |
| `No Instagram Professional account linked` | IG must be Business/Creator + connected to your FB Page; check `IG_USER_ID` |
| `Graph API ... invalid token` | Token expired before you added app id/secret — redo Step 2.4 |
| `permission denied` | Re-generate the token in the explorer with `pages_read_engagement` + `instagram_basic` |
| Action succeeds but site unchanged | `reels.json unchanged` in the log means Instagram still lists the same 5 reels — normal |
