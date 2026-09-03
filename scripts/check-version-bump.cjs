// Fails when a branch does not raise the package.json version above the base
// branch. Every merge publishes a GitHub release tagged with that version, so a
// branch that reuses a version would overwrite a release that already shipped.
//
// Usage:
//   node scripts/check-version-bump.cjs                 compare against BASE_REF (default origin/master)
//   node scripts/check-version-bump.cjs 1.2.0           compare against an explicit base version
//   node scripts/check-version-bump.cjs 1.2.0 1.2.1     compare two explicit versions

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

const parse = (value, label) => {
  const match = SEMVER.exec((value || "").trim());
  if (!match) {
    console.error(
      `Version check failed: ${label} version "${value}" is not major.minor.patch.`
    );
    process.exit(1);
  }
  return match.slice(1, 4).map(Number);
};

const compare = (left, right) => {
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
};

const readLocalVersion = () => {
  const filePath = path.join(__dirname, "..", "package.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8")).version;
};

const readBaseVersion = () => {
  const baseRef = process.env.BASE_REF || "origin/master";
  try {
    const contents = execFileSync("git", ["show", `${baseRef}:package.json`], {
      encoding: "utf8",
    });
    return JSON.parse(contents).version;
  } catch (error) {
    console.error(
      `Version check failed: could not read package.json from "${baseRef}".`
    );
    console.error("Set BASE_REF to the branch you are merging into.");
    process.exit(1);
  }
};

const [baseArg, headArg] = process.argv.slice(2);
const baseVersion = baseArg || readBaseVersion();
const headVersion = headArg || readLocalVersion();

const base = parse(baseVersion, "base");
const head = parse(headVersion, "branch");

if (compare(head, base) <= 0) {
  console.error(
    `Version check failed: package.json is ${headVersion}, but the base branch is already ${baseVersion}.`
  );
  console.error(
    "Raise the version with npm run bump:patch (or bump:minor / bump:major) and commit the change."
  );
  process.exit(1);
}

console.log(`Version check passed: ${baseVersion} -> ${headVersion}.`);
