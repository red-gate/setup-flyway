import { createRequire as e } from "node:module";
import { dirname as r } from "node:path";
import { fileURLToPath as i } from "node:url";
const n = e(import.meta.url), a = i(import.meta.url), _ = r(a);
async function t() {
}
process.argv[1].endsWith("cleanup.mjs") && t();
