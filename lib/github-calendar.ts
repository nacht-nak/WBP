type Day = {
  date: string;
  contributionCount: number;
  contributionLevel: string;
};
const levels = [
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
];

function attribute(tag: string, name: string) {
  return new RegExp(`(?:^|\\s)${name}\\s*=\\s*["']([^"']*)["']`).exec(tag)?.[1];
}

// Read only dates, levels and counts. Never render GitHub's HTML in the browser.
export function parseGithubCalendar(html: string) {
  const counts = new Map<string, number>();
  for (const match of html.matchAll(
    /<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g,
  )) {
    const id = attribute(match[1], "for");
    const count = /^(No|[\d,]+) contributions? on\b/.exec(match[2].trim());
    if (id && count)
      counts.set(
        id,
        count[1] === "No" ? 0 : Number(count[1].replaceAll(",", "")),
      );
  }
  const days = new Map<string, Day>();
  for (const match of html.matchAll(/<td\b([^>]*)>/g)) {
    const date = attribute(match[1], "data-date");
    if (!date) continue;
    const id = attribute(match[1], "id");
    const level = attribute(match[1], "data-level");
    const count = id ? counts.get(id) : undefined;
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date ||
      !level ||
      !/^[0-4]$/.test(level) ||
      count === undefined ||
      !Number.isSafeInteger(count) ||
      count < 0 ||
      days.has(date)
    )
      throw new Error("Unrecognized GitHub calendar");
    days.set(date, {
      date,
      contributionCount: count,
      contributionLevel: levels[Number(level)],
    });
  }
  if (!days.size) throw new Error("GitHub calendar is missing");
  const weeks: { contributionDays: Day[] }[] = [];
  let totalContributions = 0;
  for (const day of [...days.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  )) {
    if (!weeks.length || new Date(day.date).getUTCDay() === 0)
      weeks.push({ contributionDays: [] });
    weeks[weeks.length - 1].contributionDays.push(day);
    totalContributions += day.contributionCount;
  }
  return { totalContributions, weeks };
}
