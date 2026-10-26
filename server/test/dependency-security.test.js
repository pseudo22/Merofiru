import { describe, it } from "mocha";
import { expect } from "chai";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// GHSA-27r3-jxmh-p828 is fixed in body-parser >= 2.4.0.
// The server depends on body-parser directly, so the resolved version must be
// the patched line, not the vulnerable 1.20.x.
describe("body-parser dependency security fix", () => {
  it("resolves the patched body-parser version (>= 2.4.0)", () => {
    const { version } = require(require.resolve("body-parser/package.json"));
    const [major, minor] = version.split(".").map(Number);
    expect(major).to.be.at.least(2);
    if (major === 2) {
      expect(minor).to.be.at.least(4);
    }
  });
});
