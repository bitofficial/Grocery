const fs = require("fs");
const path = require("path");

// Session storage
const sessionDir = path.join(__dirname, "../data");
const sessionFile = path.join(sessionDir, "sessions.json");

// Initialize session file
const initializeSessions = () => {
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }
  if (!fs.existsSync(sessionFile)) {
    fs.writeFileSync(sessionFile, JSON.stringify({}, null, 2));
  }
};

// Read sessions
const readSessions = () => {
  try {
    const data = fs.readFileSync(sessionFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

// Write sessions
const writeSessions = (data) => {
  fs.writeFileSync(sessionFile, JSON.stringify(data, null, 2));
};

// Session management object
const sessionDB = {
  // Create or update session
  set: (sessionId, sessionData, expiresIn = 7 * 24 * 60 * 60 * 1000) => {
    const sessions = readSessions();
    const expiresAt = Date.now() + expiresIn;
    sessions[sessionId] = {
      ...sessionData,
      expiresAt,
      createdAt: Date.now(),
    };
    writeSessions(sessions);
    return sessions[sessionId];
  },

  // Get session
  get: (sessionId) => {
    const sessions = readSessions();
    const session = sessions[sessionId];
    
    if (session) {
      // Check if session has expired
      if (session.expiresAt < Date.now()) {
        delete sessions[sessionId];
        writeSessions(sessions);
        return null;
      }
      return session;
    }
    return null;
  },

  // Delete session
  delete: (sessionId) => {
    const sessions = readSessions();
    if (sessions[sessionId]) {
      delete sessions[sessionId];
      writeSessions(sessions);
      return true;
    }
    return false;
  },

  // Update session
  update: (sessionId, sessionData) => {
    const sessions = readSessions();
    if (sessions[sessionId]) {
      sessions[sessionId] = {
        ...sessions[sessionId],
        ...sessionData,
        updatedAt: Date.now(),
      };
      writeSessions(sessions);
      return sessions[sessionId];
    }
    return null;
  },

  // Clear expired sessions
  clearExpired: () => {
    const sessions = readSessions();
    const now = Date.now();
    const activeSessions = {};
    
    Object.keys(sessions).forEach((key) => {
      if (sessions[key].expiresAt > now) {
        activeSessions[key] = sessions[key];
      }
    });
    
    writeSessions(activeSessions);
    return activeSessions;
  },

  // Get all sessions
  getAll: () => {
    return readSessions();
  },
};

module.exports = {
  initializeSessions,
  sessionDB,
};
