import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGithubCalendar } from "../lib/github-calendar.ts";

function cell(id, date, level, count) {
  return `<td id="${id}" data-level="${level}" data-date="${date}"></td>
    <tool-tip for="${id}">${count} contributions on a date.</tool-tip>`;
}

test("public calendar matches tooltip counts to dates and groups chronological weeks", () => {
  // GitHub emits its table by weekday, not by chronological date.
  const html = cell("sun", "2026-10-11", 2, "1,234") +
    cell("fri", "2026-10-09", 0, "No") + cell("sat", "2026-10-10", 1, "1");
  const calendar = parseGithubCalendar(html);
  assert.equal(calendar.totalContributions, 1235);
  assert.deepEqual(calendar.weeks.map(w => w.contributionDays.map(d => d.date)),
    [["2026-10-09", "2026-10-10"], ["2026-10-11"]]);
  assert.equal(calendar.weeks[0].contributionDays[0].contributionCount, 0);
  assert.equal(calendar.weeks[1].contributionDays[0].contributionLevel, "SECOND_QUARTILE");
});

test("missing, malformed, and duplicate calendar data fails instead of inventing activity", () => {
  assert.throws(() => parseGithubCalendar("<h1>Try again later</h1>"));
  assert.throws(() => parseGithubCalendar('<td id="day" data-date="2026-10-11" data-level="2"></td>'));
  assert.throws(() => parseGithubCalendar(cell("a", "2026-02-31", 0, "No")));
  assert.throws(() => parseGithubCalendar(cell("a", "2026-10-11", 5, "2")));
  assert.throws(() => parseGithubCalendar(cell("a", "2026-10-11", 1, "2") + cell("b", "2026-10-11", 1, "2")));
});
