import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = join(process.cwd(), "schemas");
const files = readdirSync(root).filter((name) => name.endsWith(".json")).sort();
const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);

for (const file of files) {
  const path = join(root, file);
  const schema = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  if (typeof schema.$id !== "string" || typeof schema.$schema !== "string") {
    throw new Error(`Schema ${file} must define $id and $schema`);
  }
  ajv.addSchema(schema, schema.$id);
}

console.log(`Validated ${files.length} SportsCam JSON schemas.`);
