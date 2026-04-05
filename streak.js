#!/usr/bin/env node

const { execSync } = require('child_process');

function getContributions(username, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  try {
    const result = execSync(
      `git log --author="${username}" --since="${sinceStr}" --format="%ad" --date=short`,
      { encoding: 'utf-8' }
    );
    const dates = [...new Set(result.trim().split('\n').filter(Boolean))];
    return dates.sort();
  } catch {
    return [];
  }
}

function calculateStreak(dates) {
  if (!dates.length) return { current: 0, longest: 0 };

  let current = 1;
  let longest = 1;
  let streak = 1;

  for (let i = dates.length - 1; i > 0; i--) {
    const d1 = new Date(dates[i]);
    const d2 = new Date(dates[i - 1]);
    const diff = (d1 - d2) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
      longest = Math.max(longest, streak);
      if (i === dates.length - 1 || current === streak - 1) current = streak;
    } else {
      streak = 1;
    }
  }

  return { current, longest };
}

const username = process.argv[2] || execSync('git config user.name', { encoding: 'utf-8' }).trim();
const days = parseInt(process.argv[3]) || 30;
const dates = getContributions(username, days);
const { current, longest } = calculateStreak(dates);

console.log(`\nGit Streak for: ${username}`);
console.log(`Period: last ${days} days`);
console.log(`Active days: ${dates.length}`);
console.log(`Current streak: ${current} day(s)`);
console.log(`Longest streak: ${longest} day(s)\n`);
