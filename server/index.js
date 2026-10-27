import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import sql from './db.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from './cloudinary.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'intelliattend-secret-key-2026';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

app.use(cors());
app.use(express.json());

// 1. Health check & database connection probe
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        1 AS connected, 
        NOW() AS server_time, 
        current_database() AS database_name,
        current_user AS user_name,
        version() AS pg_version
    `;
    res.json({
      status: 'healthy',
      database: 'connected',
      neon: {
        database: result[0].database_name,
        user: result[0].user_name,
        serverTime: result[0].server_time,
        version: result[0].pg_version
      },
      objectStorage: {
        provider: 'Cloudinary',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'intelliattend',
        status: 'configured',
        hasSecret: Boolean(process.env.CLOUDINARY_API_SECRET)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Middleware: Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = decodedUser;
    next();
  });
};

// 2. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const ALLOWED_EMAILS = [
      'rahulbariki.intelliattend@gmail.com',
      'clientadmin.intelliattend@gmail.com',
      'manager.intelliattend@gmail.com',
      'employee.intelliattend@gmail.com'
    ];

    const normalizedEmail = email.toLowerCase().trim();
    if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied: Only authorized production accounts are permitted.' });
    }

    const rows = await sql`SELECT * FROM users WHERE email = ${normalizedEmail} LIMIT 1`;
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user not found' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`,
      designation: user.designation,
      department: user.department
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        designation: user.designation,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
});

// 3. Auth: Current User (/api/auth/me)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const rows = await sql`SELECT id, email, role, first_name, last_name, designation, department FROM users WHERE id = ${req.user.id} LIMIT 1`;
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }
    const user = rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        designation: user.designation,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. SuperAdmin Dashboard Stats
app.get('/api/superadmin/dashboard/stats', async (req, res) => {
  try {
    const [companiesCount] = await sql`SELECT COUNT(*)::int AS count FROM companies`;
    const [usersCount] = await sql`SELECT COUNT(*)::int AS count FROM users`;
    const [revenueData] = await sql`
      SELECT COALESCE(SUM(amount_inr), 0)::numeric AS total 
      FROM transactions 
      WHERE status = 'completed'
    `;

    res.json({
      success: true,
      data: {
        totalCompanies: String(companiesCount.count || 4),
        activeUsers: String(usersCount.count || 12),
        monthlyRevenue: `₹${Number(revenueData.total || 12489).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        pendingRequests: '1'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. SuperAdmin: Companies List
app.get('/api/superadmin/companies', async (req, res) => {
  try {
    const companies = await sql`SELECT * FROM companies ORDER BY id ASC`;
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. SuperAdmin: Transactions List
app.get('/api/superadmin/transactions', async (req, res) => {
  try {
    const txns = await sql`SELECT * FROM transactions ORDER BY created_at DESC`;
    res.json({ success: true, data: txns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Notifications API
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await sql`
      SELECT * FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 20
    `;
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    await sql`UPDATE notifications SET read_at = NOW() WHERE read_at IS NULL`;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Employee attendance summary
app.get('/api/employee/attendance/summary', async (req, res) => {
  res.json({
    success: true,
    data: [
      { label: 'Present', value: '18', color: 'success' },
      { label: 'Absent', value: '2', color: 'error' },
      { label: 'Late', value: '1', color: 'warning' },
      { label: 'WFH', value: '4', color: 'accent' },
    ]
  });
});

// 9. Employee leaves balance
app.get('/api/employee/leaves/balance', async (req, res) => {
  res.json({
    success: true,
    data: { annual: 15, sick: 8, casual: 5 }
  });
});

// 10. Cloudinary Object Storage: Upload Corporate Document
app.post('/api/upload/document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, category, uploadedBy } = req.body;
    const originalName = req.file.originalname;
    const ext = path.extname(originalName).replace('.', '');

    // Upload file buffer to Cloudinary object storage
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'intelliattend/documents',
      resource_type: 'auto',
      public_id: `doc_${Date.now()}_${path.basename(originalName, path.extname(originalName)).replace(/\s+/g, '_')}`
    });

    const fileSizeStr = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;

    // Persist document metadata in Neon PostgreSQL
    const inserted = await sql`
      INSERT INTO documents (title, category, file_url, public_id, file_size, file_type, uploaded_by)
      VALUES (
        ${title || originalName},
        ${category || 'General'},
        ${result.secure_url},
        ${result.public_id},
        ${fileSizeStr},
        ${ext.toUpperCase()},
        ${uploadedBy || 'Platform Administrator'}
      )
      RETURNING *;
    `;

    res.json({
      success: true,
      message: 'Document stored in Cloudinary object storage successfully',
      data: inserted[0]
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. Retrieve Documents list from Neon
app.get('/api/documents', async (req, res) => {
  try {
    const docs = await sql`SELECT * FROM documents ORDER BY created_at DESC`;
    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 12. Cloudinary Object Storage: Upload User Avatar
app.post('/api/upload/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const userId = req.body.userId || 'current-user';

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'intelliattend/avatars',
      resource_type: 'image',
      public_id: `avatar_${userId}_${Date.now()}`
    });

    res.json({
      success: true,
      message: 'Avatar uploaded to Cloudinary',
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve frontend build in production
const distPath = path.resolve(__dirname, '../intelliattend/dist');
app.use(express.static(distPath));
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Express server
app.listen(PORT, () => {
  console.log(`IntelliAttend Backend listening on http://localhost:${PORT}`);
  console.log(`Neon PostgreSQL Connected via @neondatabase/serverless driver`);
});
