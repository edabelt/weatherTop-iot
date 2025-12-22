import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import * as fs from "fs";

export function initStore(dataType) {
  const file = `./models/${dataType}.json`;
  const db = new Low(new JSONFile(file));
  if (!fs.existsSync(file)) {
    const initial = { file, [dataType]: [] };
    fs.writeFileSync(file, JSON.stringify(initial));
  }
  return db;
}
