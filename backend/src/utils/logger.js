import fs from "fs";
import path from "path";

// logs folder path
const logDir = path.join(process.cwd(), "src", "logs");

// ensure folder exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// log files
const appLog = fs.createWriteStream(
  path.join(logDir, "app.log"),
  { flags: "a" }
);

const errorLog = fs.createWriteStream(
  path.join(logDir, "error.log"),
  { flags: "a" }
);

// init logger
export const initLogger = () => {
  console.log = (...args) => {
    appLog.write(
      `${new Date().toISOString()} INFO ${args.join(" ")}\n`
    );
  };

  console.error = (...args) => {
    errorLog.write(
      `${new Date().toISOString()} ERROR ${args.join(" ")}\n`
    );
  };
};
