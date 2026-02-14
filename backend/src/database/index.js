const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/database.db');

// Create a promise-based database wrapper
class Database {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
    this.db.run('PRAGMA foreign_keys = ON');

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_school ON users(school)',
      'CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status)',
      'CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type)',
      'CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type)',
      'CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)',
      'CREATE INDEX IF NOT EXISTS idx_listings_school ON listings(school)',
      'CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type)',
      'CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_behaviors_user ON user_behaviors(user_id)',
    ];

    indexes.forEach(index => {
      this.db.run(index, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Index creation error:', err);
        }
      });
    });
  }

  prepare(sql) {
    const stmt = this.db.prepare(sql);
    const self = this;

    return {
      run(...params) {
        return new Promise((resolve, reject) => {
          stmt.run(...params, function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({
                changes: this.changes,
                lastInsertRowid: this.lastID
              });
            }
          });
        });
      },

      get(...params) {
        return new Promise((resolve, reject) => {
          stmt.get(...params, (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        });
      },

      all(...params) {
        return new Promise((resolve, reject) => {
          stmt.all(...params, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        });
      }
    };
  }

  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

const dbWrapper = new Database(dbPath);

// Wrap all database methods to handle both sync and async usage
const handler = {
  get(target, prop) {
    if (prop === 'prepare') {
      return target.prepare.bind(target);
    }
    if (prop === 'exec') {
      return target.exec.bind(target);
    }
    return target[prop];
  }
};

module.exports = new Proxy(dbWrapper, handler);
