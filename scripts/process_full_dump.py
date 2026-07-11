#!/usr/bin/env python3
"""
Process r/ForbiddenBromance full dump into enriched JSON for Part I visualizations.
Input: users/r_forbiddenbromance_comments.jsonl + users/r_forbiddenbromance_posts.jsonl
Output: public/data/full_analysis.json
"""
import json
import collections
import datetime
import math
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMMENTS_FILE = os.path.join(BASE, "users", "r_forbiddenbromance_comments.jsonl")
POSTS_FILE = os.path.join(BASE, "users", "r_forbiddenbromance_posts.jsonl")
OUTPUT_FILE = os.path.join(BASE, "public", "data", "full_analysis.json")

HEBREW_RE = re.compile(r'[א-ת]')
ARABIC_RE = re.compile(r'[؀-ۿ]')

KW = {
    "hezbollah": re.compile(r'hezbollah|hizb|حزب الله', re.I),
    "iran": re.compile(r'\biran\b|iranian|tehran|irgc', re.I),
    "peace": re.compile(r'\bpeace\b|coexist|normali|bridge|friend', re.I),
    "sectarian": re.compile(r"shia|sunni|sectarian|shi'a|شيعة|alawi", re.I),
    "gaza_palestine": re.compile(r'gaza|palestin|west bank|intifada', re.I),
    "identity": re.compile(r'lebanese identity|who we are|our culture|arab identity', re.I),
}

CONFLICT_MONTHS = {
    "2021-05","2021-06","2023-10","2023-11",
    "2024-09","2024-10","2024-11","2024-12",
    "2025-01","2025-02","2026-01","2026-02","2026-03"
}

def is_israeli(flair):
    if not flair: return False
    f = flair.lower()
    return "israel" in f or "🇮🇱" in flair or "jewish" in f or "jew " in f

def is_lebanese(flair):
    if not flair: return False
    f = flair.lower()
    return "leban" in f or "🇱🇧" in flair

def ts_to_dt(ts):
    return datetime.datetime.fromtimestamp(ts, tz=datetime.timezone.utc)

print("Loading data...")

# ── per-day accumulators ──────────────────────────────────────────────────────
day_posts = collections.Counter()
day_comments = collections.Counter()
day_hebrew_comments = collections.Counter()
day_unique_users = collections.defaultdict(set)
day_scores_comments = collections.defaultdict(list)
day_scores_posts = collections.defaultdict(list)
day_arabic_comments = collections.Counter()

# ── per-month accumulators ────────────────────────────────────────────────────
mon_posts = collections.Counter()
mon_comments = collections.Counter()
mon_hebrew_posts = collections.Counter()
mon_hebrew_comments = collections.Counter()
mon_arabic_posts = collections.Counter()
mon_arabic_comments = collections.Counter()
mon_users = collections.defaultdict(set)
mon_scores_comments = collections.defaultdict(list)
mon_scores_posts = collections.defaultdict(list)
mon_subscribers = collections.defaultdict(int)
mon_flair = collections.defaultdict(lambda: collections.Counter())
mon_kw = collections.defaultdict(lambda: collections.Counter())

# ── growth accumulators ───────────────────────────────────────────────────────
all_users_seen = set()
mon_new_users = collections.defaultdict(set)   # first appearance month
mon_israeli_users = collections.defaultdict(set)
mon_lebanese_users = collections.defaultdict(set)
mon_other_users = collections.defaultdict(set)
mon_noflair_users = collections.defaultdict(set)

# ── author accumulators ───────────────────────────────────────────────────────
author_posts = collections.Counter()
author_comments = collections.Counter()
author_first = {}
author_last = {}
author_flair = {}
author_hebrew_comments = collections.Counter()
author_months_active = collections.defaultdict(set)
author_scores = collections.defaultdict(list)

