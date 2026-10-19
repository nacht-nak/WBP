
<<<<<<< HEAD
A responsive portfolio built in the existing Next.js 16 App Router starter with React, TypeScript, Tailwind CSS 4, Motion, and Lucide. The latest design follows the supplied screenshots: a narrow column, interactive character avatar, compact identity row, light introduction text, inline technology badges, and a floating contact link. Lato (300, 400, 700) is self-hosted with `next/font/local` as a visual match for the reference; font licenses are in `public/fonts/`.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000. On shells without PowerShell execution-policy restrictions, `npm` works as usual.

```powershell
npm.cmd run build
npm.cmd run start
npm.cmd run typecheck
npm.cmd run test:e2e
```

Projects use a compact three-column card layout with dashed borders and technology icons. The Technologies section has three continuous carousel rows, a pause/play control, hover and keyboard-focus pausing, and a View All catalog. Reduced-motion preferences display all technologies without scrolling. These styles live in `app/showcase.css`.

The lower sections follow the dark reference screenshots: compact credentials and education, a clickable photo stack, a contribution calendar, and two-column contact cards. Dark mode is the default; saved theme preferences are preserved. These styles live in `app/details.css`.

The browser suite runs against a production server on port 3001 and uses the installed Microsoft Edge browser. Run `build` first. To use a different browser, change `channel` in `playwright.config.ts`. Tests cover filters, navigation, image loading, theme persistence, five responsive widths, booking/timezone behavior, GitHub empty states, reduced motion, the résumé, 404s, and the Open Graph image.

## Pages

- `/`: portfolio with all sections, active sticky navigation, mobile navigation, light/dark themes, and reduced-motion support.
- `/projects`: filterable project archive.
- `/projects/[slug]`: individual project details and supplied live URLs.
- `/certifications`: full credentials and training archive, with clearly labeled placeholders until details are added.
- `/resume`: printable résumé based on verified supplied content; use Print / save as PDF.
- `/meeting`: choose a preferred date and time, add contact details, and review an email scheduling request. Gmail and email-app drafts are addressed to `profile.email` and include both the selected time zone and Philippine time. Visitors send the draft themselves; appointments become confirmed when Welquim replies.
- `/api/github`: optional server-side GitHub contribution calendar integration.
- `/api/visits`: reads the visit count with GET and records browser visits with POST.

## Add personal content

| File                                | Content                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `data/profile.ts`                   | Email, GitHub and LinkedIn URLs, photo path, availability, résumé URL, education, certifications and training |
| `data/interests.ts`                 | Travel, Gym and Work interests, photo stack images and captions                                               |
| `data/projects.ts`                  | Project descriptions, screenshots, technologies, status, live URLs, optional source URLs                      |
| `data/experience.ts`                | Employment history; replace the clearly marked placeholder and set `placeholder: false`                       |
| `data/technologies.ts`              | Technology categories                                                                                         |
| `data/highlights.ts`                | Milestones, dates, year groups, images and categories                                                         |
| `components/sections/Community.tsx` | Community copy and card; no membership is claimed without supplied information                                |

No reference video, contact URLs, employment history, certifications, community membership, or résumé file was provided. The design follows the written brief and the subsequently supplied screenshots. Empty social/contact details show as unavailable; they are never replaced with invented addresses. The résumé summarizes the supplied education and projects and excludes placeholder experience. To use a PDF instead, add it to `public/` and update `profile.resume`.

The supplied character is rendered by `components/ui/ProfileMascot.tsx` using `page-mascot`. It tracks desktop pointers and reacts to click, tap, Enter, and Space. Reduced motion keeps the head centered and disables the bounce. Its transparent WebP atlases live in `public/mascots/`; the center frame is also used for the meeting profile. Original sheets, transparent cutouts, preparation prompts, and alignment notes are retained in `characters/welquim/`. See that directory's README to rebuild the assets. Ordinary Next.js builds do not require Python or image generation.

