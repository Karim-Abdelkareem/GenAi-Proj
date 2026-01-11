import fs from "fs";
import path from "path";

const IGNORE = ["node_modules", ".git", "dist", "build", ".next"];
const MAX_FILE_SIZE = 50 * 1024; // 50KB

function walk(dir, depth = 0) {
  let output = "";
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (IGNORE.includes(file)) continue;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const indent = "  ".repeat(depth);

    if (stat.isDirectory()) {
      output += `${indent}- 📁 ${file}\n`;
      output += walk(fullPath, depth + 1);
    } else {
      output += `${indent}- 📄 ${file}\n`;

      if (stat.size <= MAX_FILE_SIZE) {
        const content = fs.readFileSync(fullPath, "utf8");
        output += `${indent}  ---\n`;
        output += content
          .split("\n")
          .map((l) => indent + "  " + l)
          .join("\n");
        output += `\n${indent}  ---\n`;
      }
    }
  }

  return output;
}

const result = walk(process.cwd());
fs.writeFileSync("PROJECT_DUMP.txt", result);

console.log("✅ PROJECT_DUMP.txt generated");
