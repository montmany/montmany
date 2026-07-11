const fs = require("fs");
const path = require("path");

const README_PATH = path.join(__dirname, "..", "README.md");
const PROJECTS_PATH = path.join(__dirname, "..", "data", "projects.json");
const TOTAL_APPS = 24;
const TOTAL_MONTHS = 12;
const CHALLENGE_START = new Date("2026-07-13T00:00:00Z");
const BAR_WIDTH = TOTAL_APPS;
const START_MARKER = "<!-- PROGRESS:START -->";
const END_MARKER = "<!-- PROGRESS:END -->";

function countLiveApps() {
  const projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, "utf8"));
  return projects.filter((project) => project.status === "live").length;
}

function buildBar(completed) {
  const filled = Math.min(completed, BAR_WIDTH);
  const empty = BAR_WIDTH - filled;
  const percent = Math.round((completed / TOTAL_APPS) * 100);
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;
}

function currentMonth(today) {
  const msPerMonth = 1000 * 60 * 60 * 24 * 30.4368;
  const elapsed = Math.floor((today - CHALLENGE_START) / msPerMonth) + 1;
  return Math.min(Math.max(elapsed, 1), TOTAL_MONTHS);
}

function nextLaunchDate(completed, today) {
  if (completed >= TOTAL_APPS) return null;
  const cadenceDays = (TOTAL_MONTHS * 30.4368) / TOTAL_APPS;
  const target = new Date(CHALLENGE_START.getTime() + completed * cadenceDays * 86400000);
  const date = target > today ? target : today;
  return date.toISOString().slice(0, 10);
}

function buildBlock(completed) {
  const today = new Date();
  const bar = buildBar(completed);
  const month = currentMonth(today);
  const nextLaunch = nextLaunchDate(completed, today);

  const lines = [
    `**Current Progress: \`${completed} / ${TOTAL_APPS}\` Apps Built**`,
    "",
    "```",
    bar,
    "```",
    "",
    completed >= TOTAL_APPS
      ? "`🎉 Challenge Complete`"
      : `\`Month ${month} of ${TOTAL_MONTHS}\` · \`Next Launch: ${nextLaunch}\``,
  ];
  return lines.join("\n");
}

function main() {
  const readme = fs.readFileSync(README_PATH, "utf8");
  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.error("Progress markers not found in README.md");
    process.exit(1);
  }

  const completed = countLiveApps();
  const block = buildBlock(completed);

  const before = readme.slice(0, startIdx + START_MARKER.length);
  const after = readme.slice(endIdx);
  const updated = `${before}\n${block}\n${after}`;

  if (updated !== readme) {
    fs.writeFileSync(README_PATH, updated);
    console.log(`Updated progress tracker: ${completed}/${TOTAL_APPS} apps live.`);
  } else {
    console.log("Progress tracker already up to date.");
  }
}

main();
