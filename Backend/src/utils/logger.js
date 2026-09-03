const fs = require('fs');
const path = require('path');
const util = require('util');

const LOG_DIR = path.join(__dirname, '../../logs');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function getLogFilePath(dateStr) {
  return path.join(LOG_DIR, `${dateStr}.log`);
}

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function writeLine(level, args) {
  try {
    ensureLogDir();
    const line = `[${new Date().toISOString()}] [${level}] ${util.format(...args)}\n`;
    fs.appendFileSync(getLogFilePath(todayDateStr()), line);
  } catch {
    // Logging must never crash the app.
  }
}

function initFileLogging() {
  const original = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  console.log = (...args) => {
    writeLine('INFO', args);
    original.log(...args);
  };
  console.info = (...args) => {
    writeLine('INFO', args);
    original.info(...args);
  };
  console.warn = (...args) => {
    writeLine('WARN', args);
    original.warn(...args);
  };
  console.error = (...args) => {
    writeLine('ERROR', args);
    original.error(...args);
  };
}

function listLogDates() {
  ensureLogDir();
  return fs
    .readdirSync(LOG_DIR)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.log$/.test(name))
    .map((name) => name.replace('.log', ''))
    .sort()
    .reverse();
}

function readLogFile(dateStr) {
  const filePath = getLogFilePath(dateStr);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

module.exports = {
  initFileLogging,
  listLogDates,
  readLogFile,
  todayDateStr,
};
