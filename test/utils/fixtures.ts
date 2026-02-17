import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Fixture } from "../fixtures";

const getFixturePath = (...fixture: string[]) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.join(...[__dirname, "..", "fixtures", ...fixture]);
};

const loadFixture = (...fixture: Fixture[]) => {
  return fs.readFileSync(getFixturePath(...fixture), "utf-8");
};

export { loadFixture };