The two live project images are genuine screenshots captured from the supplied URLs. At capture time, the Pageant Tabulation site loaded but reported unavailable candidate data. The Barangay Management image is explicitly labeled concept artwork. Highlight dates remain unspecified until verified dates are supplied; the component groups entries by their editable `year` field.

The Outside the IDE stack advances on click, tap, Enter, or Space. Its current Travel, Gym, and Work images are labeled illustrative stock photos, with sources in `public/images/outside/credits.txt`. Add your personal images to that directory, update their paths and alt text in `data/interests.ts`, and set `photosAreIllustrative` to `false`. Certifications support optional thumbnail images and credential links; add recent training to the exported `training` array in `data/profile.ts`.

## Combined Groq and Telegram chat

### Vercel: fix `/api/messages` and `/api/visits` returning 503

Both features require shared Redis storage on Vercel. Pushing the code and adding
Telegram/Groq credentials alone is insufficient; `.env.local` stays on your computer.

1. Create an Upstash **Redis** database and connect it to this Vercel project using
   the [Upstash integration](https://upstash.com/docs/redis/howto/vercelintegration).
2. In Vercel → Project → Settings → Environment Variables, ensure these exact names
   exist for **Production**: `UPSTASH_REDIS_REST_URL` (the HTTPS REST endpoint) and
   `UPSTASH_REDIS_REST_TOKEN` (the read/write REST token, not the read-only token).
   This app does not read `REDIS_URL` or `KV_REST_API_*`; copy the corresponding
   REST credentials into the exact `UPSTASH_*` names if the integration uses other names.
3. Keep `GROQ_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and
   `TELEGRAM_WEBHOOK_SECRET` in that environment. Set
   `SITE_URL=https://wpanogaling.vercel.app`. Never prefix secrets with `NEXT_PUBLIC_`.
4. Redeploy the production deployment. Environment changes only affect new
   deployments. Reopen chat and send a message; `/api/messages` should return 200,
   and `/api/visits` should return a count.
5. For personal Telegram replies, stop the local polling worker. Set the same
   `SITE_URL`, bot token, and webhook secret in your ignored `.env.local`, then run
   `npm.cmd run telegram:webhook` from `frontend`. Reply to the visitor's message
   using Telegram's **Reply** action. Groq answers do not need this webhook.

The browser preserves an unsent draft during storage outages, offers an email
link, and slows reconnection attempts to at most once per minute after repeated
failures. These UI safeguards do not replace the required Redis configuration.

**Contact Welquim** opens one shared conversation. Each visitor message is saved, sent to Telegram when configured, and answered by Groq. An unavailable Telegram connection does not prevent AI answers, and an AI failure does not prevent Telegram delivery. The simplified interface shows both replies in one conversation and reports delivery failures with a retry action. In Telegram, use **Reply** on the visitor's message to send a personal answer back to that browser. The first personal reply pauses AI for the conversation, including AI responses still being generated. The API also supports starting a fresh session with DELETE /api/messages. History survives refreshes in the same browser.

Only the configured owner's private text replies are accepted; group messages, other senders, attachments, and unthreaded messages are ignored. Reply mappings and polling offsets are scoped to the bot, so replacing a bot token cannot misroute replies from another bot.

AI answers are saved as soon as Groq responds. The browser checks for updates during an active send, so a slow Telegram connection does not hide an available AI or personal reply. Telegram network waits use a separate delivery lock. Connections that fail before the TLS handshake are retried once; uncertain sends after connecting are never retried automatically. The local polling worker also retries startup connection timeouts instead of exiting.

The bot token belongs in the ignored `.env.local` as `TELEGRAM_BOT_TOKEN`. Start your bot from your own Telegram account, then connect it locally (Node.js 22.18+ or 24 required):

```powershell
npm.cmd run telegram:connect -- your_telegram_username
```

This matches a private `/start` update from that exact username, saves `TELEGRAM_CHAT_ID`, and generates `TELEGRAM_WEBHOOK_SECRET`. It never guesses a destination from another user's message. After connecting, restart with `npm.cmd run dev`. This starts the website and its Telegram reply listener together; keep that terminal open. If the website is already running separately, start the listener in a second terminal:

```powershell
npm.cmd run telegram:poll
```

Run only one polling worker per bot. A local PID guard prevents duplicate listeners for this project and recovers after a stopped worker. `npm.cmd run telegram:status` reports bot configuration and pending private chats without acknowledging updates. A bot cannot message a private user who has not started it. See the [Telegram Bot API](https://core.telegram.org/bots/api#getupdates).

For a deployed site, configure the same Telegram variables and a public HTTPS `SITE_URL` on the host. Vercel/serverless or multiple instances also require `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for shared conversation storage. Set a distinct `CHAT_REDIS_PREFIX` for previews. Set the same public URL and webhook secret locally, stop the polling worker, and run `npm.cmd run telegram:webhook`. This registers `/api/telegram/webhook` with Telegram's secret header. Existing webhooks for other sites are not replaced automatically. Do not use webhook and polling modes at the same time. No deployment or webhook registration is performed just by building the application.

Visitor access uses a random HTTP-only, SameSite cookie; session identifiers and bot credentials are never sent to Telegram message text or exposed as URL parameters. Conversations keep the most recent 100 messages. The browser cookie lasts seven days after a send; stored conversations and reply mappings expire after seven days since their respective last writes. Local data lives in `.data/chat` (or `CHAT_DATA_DIR`) and survives restarts. Local expired files are ignored but stay on disk until removed; Redis expires them automatically. Serverless hosts fail closed without shared storage. Back up persistent storage if needed, and keep it outside source control.

Message IDs deduplicate browser retries and Telegram update IDs deduplicate repeated replies. Sends are capped at 10 per conversation and 60 overall per minute in shared storage. Telegram does not provide a send idempotency key: if a network timeout occurs after Telegram accepts a message, retrying can produce a duplicate, so the UI says when delivery is unconfirmed. Browser message history is private to its cookie, and owner replies are rendered as plain text.

Run `npm.cmd run test:telegram` for reply routing, isolation, deduplication, authorization, delivery failure and rate-limit tests. Build first, then run `npm.cmd run test:e2e -- tests/chat.spec.ts tests/live-chat.spec.ts` for browser and endpoint checks. Tests mock provider calls and do not send real Telegram messages.

## Groq configuration

Set `GROQ_API_KEY` in the ignored `.env.local` file. `GROQ_MODEL` defaults to `openai/gpt-oss-120b`. For deployment, add the same server environment variables to your host. Never use a `NEXT_PUBLIC_` key. The integration uses the [Groq Chat Completions API](https://console.groq.com/docs/api-reference).

`lib/groq.ts` supplies verified portfolio facts and bounded conversation history. `/api/messages` coordinates storage, Telegram delivery and AI generation. Both providers are attempted independently; retries reuse the same message ID. The assistant cannot book meetings or promise personal responses. The standalone legacy `/api/chat` endpoint remains available with its existing validation.

### Local setup troubleshooting

- Send `/start` **inside the Telegram app**, to the bot username printed by `telegram:connect`. It is not a PowerShell command. Changing the token can change the bot username.
- If Next.js says a server is already running at http://localhost:3000, use that server. Do not launch a second development server for the same directory.
- Run `telegram:connect` before `telegram:poll`. The worker now prints its startup progress and gives separate connection, token and conflicting-listener errors.
- `npm.cmd run dev` starts the local reply worker automatically when Telegram is configured. If running the website another way, keep `npm.cmd run telegram:poll` running separately. Groq replies do not require the worker.

## Optional GitHub integration and production URL

The contact section's Email card opens an inquiry modal with one **Save** button. It sends directly through the server to `profile.email` in `data/profile.ts`, with the visitor's address as Reply-To. No Gmail window or email app opens. Let's talk still opens the scheduling page, where visitors send their scheduling draft themselves. The LinkedIn and email social links also use `data/profile.ts`.

To enable direct inquiry delivery, turn on Google 2-Step Verification for `welpanogaling12@gmail.com`, create an [App Password](https://myaccount.google.com/apppasswords), and add `GMAIL_APP_PASSWORD=your_app_password` to `.env.local`. Do not use your normal Google password or a `NEXT_PUBLIC_` variable. `GMAIL_USER` optionally selects the sending Gmail account; it defaults to `profile.email`. Restart the dev server after configuring; also set these private variables on your production host. Without this credential the form reports that email is unavailable and keeps the visitor's text.

`POST /api/inquiries` validates the form, fixes the recipient on the server, and limits inquiries to 3 per sender and 30 total per hour. It reuses the persistent chat storage (`CHAT_DATA_DIR` locally, Upstash Redis for serverless hosting) for delivery receipts and limits; no Telegram credentials are needed. Receipts contain a content hash and delivery state, not the message body. Repeating a submission ID does not resend accepted or uncertain deliveries for seven days. SMTP errors never expose credentials; success means Gmail accepted the message, not guaranteed inbox placement. Run `npm.cmd run test:inquiry` for isolated sender tests with mocked SMTP, without sending real emails.

The GitHub Activity chart uses the profile URL in `data/profile.ts` (currently `https://github.com/nacht-nak`). It reads GitHub's public contribution calendar without requiring a token. `GITHUB_USERNAME` optionally overrides the calendar account. For deployment or authenticated access, set these server environment variables as needed:

```dotenv
SITE_URL=https://your-actual-domain.example
GITHUB_USERNAME=nacht-nak
# Optional: use authenticated GraphQL before falling back to the public calendar.
GITHUB_TOKEN=your-server-side-github-token
```

If supplying a token, use one authorized to read the target profile through GitHub GraphQL. Never prefix it with `NEXT_PUBLIC_`, commit it, or put it in a client file. The API caches successful upstream requests for an hour. The public-calendar fallback validates dates, intensity levels, and tooltip counts; it never embeds upstream HTML. If GitHub is unavailable or changes that markup, the section shows an unavailable message and keeps the profile link. Rebuild after changing environment configuration. Run `node --experimental-strip-types --test tests/github-calendar.test.mjs` for parsing checks.

Set `SITE_URL` to the real origin before deployment so Open Graph image URLs resolve correctly. The fallback is localhost for local development. No hosting account or scheduler integration is required to run the site. Publication and real scheduling are not configured.

## Structure

### Footer visit counter

The footer displays actual visits, starting at zero. A first-party HTTP-only cookie counts a browser once every 24 hours; refreshes and navigation do not increase it again during that period. This is an approximate visit count, not a count of identifiable people. No IP addresses or visitor profiles are stored. Clearing cookies or using another browser can count again.

Locally, the count persists in `.data/visits.json` across restarts. `VISITOR_DATA_DIR` can point to a persistent directory on a single hosted server. Keep that directory across deployments and back it up. If the server is killed during an increment and leaves a `visits.lock` directory, stop the server and remove only that empty lock directory before restarting. Browser tests use the separate `.data/e2e` directory.

For Vercel or other serverless/multiple-instance hosting, configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from your own Redis database. The integration uses the [Upstash REST API](https://upstash.com/docs/redis/features/restapi) with an atomic increment. Set `VISITOR_REDIS_KEY` to a different key for previews so preview traffic stays separate. Credentials remain server-only. No database account has been created or connected. Without persistent storage, or during a storage failure, the badge says “Visits unavailable” instead of inventing a total. A new Redis database starts its own count; local development traffic is not migrated automatically.

### Application files

The existing root-level `app/` architecture is preserved. `components/layout/`, `components/sections/`, `components/ui/`, `components/projects/`, and `components/meeting/` separate layouts, reusable elements, and interactive features. Static page composition stays in Server Components; navigation, filters, animations, and the scheduling request form use Client Components. Design tokens, responsive rules, dark mode, and print styles live in `app/globals.css`; the reference-inspired profile layout lives in `app/profile.css`.

To refresh bundled fonts, run `node scripts/download-fonts.mjs` with internet access. Ordinary builds do not need external font access.
=======
>>>>>>> 1ae2bda11e7cb7fff9ea1fa21c3670910af59dfb
