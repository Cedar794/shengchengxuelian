const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/database.db');

console.log('🔧 Initializing database...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {
  console.log('📝 Creating tables...');

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT DEFAULT 'default-avatar.png',
      school TEXT NOT NULL,
      major TEXT,
      grade TEXT,
      tags TEXT,
      role TEXT DEFAULT 'student',
      bio TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User behavior tracking table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_behaviors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      page TEXT,
      action TEXT,
      target_id INTEGER,
      target_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Activities table
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'general',
      location TEXT,
      event_time DATETIME,
      registration_deadline DATETIME,
      max_participants INTEGER,
      current_participants INTEGER DEFAULT 0,
      status TEXT DEFAULT 'open',
      publisher_id INTEGER NOT NULL,
      target_schools TEXT,
      target_tags TEXT,
      cover_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (publisher_id) REFERENCES users(id)
    )
  `);

  // Activity registrations
  db.run(`
    CREATE TABLE IF NOT EXISTS activity_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'registered',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (activity_id) REFERENCES activities(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(activity_id, user_id)
    )
  `);

  // Collaborations table
  db.run(`
    CREATE TABLE IF NOT EXISTS collaborations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      priority TEXT DEFAULT 'medium',
      creator_id INTEGER NOT NULL,
      department TEXT,
      total_tasks INTEGER DEFAULT 0,
      completed_tasks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
    )
  `);

  // Collaboration tasks
  db.run(`
    CREATE TABLE IF NOT EXISTS collaboration_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collaboration_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assignee_id INTEGER,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date DATETIME,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collaboration_id) REFERENCES collaborations(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id)
    )
  `);

  // Venues table
  db.run(`
    CREATE TABLE IF NOT EXISTS venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT,
      capacity INTEGER,
      facilities TEXT,
      description TEXT,
      available_time_start TEXT,
      available_time_end TEXT,
      operating_days TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Venue reservations
  db.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venue_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      reservation_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      purpose TEXT,
      status TEXT DEFAULT 'confirmed',
      participants INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (venue_id) REFERENCES venues(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Materials table
  db.run(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT,
      file_url TEXT,
      file_size INTEGER,
      download_count INTEGER DEFAULT 0,
      uploader_id INTEGER NOT NULL,
      tags TEXT,
      category TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploader_id) REFERENCES users(id)
    )
  `);

  // Tips table
  db.run(`
    CREATE TABLE IF NOT EXISTS tips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      editor_id INTEGER NOT NULL,
      status TEXT DEFAULT 'published',
      version INTEGER DEFAULT 1,
      last_edit_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (editor_id) REFERENCES users(id),
      FOREIGN KEY (last_edit_id) REFERENCES users(id)
    )
  `);

  // Tip edit history
  db.run(`
    CREATE TABLE IF NOT EXISTS tip_edits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tip_id INTEGER NOT NULL,
      editor_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      version INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tip_id) REFERENCES tips(id),
      FOREIGN KEY (editor_id) REFERENCES users(id)
    )
  `);

  // Listings table
  db.run(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      price REAL,
      category TEXT,
      condition TEXT,
      images TEXT,
      seller_id INTEGER NOT NULL,
      school TEXT,
      location TEXT,
      status TEXT DEFAULT 'active',
      view_count INTEGER DEFAULT 0,
      favorite_count INTEGER DEFAULT 0,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id)
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      buyer_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      delivery_info TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES listings(id),
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (seller_id) REFERENCES users(id)
    )
  `);

  // Groups table
  db.run(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      tags TEXT,
      creator_id INTEGER NOT NULL,
      avatar TEXT,
      member_count INTEGER DEFAULT 1,
      max_members INTEGER,
      type TEXT DEFAULT 'public',
      school TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
    )
  `);

  // Group memberships
  db.run(`
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      status TEXT DEFAULT 'active',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(group_id, user_id)
    )
  `);

  // Group posts
  db.run(`
    CREATE TABLE IF NOT EXISTS group_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      images TEXT,
      like_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Projects table
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      required_skills TEXT,
      required_roles TEXT,
      creator_id INTEGER NOT NULL,
      status TEXT DEFAULT 'recruiting',
      max_members INTEGER,
      current_members INTEGER DEFAULT 1,
      deadline DATETIME,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
    )
  `);

  // Project applications
  db.run(`
    CREATE TABLE IF NOT EXISTS project_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(project_id, user_id)
    )
  `);

  // Project members
  db.run(`
    CREATE TABLE IF NOT EXISTS project_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(project_id, user_id)
    )
  `);

  // Messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_anonymous INTEGER DEFAULT 1,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id)
    )
  `);

  // Chat sessions
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER,
      user1_nickname TEXT,
      user2_nickname TEXT,
      tags TEXT,
      status TEXT DEFAULT 'active',
      contact_exchanged INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users(id),
      FOREIGN KEY (user2_id) REFERENCES users(id)
    )
  `);

  // AI chat sessions
  db.run(`
    CREATE TABLE IF NOT EXISTS ai_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      context TEXT,
      message_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // AI messages
  db.run(`
    CREATE TABLE IF NOT EXISTS ai_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES ai_sessions(id)
    )
  `);

  // Notifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      link TEXT,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Chats table (for AI chat conversations)
  db.run(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      model TEXT DEFAULT 'glm-4-flash',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Chat messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    )
  `);

  console.log('📝 Inserting sample data...');

  // Create admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run('INSERT OR IGNORE INTO users (student_id, password, nickname, school, role, major, grade) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    'admin001', hashedPassword, '管理员', '上海海关学院', 'admin', '计算机科学', '研一'
  ]);

  // Create sample venues
  const venues = [
    { name: '体育馆主馆', type: 'sports', location: '东区体育馆', capacity: 500, facilities: '篮球场,羽���球场,排球场' },
    { name: '多媒体报告厅', type: 'meeting', location: '行政楼3楼', capacity: 100, facilities: '投影,话筒,录播设备' },
    { name: '学生活动中心', type: 'activity', location: '学生中心2楼', capacity: 200, facilities: '音响,舞台,灯光' },
    { name: '研讨室A', type: 'study', location: '图书馆4楼', capacity: 10, facilities: '白板,投影,视频会议' },
  ];

  const venueStmt = db.prepare('INSERT INTO venues (name, type, location, capacity, facilities, available_time_start, available_time_end, operating_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  venues.forEach(venue => {
    venueStmt.run(venue.name, venue.type, venue.location, venue.capacity, venue.facilities, '08:00', '22:00', '1,2,3,4,5,6,7');
  });
  venueStmt.finalize();

  // Create sample activities
  db.run(`INSERT INTO activities (title, description, type, location, event_time, status, publisher_id, target_schools)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
    '第三十六届申城高校联合运动会',
    '本届运动会由上海海关学院主办，共设12个大项，覆盖30余所高校。',
    'sports',
    '上海海关学院体育场',
    '2026-04-25 09:00:00',
    'open',
    1,
    'all'
  ]);

  console.log('✅ Database initialized successfully!');
  console.log(`📁 Database location: ${dbPath}`);
  console.log('👤 Admin account: student_id=admin001, password=admin123');

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
  });
});
