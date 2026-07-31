import { readFileSync } from 'node:fs';

const fa = JSON.parse(readFileSync('public/data/full_analysis.json', 'utf8'));
const uf = JSON.parse(readFileSync('public/data/user_forensics.json', 'utf8'));
const er = JSON.parse(readFileSync('public/data/events_research.json', 'utf8'));

const accounts = new Set();
fa.top_authors.forEach(a => accounts.add(a.author));
uf.users.forEach(u => accounts.add(u.username));
console.log('Account union:', accounts.size);

console.log('72 scoped metrics check:');
// check what has 72 items
console.log('subreddit_growth:', fa.subreddit_growth.length);
console.log('monthly_spikes:', fa.monthly_spikes.length);
console.log('flair_monthly:', fa.flair_monthly.length);
console.log('events:', er.events.length);
console.log('eras:', er.eras.length);

let scopedMetrics = 0;
// Wait, '72 scoped metrics' could refer to columns or some specific array. Let's see if any array has length 72, or if it's the number of properties.
// Let's just output parity assertions as the prompt requested.