print("Processing posts...")
with open(POSTS_FILE) as f:
    for line in f:
        d = json.loads(line)
        author = d.get("author", "[deleted]")
        ts = d.get("created_utc", 0)
        dt = ts_to_dt(ts)
        day = dt.strftime("%Y-%m-%d")
        mon = dt.strftime("%Y-%m")
        score = d.get("score", 0) or 0
        flair = d.get("author_flair_text") or ""
        link_flair = d.get("link_flair_text") or ""
        subs = d.get("subreddit_subscribers") or 0
        text = (d.get("title", "") or "") + " " + (d.get("selftext", "") or "")

        day_posts[day] += 1
        day_unique_users[day].add(author)
        day_scores_posts[day].append(score)

        mon_posts[mon] += 1
        mon_users[mon].add(author)
        mon_scores_posts[mon].append(score)
        if subs > mon_subscribers[mon]:
            mon_subscribers[mon] = subs

        if flair:
            mon_flair[mon][flair] += 1
        if link_flair:
            mon_flair[mon][f"[post]{link_flair}"] += 1

        for kw, rx in KW.items():
            if rx.search(text):
                mon_kw[mon][kw] += 1

        if HEBREW_RE.search(text):
            mon_hebrew_posts[mon] += 1
        if ARABIC_RE.search(text):
            mon_arabic_posts[mon] += 1

        if author not in ("[deleted]", "AutoModerator"):
            author_posts[author] += 1
            author_months_active[author].add(mon)
            author_scores[author].append(score)
            if author not in author_first or day < author_first[author]:
                author_first[author] = day
            if author not in author_last or day > author_last[author]:
                author_last[author] = day
            if flair:
                author_flair[author] = flair

            if mon not in all_users_seen or author not in all_users_seen:
                if author not in all_users_seen:
                    mon_new_users[mon].add(author)
                    all_users_seen.add(author)

            if is_israeli(flair):
                mon_israeli_users[mon].add(author)
            elif is_lebanese(flair):
                mon_lebanese_users[mon].add(author)
            elif flair:
                mon_other_users[mon].add(author)
            else:
                mon_noflair_users[mon].add(author)

print("Processing comments...")
with open(COMMENTS_FILE) as f:
    for line in f:
        d = json.loads(line)
        author = d.get("author", "[deleted]")
        ts = d.get("created_utc", 0)
        dt = ts_to_dt(ts)
        day = dt.strftime("%Y-%m-%d")
        mon = dt.strftime("%Y-%m")
        score = d.get("score", 0) or 0
        body = d.get("body", "") or ""
        flair = d.get("author_flair_text") or ""

        is_heb = bool(HEBREW_RE.search(body))
        is_ara = bool(ARABIC_RE.search(body))

        day_comments[day] += 1
        day_unique_users[day].add(author)
        day_scores_comments[day].append(score)
        if is_heb: day_hebrew_comments[day] += 1
        if is_ara: day_arabic_comments[day] += 1

        mon_comments[mon] += 1
        mon_users[mon].add(author)
        mon_scores_comments[mon].append(score)
        if is_heb: mon_hebrew_comments[mon] += 1
        if is_ara: mon_arabic_comments[mon] += 1

        for kw, rx in KW.items():
            if rx.search(body):
                mon_kw[mon][kw] += 1

        if flair:
            mon_flair[mon][flair] += 1

        if author not in ("[deleted]", "AutoModerator"):
            author_comments[author] += 1
            author_months_active[author].add(mon)
            author_scores[author].append(score)
            if is_heb: author_hebrew_comments[author] += 1
            if author not in author_first or day < author_first[author]:
                author_first[author] = day
            if author not in author_last or day > author_last[author]:
                author_last[author] = day
            if flair:
                author_flair[author] = flair

            if author not in all_users_seen:
                mon_new_users[mon].add(author)
                all_users_seen.add(author)

            if is_israeli(flair):
                mon_israeli_users[mon].add(author)
            elif is_lebanese(flair):
                mon_lebanese_users[mon].add(author)
            elif flair:
                mon_other_users[mon].add(author)
            else:
                mon_noflair_users[mon].add(author)

print("Computing monthly stats...")

all_months = sorted(set(list(mon_posts.keys()) + list(mon_comments.keys())))

