const { listLogDates, readLogFile, todayDateStr } = require('../utils/logger');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function hasValidToken(req) {
  const configuredToken = process.env.LOG_ACCESS_TOKEN;
  if (!configuredToken) {
    return false;
  }

  const providedToken = req.query.token || req.headers['x-log-token'];
  return providedToken === configuredToken;
}

function requireAccess(req, res) {
  if (!process.env.LOG_ACCESS_TOKEN) {
    res.status(403).json({ error: 'Log access is not configured on this server' });
    return false;
  }

  if (!hasValidToken(req)) {
    res.status(401).json({ error: 'Missing or invalid log access token' });
    return false;
  }

  return true;
}

function getLogDates(req, res) {
  if (!requireAccess(req, res)) {
    return;
  }

  res.json({ today: todayDateStr(), dates: listLogDates() });
}

function getLogByDate(req, res) {
  if (!requireAccess(req, res)) {
    return;
  }

  const { date } = req.params;
  if (!DATE_PATTERN.test(date)) {
    return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
  }

  const content = readLogFile(date);
  if (content === null) {
    return res.status(404).json({ error: `No log file for ${date}` });
  }

  res.type('text/plain').send(content);
}

module.exports = {
  getLogDates,
  getLogByDate,
};
