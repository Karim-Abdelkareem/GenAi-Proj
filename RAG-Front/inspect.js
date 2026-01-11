import fs from "fs";
import path from "path";

const IGNORE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
];

const IGNORE_FILES = [".env", ".env.local", ".env.production"];

const ALLOWED_EXT = [".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss"];
const MAX_FILE_SIZE = 60 * 1024; // 60KB

function walk(dir, depth = 0) {
  let output = "";
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (IGNORE_FILES.includes(file)) continue;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const indent = "  ".repeat(depth);

    if (stat.isDirectory()) {
      if (IGNORE_DIRS.includes(file)) continue;
      output += `${indent}- 📁 ${file}\n`;
      output += walk(fullPath, depth + 1);
    } else {
      const ext = path.extname(file);
      if (!ALLOWED_EXT.includes(ext)) continue;

      output += `${indent}- 📄 ${file}\n`;

      if (stat.size <= MAX_FILE_SIZE) {
        let content = fs.readFileSync(fullPath, "utf8");

        // 🔒 basic secret masking
        content = content.replace(
          /(apiKey|token|secret|password)\s*[:=]\s*["'][^"']+["']/gi,
          '$1: "***"'
        );

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
fs.writeFileSync("REACT_PROJECT_DUMP.txt", result);

console.log("✅ REACT_PROJECT_DUMP.txt generated");