# z-scores
c_vals = [mon_comments[m] for m in all_months]
p_vals = [mon_posts[m] for m in all_months]
c_mean = sum(c_vals) / len(c_vals)
p_mean = sum(p_vals) / len(p_vals)
c_std = math.sqrt(sum((v - c_mean)**2 for v in c_vals) / len(c_vals)) or 1
p_std = math.sqrt(sum((v - p_mean)**2 for v in p_vals) / len(p_vals)) or 1

monthly_activity = []
flair_monthly = []
keyword_trends = []
monthly_spikes = []

for m in all_months:
    posts = mon_posts[m]
    comments = mon_comments[m]
    avg_sc = round(sum(mon_scores_comments[m]) / len(mon_scores_comments[m]), 2) if mon_scores_comments[m] else 0
    avg_sp = round(sum(mon_scores_posts[m]) / len(mon_scores_posts[m]), 2) if mon_scores_posts[m] else 0

    monthly_activity.append({
        "month": m,
        "posts": posts,
        "comments": comments,
        "total": posts + comments,
        "unique_users": len(mon_users[m]),
        "hebrew_posts": mon_hebrew_posts[m],
        "hebrew_comments": mon_hebrew_comments[m],
        "arabic_posts": mon_arabic_posts[m],
        "arabic_comments": mon_arabic_comments[m],
        "avg_score_comments": avg_sc,
        "avg_score_posts": avg_sp,
        "subscriber_count": mon_subscribers[m],
    })

    # flair categories
    flair_dict = {}
    for flair_key, cnt in mon_flair[m].items():
        if not flair_key.startswith("[post]"):
            # Normalize flair to categories
            fl = flair_key.lower()
            if is_israeli(flair_key):
                cat = "Israeli"
            elif is_lebanese(flair_key):
                cat = "Lebanese"
            elif any(x in fl for x in ["jewish", "diaspora", "american jewish", "british jew"]):
                cat = "Jewish Diaspora"
            elif any(x in fl for x in ["arab", "syrian", "jordan", "egypt", "gulf", "palest"]):
                cat = "Arab"
            elif flair_key.strip():
                cat = "Other"
            else:
                cat = "No Flair"
            if cat not in flair_dict:
                flair_dict[cat] = {"posts": 0, "comments": 0, "total": 0}
            flair_dict[cat]["total"] += cnt
            flair_dict[cat]["comments"] += cnt

    flair_monthly.append({"month": m, "categories": flair_dict})

    kws = mon_kw[m]
    keyword_trends.append({
        "month": m,
        "hezbollah": kws["hezbollah"],
        "iran": kws["iran"],
        "peace": kws["peace"],
        "sectarian": kws["sectarian"],
        "gaza_palestine": kws["gaza_palestine"],
        "identity": kws["identity"],
    })

    monthly_spikes.append({
        "month": m,
        "posts": posts,
        "comments": comments,
        "total": posts + comments,
        "post_zscore": round((posts - p_mean) / p_std, 3),
        "comment_zscore": round((comments - c_mean) / c_std, 3),
    })

# ── daily activity ────────────────────────────────────────────────────────────
print("Building daily activity...")
all_days = sorted(set(list(day_posts.keys()) + list(day_comments.keys())))
daily_activity = []
for day in all_days:
    daily_activity.append({
        "date": day,
        "posts": day_posts[day],
        "comments": day_comments[day],
        "total": day_posts[day] + day_comments[day],
        "unique_users": len(day_unique_users[day]),
        "hebrew_comments": day_hebrew_comments[day],
        "arabic_comments": day_arabic_comments[day],
        "avg_score_comments": round(sum(day_scores_comments[day]) / len(day_scores_comments[day]), 2) if day_scores_comments[day] else 0,
    })

