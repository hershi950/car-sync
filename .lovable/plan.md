# Investigation: "password authentication failed" on saves and schema changes

## What I checked

- Backend health: the hosted database and auth service are both up and responding (about 100ms), no restarts since boot, memory and disk well within limits.
- Reading data: works. A read-only query ran successfully against the live database.
- Tables: the app's data area is **completely empty** — zero tables. So bookings, team names, settings and car locations have nowhere to be stored.
- Database accounts: all standard accounts exist and are enabled; none are expired or locked. Nothing was renamed or removed.
- Change history: **no schema change has ever been recorded** for this backend — the change log folder is empty, so no recent change broke anything.
- Server-side functions: none exist in this project, so they are not a factor.
- Recent builds: no build errors logged.

## Conclusion

This is not caused by your app's code, a recent schema change, a role, or a function.

Two separate facts explain what you see:

1. The database has **no tables**, so any save from the app fails outright.
2. The privileged connection used to *create* those tables is being rejected with a password failure. Reading works because reads use a different, working account. That credential lives on the hosting side, not in your project files — nothing in the code can fix it.

So the app is blocked on one infrastructure-side credential for the built-in database.

## Proposed next steps (no changes made yet)

1. Re-attempt one schema change now that health checks are clean; the credential is refreshed on each attempt and may now succeed.
2. If it succeeds: recreate the four tables (bookings, team names, settings, car locations) with the access rules the passcode-based app needs, then confirm with a read.
3. If it fails again with the same password error: this needs Lovable support, since the credential is not something the project can change. I will report the exact failure so you can raise it, and meanwhile the app stays read-only.
4. Once tables exist, import your downloaded data. I could not find the exported files earlier — please upload them here (CSV per table is ideal) and I will map each file to the matching table.

## Technical notes

- Reads run as `supabase_read_only_user` and succeed; the migration path uses a privileged session connection that returns an authentication failure.
- `public` schema currently contains zero relations; the Drizzle migration journal has no entries, so the earlier table-creation attempts never committed.
- Three legacy SQL files exist under `supabase/migrations/` from the previous external project; their contents are the reference for recreating the schema.
- No edge functions are defined, so nothing server-side is holding stale credentials.