# ── subreddit growth ──────────────────────────────────────────────────────────
print("Building subreddit growth...")
cumulative_users = set()
subreddit_growth = []
for m in all_months:
    new_this_month = mon_new_users[m]
    cumulative_users.update(new_this_month)
    subreddit_growth.append({
        "month": m,
        "cumulative_unique_users": len(cumulative_users),
        "new_users_this_month": len(new_this_month),
        "active_users": len(mon_users[m]),
        "subscriber_count": mon_subscribers[m],
        "posts": mon_posts[m],
        "comments": mon_comments[m],
        "israeli_flair_users": len(mon_israeli_users[m]),
        "lebanese_flair_users": len(mon_lebanese_users[m]),
        "other_flair_users": len(mon_other_users[m]),
        "no_flair_users": len(mon_noflair_users[m]),
    })

# ── top authors ───────────────────────────────────────────────────────────────
print("Building top authors...")
all_authors = set(list(author_posts.keys()) + list(author_comments.keys()))
top_authors_list = []
for a in all_authors:
    posts = author_posts[a]
    comments = author_comments[a]
    total = posts + comments
    if total < 3:
        continue
    heb_c = author_hebrew_comments[a]
    heb_pct = round(heb_c / max(comments, 1) * 100, 1)
    months_active = author_months_active[a]
    conflict_months_active = len(months_active & CONFLICT_MONTHS)
    conflict_pct = round(conflict_months_active / max(len(months_active), 1) * 100, 1)
    scores = author_scores[a]
    avg_score = round(sum(scores) / len(scores), 2) if scores else 0
    flair = author_flair.get(a, "")
    top_authors_list.append({
        "author": a,
        "posts": posts,
        "comments": comments,
        "total": total,
        "first_seen": author_first.get(a, ""),
        "last_seen": author_last.get(a, ""),
        "flair": flair,
        "hebrew_content_pct": heb_pct,
        "conflict_pct": conflict_pct,
        "avg_score": avg_score,
    })
top_authors_list.sort(key=lambda x: -x["total"])

# ── overview ──────────────────────────────────────────────────────────────────
total_posts = sum(mon_posts.values())
total_comments = sum(mon_comments.values())
total_heb_comments = sum(mon_hebrew_comments.values())
total_heb_posts = sum(mon_hebrew_posts.values())
total_arabic_comments = sum(mon_arabic_comments.values())
peak_month = max(mon_comments, key=mon_comments.get)

# Israeli vs Lebanese flair share of posts
total_israeli_posts = sum(1 for a in author_first if is_israeli(author_flair.get(a, "")))
total_all_users = len(author_first)
israeli_flair_pct = round(total_israeli_posts / max(total_all_users, 1) * 100, 1)

overview = {
    "total_posts": total_posts,
    "total_comments": total_comments,
    "total_artifacts": total_posts + total_comments,
    "total_unique_users": len(all_users_seen),
    "date_range_start": "2019-09-26",
    "date_range_end": "2026-07-10",
    "months_observed": len(all_months),
    "peak_month": peak_month,
    "peak_comments": mon_comments[peak_month],
    "hebrew_posts_total": total_heb_posts,
    "hebrew_comments_total": total_heb_comments,
    "arabic_comments_total": total_arabic_comments,
    "israeli_flair_user_pct": israeli_flair_pct,
    "downloaded_user_histories": 22,
    "events_correlated": 13,
}

out = {
    "overview": overview,
    "monthly_activity": monthly_activity,
    "daily_activity": daily_activity,
    "subreddit_growth": subreddit_growth,
    "flair_monthly": flair_monthly,
    "keyword_trends": keyword_trends,
    "monthly_spikes": monthly_spikes,
    "top_authors": top_authors_list[:50],
}

print(f"Writing output ({len(monthly_activity)} months, {len(daily_activity)} days, {len(top_authors_list)} authors)...")
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
with open(OUTPUT_FILE, "w") as f:
    json.dump(out, f, separators=(",", ":"))

size_mb = os.path.getsize(OUTPUT_FILE) / 1024 / 1024
print(f"Done. Output: {OUTPUT_FILE} ({size_mb:.1f} MB)")
print(f"Overview: {json.dumps(overview, indent=2)}")
