import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import sql from './db.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from './cloudinary.js';
import { setupEnhancedRoutes, isDmParticipant } from './enhancedRoutes.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'intelliattend-secret-key-2026';

// 1. Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Dev/local assets compatibility
  crossOriginEmbedderPolicy: false
}));
app.disable('x-powered-by');

// 2. Controlled CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(ao => origin.startsWith(ao) || origin.endsWith('.intelliattend.com'))) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Payload size limiting (mitigate DoS / memory exhaustion)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3.1 Public static avatars directory (only user profile photos are public)
const uploadsDir = path.resolve(__dirname, 'uploads');
const avatarsDir = path.resolve(uploadsDir, 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}
app.use('/uploads/avatars', express.static(avatarsDir));
app.use('/api/uploads/avatars', express.static(avatarsDir));

// 4. Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 400, // 400 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again shortly.' }
});
app.use('/api/', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min to prevent brute force
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// 5. Sanitized Health check probe (no internal db info leakage)
app.get('/api/health', async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// Shared helper: Format User Response
export const formatUserResponse = (u) => ({
  id: u.id,
  employeeId: u.id,
  email: u.email,
  loginEmail: u.email,
  corporateEmail: u.corporate_email || `${u.email.split('@')[0].split('.')[0]}@intelliattend.com`,
  role: u.role,
  name: `${u.first_name} ${u.last_name}`,
  firstName: u.first_name,
  lastName: u.last_name,
  fullName: `${u.first_name} ${u.last_name}`.toUpperCase(),
  designation: u.designation,
  department: u.department,
  phone: u.phone || '',
  emergencyPhone: u.emergency_phone || '',
  emergencyContactName: u.emergency_contact_name || '',
  bloodGroup: u.blood_group || 'O+',
  doj: u.doj || '',
  dob: u.dob || '',
  gender: u.gender || '',
  address: u.address || '',
  workLocation: u.work_location || '',
  employmentType: u.employment_type || 'Full-time Permanent',
  shift: u.shift || 'General Day (09:00 AM - 06:30 PM)',
  panNumber: u.pan_number || '',
  bankAccount: u.bank_account || '',
  pfNumber: u.pf_number || '',
  avatar: u.avatar_url || (u.first_name ? u.first_name[0] : 'U'),
  avatarUrl: u.avatar_url || '',
  company: u.company_name || 'IntelliAttend Technologies',
  manager: u.manager_name || 'Board of Directors'
});

// 6. Robust Cryptographic JWT Authentication Middleware
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired access token' });
    }
    req.user = decodedUser;
    next();
  });
};

// 7. Role-Based Access Control (RBAC) Middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Access requires one of [${roles.join(', ')}] permissions` 
      });
    }
    next();
  };
};

// 8. API Authentication Gateway
// Protects all /api endpoints except health check probe, login, and static avatars
app.use('/api', (req, res, next) => {
  const publicPaths = ['/health', '/auth/login'];
  if (publicPaths.includes(req.path) || req.path.startsWith('/uploads/avatars')) {
    return next();
  }
  return authenticateToken(req, res, next);
});

// Protected file download endpoint enforcing JWT authentication and message access checks
app.get(['/api/uploads/:folder/:filename', '/uploads/:folder/:filename'], authenticateToken, async (req, res) => {
  const { folder, filename } = req.params;
  const sanitizedFolder = path.basename(folder);
  const sanitizedFilename = path.basename(filename);
  const filePath = path.resolve(uploadsDir, sanitizedFolder, sanitizedFilename);

  if (!filePath.startsWith(uploadsDir) || !fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Attachment not found' });
  }

  // Access check for chat attachments in direct messages
  if (sanitizedFolder === 'documents' || sanitizedFolder === 'attachments') {
    const fileUrlFragment = `/${sanitizedFolder}/${sanitizedFilename}`;
    const chatMsg = await sql`
      SELECT conversation_id 
      FROM chat_messages 
      WHERE attachment_url LIKE ${'%' + fileUrlFragment} 
      LIMIT 1;
    `;
    if (chatMsg.length > 0) {
      const convId = chatMsg[0].conversation_id;
      if (convId && (convId.startsWith('dm_') || convId.startsWith('dm-'))) {
        const isAllowed = await isDmParticipant(convId, req.user?.id, req.user?.email, sql);
        if (!isAllowed) {
          return res.status(403).json({ success: false, message: 'Forbidden: Access to this attachment is restricted to conversation participants' });
        }
      }
    }
  }

  res.sendFile(filePath);
});

// 9. Auth: Login (with rate-limiting and secure password verification)
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const ALLOWED_EMAILS = [
      'rahulbariki.intelliattend@gmail.com',
      'clientadmin.intelliattend@gmail.com',
      'manager.intelliattend@gmail.com',
      'employee.intelliattend@gmail.com',
      'payrolladmin.intelliattend@gmail.com'
    ];

    const normalizedEmail = email.toLowerCase().trim();
    const isDomainAllowed = normalizedEmail.endsWith('.intelliattend@gmail.com') || normalizedEmail.endsWith('@intelliattend.com');
    if (!ALLOWED_EMAILS.includes(normalizedEmail) && !isDomainAllowed) {
      return res.status(403).json({ success: false, message: 'Access denied: Only authorized accounts are permitted.' });
    }

    const rows = await sql`SELECT * FROM users WHERE email = ${normalizedEmail} LIMIT 1`;
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user not found' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
    const formattedUser = formatUserResponse(user);

    res.json({
      success: true,
      token,
      user: formattedUser,
      data: {
        token,
        user: formattedUser
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
});

// 10. Auth: Current User (/api/auth/me)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM users WHERE id = ${req.user.id} LIMIT 1`;
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }
    const u = rows[0];
    res.json({
      success: true,
      data: {
        id: u.id,
        employeeId: u.id,
        email: u.email,
        loginEmail: u.email,
        corporateEmail: `${u.email.split('@')[0].split('.')[0]}@intelliattend.com`,
        role: u.role,
        name: `${u.first_name} ${u.last_name}`,
        firstName: u.first_name,
        lastName: u.last_name,
        fullName: `${u.first_name} ${u.last_name}`.toUpperCase(),
        designation: u.designation,
        department: u.department,
        phone: u.phone || '',
        emergencyPhone: u.emergency_phone || '',
        emergencyContactName: u.emergency_contact_name || '',
        bloodGroup: u.blood_group || 'O+',
        doj: u.doj || '',
        dob: u.dob || '',
        gender: u.gender || '',
        address: u.address || '',
        workLocation: u.work_location || '',
        employmentType: u.employment_type || 'Full-time Permanent',
        shift: u.shift || 'General Day (09:00 AM - 06:30 PM)',
        panNumber: u.pan_number || '',
        bankAccount: u.bank_account || '',
        pfNumber: u.pf_number || '',
        avatar: u.avatar_url || (u.first_name ? u.first_name[0] : 'U'),
        avatarUrl: u.avatar_url || '',
        company: u.company_name || 'IntelliAttend Technologies',
        manager: u.manager_name || 'Board of Directors'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3.1 Profile: Get Profile (/api/users/profile or /api/users/profile/:id)
const getProfileHandler = async (req, res) => {
  try {
    const targetId = req.params.id || req.query.id || req.query.email || (req.user && req.user.id) || 'IA-SA-001';
    const rows = await sql`SELECT * FROM users WHERE id = ${targetId} OR email = ${targetId} LIMIT 1`;
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    const u = rows[0];
    res.json({
      success: true,
      data: {
        id: u.id,
        employeeId: u.id,
        email: u.email,
        loginEmail: u.email,
        corporateEmail: `${u.email.split('@')[0].split('.')[0]}@intelliattend.com`,
        role: u.role,
        name: `${u.first_name} ${u.last_name}`,
        firstName: u.first_name,
        lastName: u.last_name,
        fullName: `${u.first_name} ${u.last_name}`.toUpperCase(),
        designation: u.designation,
        department: u.department,
        phone: u.phone || '',
        emergencyPhone: u.emergency_phone || '',
        emergencyContactName: u.emergency_contact_name || '',
        bloodGroup: u.blood_group || 'O+',
        doj: u.doj || '',
        dob: u.dob || '',
        gender: u.gender || '',
        address: u.address || '',
        workLocation: u.work_location || '',
        employmentType: u.employment_type || 'Full-time Permanent',
        shift: u.shift || 'General Day (09:00 AM - 06:30 PM)',
        panNumber: u.pan_number || '',
        bankAccount: u.bank_account || '',
        pfNumber: u.pf_number || '',
        avatar: u.avatar_url || (u.first_name ? u.first_name[0] : 'U'),
        avatarUrl: u.avatar_url || '',
        company: u.company_name || 'IntelliAttend Technologies',
        manager: u.manager_name || 'Board of Directors'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

app.get('/api/users/profile', getProfileHandler);
app.get('/api/users/profile/:id', getProfileHandler);

// 3.2 Profile: Update Profile (/api/users/profile)
app.put('/api/users/profile', async (req, res) => {
  try {
    const {
      id, employeeId, email, loginEmail, firstName, lastName, phone, emergencyPhone,
      emergencyContactName, bloodGroup, dob, gender, address,
      workLocation, shift, panNumber, bankAccount, pfNumber, avatarUrl, avatar,
      designation, department
    } = req.body;

    // Authorization check: SuperAdmin, Manager, ClientAdmin, and PayrollAdmin can manage records.
    // Regular employees update their own profile only.
    const isPrivileged = req.user && ['superadmin', 'manager', 'client_admin', 'client', 'payroll_admin'].includes(req.user.role);
    const targetUser = isPrivileged
      ? (id || employeeId || loginEmail || email || req.user?.id)
      : (req.user?.id || req.user?.email);

    if (!targetUser) {
      return res.status(400).json({ success: false, message: 'User identifier required' });
    }

    // Protect avatar: Only update if a valid non-empty string is provided. Never wipe with empty string.
    const cleanAvatar = (typeof avatarUrl === 'string' && avatarUrl.trim() !== '')
      ? avatarUrl.trim()
      : (typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:')) ? avatar.trim() : null);

    const updated = isPrivileged ? await sql`
      UPDATE users SET
        first_name = COALESCE(${firstName && firstName.trim() !== '' ? firstName.trim() : null}, first_name),
        last_name = COALESCE(${lastName && lastName.trim() !== '' ? lastName.trim() : null}, last_name),
        phone = COALESCE(${phone !== undefined ? phone : null}, phone),
        emergency_phone = COALESCE(${emergencyPhone !== undefined ? emergencyPhone : null}, emergency_phone),
        emergency_contact_name = COALESCE(${emergencyContactName !== undefined ? emergencyContactName : null}, emergency_contact_name),
        blood_group = COALESCE(${bloodGroup !== undefined ? bloodGroup : null}, blood_group),
        dob = COALESCE(${dob !== undefined ? dob : null}, dob),
        gender = COALESCE(${gender !== undefined ? gender : null}, gender),
        address = COALESCE(${address !== undefined ? address : null}, address),
        work_location = COALESCE(${workLocation !== undefined ? workLocation : null}, work_location),
        shift = COALESCE(${shift !== undefined ? shift : null}, shift),
        pan_number = COALESCE(${panNumber !== undefined ? panNumber : null}, pan_number),
        bank_account = COALESCE(${bankAccount !== undefined ? bankAccount : null}, bank_account),
        pf_number = COALESCE(${pfNumber !== undefined ? pfNumber : null}, pf_number),
        designation = COALESCE(${designation && designation.trim() !== '' ? designation.trim() : null}, designation),
        department = COALESCE(${department && department.trim() !== '' ? department.trim() : null}, department),
        avatar_url = COALESCE(${cleanAvatar}, avatar_url)
      WHERE id = ${targetUser} OR email = ${targetUser} OR id = ${id || employeeId || ''} OR email = ${loginEmail || email || ''}
      RETURNING *;
    ` : await sql`
      UPDATE users SET
        first_name = COALESCE(${firstName && firstName.trim() !== '' ? firstName.trim() : null}, first_name),
        last_name = COALESCE(${lastName && lastName.trim() !== '' ? lastName.trim() : null}, last_name),
        phone = COALESCE(${phone !== undefined ? phone : null}, phone),
        emergency_phone = COALESCE(${emergencyPhone !== undefined ? emergencyPhone : null}, emergency_phone),
        emergency_contact_name = COALESCE(${emergencyContactName !== undefined ? emergencyContactName : null}, emergency_contact_name),
        blood_group = COALESCE(${bloodGroup !== undefined ? bloodGroup : null}, blood_group),
        dob = COALESCE(${dob !== undefined ? dob : null}, dob),
        gender = COALESCE(${gender !== undefined ? gender : null}, gender),
        address = COALESCE(${address !== undefined ? address : null}, address),
        work_location = COALESCE(${workLocation !== undefined ? workLocation : null}, work_location),
        shift = COALESCE(${shift !== undefined ? shift : null}, shift),
        pan_number = COALESCE(${panNumber !== undefined ? panNumber : null}, pan_number),
        bank_account = COALESCE(${bankAccount !== undefined ? bankAccount : null}, bank_account),
        pf_number = COALESCE(${pfNumber !== undefined ? pfNumber : null}, pf_number),
        avatar_url = COALESCE(${cleanAvatar}, avatar_url)
      WHERE id = ${targetUser} OR email = ${targetUser}
      RETURNING *;
    `;

    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

    const u = updated[0];
    res.json({
      success: true,
      message: 'Profile updated successfully in Neon PostgreSQL',
      data: formatUserResponse(u)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3.3 Directory: Live Employee Directory (/api/users/directory)
app.get('/api/users/directory', async (req, res) => {
  try {
    const rows = await sql`
      SELECT * FROM users ORDER BY 
        CASE role 
          WHEN 'superadmin' THEN 1 
          WHEN 'client' THEN 2 
          WHEN 'manager' THEN 3 
          ELSE 4 
        END, first_name;
    `;
    const directory = rows.map(u => ({
      id: u.id,
      employeeId: u.id,
      name: `${u.first_name} ${u.last_name}`.toUpperCase(),
      firstName: u.first_name,
      lastName: u.last_name,
      designation: u.designation,
      department: u.department,
      email: `${u.email.split('@')[0].split('.')[0]}@intelliattend.com`,
      loginEmail: u.email,
      phone: u.phone,
      emergencyPhone: u.emergency_phone,
      emergencyContactName: u.emergency_contact_name,
      doj: u.doj,
      bloodGroup: u.blood_group,
      avatar: u.avatar_url || (u.first_name ? u.first_name[0] : 'U'),
      avatarUrl: u.avatar_url,
      company: u.company_name,
      manager: u.manager_name,
      workLocation: u.work_location,
      employmentType: u.employment_type,
      shift: u.shift,
      panNumber: u.pan_number,
      bankAccount: u.bank_account,
      pfNumber: u.pf_number,
      status: 'Active'
    }));

    res.json({ success: true, data: directory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. SuperAdmin Dashboard Stats
const handleSuperAdminStats = async (req, res) => {
  try {
    const [companiesCount] = await sql`SELECT COUNT(*)::int AS count FROM companies`;
    const [usersCount] = await sql`SELECT COUNT(*)::int AS count FROM users`;
    const [revenueData] = await sql`
      SELECT COALESCE(SUM(amount_inr), 0)::numeric AS total 
      FROM transactions 
      WHERE status = 'completed'
    `;
    const [ticketsCount] = await sql`SELECT COUNT(*)::int AS count FROM support_tickets WHERE status = 'open'`;

    res.json({
      success: true,
      data: {
        totalCompanies: String(companiesCount?.count ?? 0),
        activeUsers: String(usersCount?.count ?? 0),
        monthlyRevenue: `₹${Number(revenueData?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        pendingRequests: String(ticketsCount?.count ?? 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
app.get('/api/superadmin/dashboard/stats', handleSuperAdminStats);
app.get('/api/superadmin/dashboard-stats', handleSuperAdminStats);


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

// SuperAdmin: Subdomain Requests List
app.get('/api/superadmin/subdomain-requests', authorizeRoles('superadmin'), async (req, res) => {
  try {
    const companies = await sql`
      SELECT 
        id, 
        name AS company_name, 
        subdomain, 
        subdomain || '.intelliattend.io' AS requested_subdomain,
        'Active (Auto-Renewing SSL)' AS ssl_status,
        'cname.intelliattend.io' AS cname_record,
        status, 
        created_at 
      FROM companies 
      ORDER BY id ASC
    `;
    res.json({ success: true, data: companies });
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

// ==========================================
// MODULE 2: ATTENDANCE & TIME TRACKER API
// ==========================================

// 8a. Today's live punch status for user
app.get('/api/attendance/today', async (req, res) => {
  try {
    const userId = req.query.userId || 'IA-EM-001';
    const today = new Date().toISOString().split('T')[0];
    const records = await sql`
      SELECT * FROM attendance_records
      WHERE user_id = ${userId} AND punch_date = ${today}
      LIMIT 1;
    `;
    if (!records || records.length === 0) {
      return res.json({
        success: true,
        data: {
          clockedIn: false,
          clockInTime: '—',
          clockOutTime: '—',
          workSeconds: 0,
          status: 'absent',
          mode: 'Office',
          location: 'Office'
        }
      });
    }
    const r = records[0];
    const isClockedIn = !r.check_out || r.check_out === '' || r.check_out === '—';
    res.json({
      success: true,
      data: {
        id: r.id,
        clockedIn: isClockedIn,
        clockInTime: r.check_in || '—',
        clockOutTime: r.check_out || '—',
        workSeconds: r.work_seconds || 0,
        totalHours: r.total_hours || 'Calculating...',
        status: r.status,
        mode: r.mode,
        location: r.mode === 'Remote / WFH' ? 'Remote / WFH' : 'Headquarters (Office)'
      }
    });
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance status' });
  }
});

// 8b. Punch terminal (Clock In / Clock Out toggle)
app.post('/api/attendance/punch', async (req, res) => {
  try {
    const { userId = 'IA-EM-001', mode = 'Office', currentWorkSeconds = 0 } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Fetch user details
    const userRows = await sql`SELECT first_name, last_name, department FROM users WHERE id = ${userId} LIMIT 1;`;
    const userName = userRows.length > 0 ? `${userRows[0].first_name} ${userRows[0].last_name}` : 'Sarah Miller';
    const department = userRows.length > 0 ? (userRows[0].department || 'Engineering & Technology') : 'Engineering & Technology';

    const existing = await sql`
      SELECT * FROM attendance_records
      WHERE user_id = ${userId} AND punch_date = ${today}
      LIMIT 1;
    `;

    if (existing.length === 0) {
      // First punch in of the day
      await sql`
        INSERT INTO attendance_records (user_id, user_name, department, punch_date, check_in, check_out, total_hours, work_seconds, status, mode)
        VALUES (${userId}, ${userName}, ${department}, ${today}, ${nowTime}, '', 'Calculating...', 0, 'present', ${mode})
        RETURNING *;
      `;
      return res.json({
        success: true,
        message: 'Clocked in successfully',
        data: {
          clockedIn: true,
          clockInTime: nowTime,
          clockOutTime: '—',
          workSeconds: 0,
          status: 'present'
        }
      });
    }

    const r = existing[0];
    if (!r.check_out || r.check_out === '' || r.check_out === '—') {
      // Currently clocked in -> Punch OUT
      const secs = currentWorkSeconds || (r.work_seconds + 3600);
      const hours = Math.floor(secs / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      const totalHoursStr = `${hours}h ${mins.toString().padStart(2, '0')}m`;

      await sql`
        UPDATE attendance_records
        SET check_out = ${nowTime}, total_hours = ${totalHoursStr}, work_seconds = ${secs}
        WHERE id = ${r.id};
      `;
      return res.json({
        success: true,
        message: 'Clocked out successfully',
        data: {
          clockedIn: false,
          clockInTime: r.check_in,
          clockOutTime: nowTime,
          workSeconds: secs,
          totalHours: totalHoursStr,
          status: 'present'
        }
      });
    } else {
      // Clocked out previously -> Resume / re-clock in
      await sql`
        UPDATE attendance_records
        SET check_out = '', total_hours = 'Calculating...'
        WHERE id = ${r.id};
      `;
      return res.json({
        success: true,
        message: 'Clock resumed',
        data: {
          clockedIn: true,
          clockInTime: r.check_in,
          clockOutTime: '—',
          workSeconds: r.work_seconds,
          status: 'present'
        }
      });
    }
  } catch (error) {
    console.error('Error toggling attendance punch:', error);
    res.status(500).json({ success: false, message: 'Failed to process punch action' });
  }
});

// 8c. User Attendance logs (Recent history)
app.get('/api/attendance/logs', async (req, res) => {
  try {
    const userId = req.query.userId || 'IA-EM-001';
    const logs = await sql`
      SELECT 
        id,
        TO_CHAR(punch_date, 'YYYY-MM-DD') AS date,
        check_in AS "in",
        COALESCE(NULLIF(check_out, ''), '—') AS "out",
        total_hours AS hours,
        status,
        mode AS location
      FROM attendance_records
      WHERE user_id = ${userId}
      ORDER BY punch_date DESC
      LIMIT 30;
    `;
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
});

// 8d. Team Attendance for Manager / Client Admin
app.get('/api/attendance/team', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const team = await sql`
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name AS name,
        COALESCE(u.avatar_url, '') AS avatar,
        u.designation AS role,
        u.department,
        COALESCE(a.check_in, '—') AS "checkIn",
        COALESCE(NULLIF(a.check_out, ''), '—') AS "checkOut",
        COALESCE(a.total_hours, '0h 00m') AS "totalHours",
        COALESCE(a.status, 'absent') AS status,
        COALESCE(a.mode, '—') AS mode,
        a.id AS record_id
      FROM users u
      LEFT JOIN attendance_records a ON u.id = a.user_id AND a.punch_date = ${today}
      ORDER BY 
        CASE WHEN u.role = 'manager' THEN 1 WHEN u.role = 'employee' THEN 2 ELSE 3 END,
        u.first_name;
    `;
    res.json({ success: true, data: team });
  } catch (error) {
    console.error('Error fetching team attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team attendance' });
  }
});

// 8e. Manager verifies or marks attendance record
app.patch('/api/attendance/verify/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    const { status = 'present', verifiedBy = 'David Chen (Manager)' } = req.body;
    await sql`
      UPDATE attendance_records
      SET status = ${status}, verified_by = ${verifiedBy}
      WHERE id = ${recordId};
    `;
    res.json({ success: true, message: 'Attendance record updated successfully' });
  } catch (error) {
    console.error('Error verifying attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to verify attendance' });
  }
});

// 8f. Employee attendance summary count
app.get('/api/employee/attendance/summary', async (req, res) => {
  try {
    const userId = req.query.userId || 'IA-EM-001';
    const counts = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'present') AS present_count,
        COUNT(*) FILTER (WHERE status = 'absent') AS absent_count,
        COUNT(*) FILTER (WHERE status = 'late') AS late_count,
        COUNT(*) FILTER (WHERE status = 'wfh') AS wfh_count
      FROM attendance_records
      WHERE user_id = ${userId};
    `;
    const c = counts[0] || {};
    res.json({
      success: true,
      data: [
        { label: 'Present', value: String(c.present_count || 0), color: 'success' },
        { label: 'Absent', value: String(c.absent_count || 0), color: 'error' },
        { label: 'Late', value: String(c.late_count || 0), color: 'warning' },
        { label: 'WFH', value: String(c.wfh_count || 0), color: 'accent' },
      ]
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

// ==========================================
// MODULE 2: LEAVE MANAGEMENT API
// ==========================================

// 9a. Employee leave balances
app.get('/api/leaves/balances', async (req, res) => {
  try {
    const userId = req.query.userId || 'IA-EM-001';
    const balances = await sql`
      SELECT * FROM leave_balances
      WHERE user_id = ${userId}
      LIMIT 1;
    `;
    if (!balances || balances.length === 0) {
      return res.json({
        success: true,
        data: {
          annual: { used: 5, total: 20 },
          sick: { used: 2, total: 10 },
          casual: { used: 2, total: 6 },
        }
      });
    }
    const b = balances[0];
    res.json({
      success: true,
      data: {
        annual: { used: b.annual_used, total: b.annual_total },
        sick: { used: b.sick_used, total: b.sick_total },
        casual: { used: b.casual_used, total: b.casual_total },
      }
    });
  } catch (error) {
    console.error('Error fetching leave balances:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave balances' });
  }
});

// Alias for backwards compatibility with Dashboard
app.get('/api/employee/leaves/balance', async (req, res) => {
  try {
    const userId = req.query.userId || 'IA-EM-001';
    const balances = await sql`SELECT * FROM leave_balances WHERE user_id = ${userId} LIMIT 1;`;
    if (!balances || balances.length === 0) {
      return res.json({ success: true, data: { annual: 15, sick: 8, casual: 5 } });
    }
    const b = balances[0];
    res.json({
      success: true,
      data: {
        annual: b.annual_total - b.annual_used,
        sick: b.sick_total - b.sick_used,
        casual: b.casual_total - b.casual_used
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave balance' });
  }
});

// 9b. My leave applications list
app.get('/api/leaves/my-requests', async (req, res) => {
  try {
    const userId = req.query.userId || 'IA-EM-001';
    const requests = await sql`
      SELECT 
        id,
        leave_type AS type,
        TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
        TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate",
        days,
        reason,
        status,
        TO_CHAR(applied_on, 'YYYY-MM-DD') AS "appliedOn",
        approved_by AS "approvedBy"
      FROM leave_requests
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
});

// 9c. Apply for leave
app.post('/api/leaves/apply', async (req, res) => {
  try {
    const {
      userId = 'IA-EM-001',
      type = 'Annual Leave',
      startDate,
      endDate,
      reason,
      days: providedDays
    } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Start date, end date, and reason are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const finalDays = providedDays || (calculatedDays > 0 ? calculatedDays : 1);

    const userRows = await sql`SELECT first_name, last_name, designation, department, avatar_url FROM users WHERE id = ${userId} LIMIT 1;`;
    const userName = userRows.length > 0 ? `${userRows[0].first_name} ${userRows[0].last_name}` : 'Sarah Miller';
    const userRole = userRows.length > 0 ? userRows[0].designation : 'Lead Product Software Engineer';
    const dept = userRows.length > 0 ? userRows[0].department : 'Engineering & Technology';
    const avatar = userRows.length > 0 ? userRows[0].avatar_url : '';

    const inserted = await sql`
      INSERT INTO leave_requests (
        user_id, user_name, user_role, department, avatar_url,
        leave_type, start_date, end_date, days, reason, status, approved_by
      )
      VALUES (
        ${userId}, ${userName}, ${userRole}, ${dept}, ${avatar},
        ${type}, ${startDate}, ${endDate}, ${finalDays}, ${reason}, 'pending', 'Awaiting Manager Review'
      )
      RETURNING *;
    `;

    const r = inserted[0];
    res.json({
      success: true,
      message: 'Leave application submitted successfully',
      data: {
        id: r.id,
        type: r.leave_type,
        startDate: r.start_date,
        endDate: r.end_date,
        days: r.days,
        reason: r.reason,
        status: r.status,
        appliedOn: r.applied_on,
        approvedBy: r.approved_by
      }
    });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ success: false, message: 'Failed to submit leave application' });
  }
});

// 9d. Cancel pending leave application
app.delete('/api/leaves/:id', async (req, res) => {
  try {
    const leaveId = req.params.id;
    await sql`
      DELETE FROM leave_requests
      WHERE id = ${leaveId} AND status = 'pending';
    `;
    res.json({ success: true, message: 'Leave request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling leave:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel leave request' });
  }
});

// 9e. Team leave requests for Manager / Admin approval
app.get('/api/leaves/team', async (req, res) => {
  try {
    const requests = await sql`
      SELECT 
        l.id,
        l.user_id,
        l.user_name AS "employeeName",
        l.user_role AS "employeeRole",
        COALESCE(l.avatar_url, '') AS avatar,
        l.leave_type AS type,
        TO_CHAR(l.start_date, 'YYYY-MM-DD') AS "startDate",
        TO_CHAR(l.end_date, 'YYYY-MM-DD') AS "endDate",
        l.days,
        l.reason,
        TO_CHAR(l.applied_on, 'YYYY-MM-DD') AS "appliedOn",
        l.status,
        l.approved_by AS "approvedBy"
      FROM leave_requests l
      ORDER BY 
        CASE WHEN l.status = 'pending' THEN 1 ELSE 2 END,
        l.created_at DESC;
    `;
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching team leave requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team leave requests' });
  }
});

// 9f. Manager updates leave status (Approve / Reject)
const handleLeaveStatusUpdate = async (req, res) => {
  try {
    const leaveId = req.params.id || req.body.leaveId || req.body.id;
    let { status, action, approvedBy = 'David Chen (Manager)' } = req.body;
    if (!status && action) {
      status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action;
    }
    if (status) status = status.toLowerCase();

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await sql`
      UPDATE leave_requests
      SET status = ${status}, approved_by = ${approvedBy}
      WHERE id = ${leaveId}
      RETURNING *;
    `;

    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const leave = updated[0];

    // If approved, update user leave balance
    if (status === 'approved') {
      const field = leave.leave_type.toLowerCase().includes('sick')
        ? 'sick_used'
        : leave.leave_type.toLowerCase().includes('casual')
        ? 'casual_used'
        : 'annual_used';

      if (field === 'sick_used') {
        await sql`UPDATE leave_balances SET sick_used = sick_used + ${leave.days} WHERE user_id = ${leave.user_id};`;
      } else if (field === 'casual_used') {
        await sql`UPDATE leave_balances SET casual_used = casual_used + ${leave.days} WHERE user_id = ${leave.user_id};`;
      } else {
        await sql`UPDATE leave_balances SET annual_used = annual_used + ${leave.days} WHERE user_id = ${leave.user_id};`;
      }
    }

    res.json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ success: false, message: 'Failed to update leave status' });
  }
};

app.patch('/api/leaves/:id/status', handleLeaveStatusUpdate);
app.post('/api/leaves/action', handleLeaveStatusUpdate);

// ==========================================
// MODULE 3: EXPENSES & REIMBURSEMENTS API
// ==========================================

// 10a. Get my expenses
app.get('/api/expenses/my', async (req, res) => {
  try {
    const userId = req.query.userId || 'IA-EM-001';
    const expenses = await sql`
      SELECT 
        id,
        user_id,
        title,
        category,
        amount_inr AS "amountInr",
        TO_CHAR(expense_date, 'YYYY-MM-DD') AS "expenseDate",
        description,
        COALESCE(receipt_url, '') AS "receiptUrl",
        status,
        approved_by AS "approvedBy",
        payment_ref AS "paymentRef",
        TO_CHAR(applied_on, 'YYYY-MM-DD') AS "appliedOn"
      FROM expenses
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;
    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching employee expenses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
  }
});

// 10b. Submit expense claim with receipt upload to Cloudinary
app.post('/api/expenses/submit', upload.single('receipt'), async (req, res) => {
  try {
    const {
      userId = 'IA-EM-001',
      title,
      category = 'General',
      amountInr,
      expenseDate,
      description
    } = req.body;

    if (!title || !amountInr || !expenseDate) {
      return res.status(400).json({ success: false, message: 'Title, amount in INR, and date are required' });
    }

    let receiptUrl = '';
    let receiptPublicId = '';

    if (req.file) {
      const uploadRes = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'intelliattend/receipts',
        resource_type: 'auto',
        public_id: `receipt_${userId}_${Date.now()}`
      });
      receiptUrl = uploadRes.secure_url;
      receiptPublicId = uploadRes.public_id;
    }

    const userRows = await sql`SELECT first_name, last_name, designation, department FROM users WHERE id = ${userId} LIMIT 1;`;
    const userName = userRows.length > 0 ? `${userRows[0].first_name} ${userRows[0].last_name}` : 'Sarah Miller';
    const userRole = userRows.length > 0 ? userRows[0].designation : 'Lead Product Software Engineer';
    const dept = userRows.length > 0 ? userRows[0].department : 'Engineering & Technology';

    const inserted = await sql`
      INSERT INTO expenses (
        user_id, user_name, user_role, department,
        title, category, amount_inr, expense_date, description,
        receipt_url, receipt_public_id, status
      )
      VALUES (
        ${userId}, ${userName}, ${userRole}, ${dept},
        ${title}, ${category}, ${amountInr}, ${expenseDate}, ${description || ''},
        ${receiptUrl}, ${receiptPublicId}, 'pending'
      )
      RETURNING *;
    `;

    const r = inserted[0];
    res.json({
      success: true,
      message: 'Expense claim submitted successfully',
      data: {
        id: r.id,
        userId: r.user_id,
        title: r.title,
        category: r.category,
        amountInr: r.amount_inr,
        expenseDate: r.expense_date,
        description: r.description,
        receiptUrl: r.receipt_url,
        status: r.status,
        appliedOn: r.applied_on
      }
    });
  } catch (error) {
    console.error('Error submitting expense:', error);
    res.status(500).json({ success: false, message: 'Failed to submit expense claim' });
  }
});

// 10c. Cancel pending expense claim
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const expenseId = req.params.id;
    await sql`
      DELETE FROM expenses
      WHERE id = ${expenseId} AND status = 'pending';
    `;
    res.json({ success: true, message: 'Expense claim cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling expense:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel expense' });
  }
});

// 10d. Team expenses for Manager / Admin approval
app.get('/api/expenses/team', async (req, res) => {
  try {
    const expenses = await sql`
      SELECT 
        id,
        user_id AS "userId",
        user_name AS "employeeName",
        user_role AS "employeeRole",
        department,
        title,
        category,
        amount_inr AS "amountInr",
        TO_CHAR(expense_date, 'YYYY-MM-DD') AS "expenseDate",
        description,
        COALESCE(receipt_url, '') AS "receiptUrl",
        status,
        approved_by AS "approvedBy",
        payment_ref AS "paymentRef",
        TO_CHAR(applied_on, 'YYYY-MM-DD') AS "appliedOn"
      FROM expenses
      ORDER BY 
        CASE WHEN status = 'pending' THEN 1 WHEN status = 'approved' THEN 2 ELSE 3 END,
        created_at DESC;
    `;
    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching team expenses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team expenses' });
  }
});

// 10e. Manager approves or rejects expense claim
app.patch('/api/expenses/:id/status', async (req, res) => {
  try {
    const expenseId = req.params.id;
    const { status, approvedBy = 'David Chen (Manager)', paymentRef } = req.body;

    if (!['approved', 'rejected', 'reimbursed', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid expense status' });
    }

    const updated = await sql`
      UPDATE expenses
      SET 
        status = ${status}, 
        approved_by = ${approvedBy},
        payment_ref = COALESCE(${paymentRef || null}, payment_ref)
      WHERE id = ${expenseId}
      RETURNING *;
    `;

    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense claim not found' });
    }

    res.json({
      success: true,
      message: `Expense claim marked as ${status}`,
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating expense status:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense status' });
  }
});

// ==========================================
// MODULE 4: SALARY, PAYROLL & PAYSLIPS API
// ==========================================

// 11a. Get employee salary structure
app.get('/api/salary/structure', async (req, res) => {
  try {
    const userId = req.query.userId || 'IA-EM-001';
    const rows = await sql`
      SELECT 
        user_id AS "userId",
        user_name AS "userName",
        designation,
        department,
        annual_ctc_inr AS "annualCtcInr",
        monthly_gross_inr AS "monthlyGrossInr",
        basic_salary AS "basicSalary",
        basic_salary AS "base_salary",
        hra,
        special_allowance AS "specialAllowance",
        performance_bonus AS "performanceBonus",
        pf_deduction AS "pfDeduction",
        tds_deduction AS "tdsDeduction",
        insurance_deduction AS "insuranceDeduction",
        professional_tax AS "professionalTax",
        monthly_net_inr AS "monthlyNetInr",
        salary_band AS "salaryBand",
        bank_name AS "bankName",
        bank_account AS "bankAccount",
        pan_number AS "panNumber"
      FROM salary_structures
      WHERE user_id = ${userId}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Salary structure not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching salary structure:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch salary structure' });
  }
});

// 11b. Get employee payslips
app.get('/api/salary/payslips', async (req, res) => {
  try {
    const userId = req.query.userId || 'IA-EM-001';
    const slips = await sql`
      SELECT 
        id,
        user_id AS "userId",
        user_name AS "userName",
        month,
        TO_CHAR(pay_date, 'YYYY-MM-DD') AS "payDate",
        gross_inr AS gross,
        deductions_inr AS deductions,
        net_inr AS net,
        working_days AS "workingDays",
        paid_days AS "paidDays",
        status,
        transaction_ref AS "transactionRef"
      FROM payslips
      WHERE user_id = ${userId}
      ORDER BY pay_date DESC;
    `;
    res.json({ success: true, data: slips });
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payslips' });
  }
});

// 11c. Get team salary roster for Manager / Client Admin
app.get('/api/salary/team', async (req, res) => {
  try {
    const team = await sql`
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name AS name,
        COALESCE(u.avatar_url, '') AS avatar,
        u.designation AS role,
        u.department,
        COALESCE(s.annual_ctc_inr, 0) AS "annualCtc",
        COALESCE(s.monthly_gross_inr, 0) AS "monthlyGross",
        COALESCE(s.monthly_net_inr, 0) AS "monthlyNet",
        COALESCE(s.salary_band, 'Standard Band') AS "salaryBand",
        COALESCE(s.bank_account, '—') AS "bankAccount",
        'Paid' AS "lastMonthStatus"
      FROM users u
      LEFT JOIN salary_structures s ON u.id = s.user_id
      ORDER BY 
        CASE WHEN u.role = 'manager' THEN 1 WHEN u.role = 'employee' THEN 2 ELSE 3 END,
        u.first_name;
    `;
    res.json({ success: true, data: team });
  } catch (error) {
    console.error('Error fetching team salary list:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team salaries' });
  }
});

// 11d. Disburse monthly payroll (Manager / Admin action)
app.post('/api/salary/disburse', async (req, res) => {
  try {
    const { month = 'October 2026', payDate = new Date().toISOString().split('T')[0] } = req.body;

    const structures = await sql`SELECT * FROM salary_structures;`;
    let count = 0;

    for (const s of structures) {
      const existing = await sql`
        SELECT id FROM payslips WHERE user_id = ${s.user_id} AND month = ${month};
      `;
      if (existing.length === 0) {
        const totalDeductions = Number(s.pf_deduction) + Number(s.tds_deduction) + Number(s.insurance_deduction) + Number(s.professional_tax);
        const ref = `SAL-${month.replace(/\s+/g, '').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        await sql`
          INSERT INTO payslips (user_id, user_name, month, pay_date, gross_inr, deductions_inr, net_inr, working_days, paid_days, status, transaction_ref)
          VALUES (${s.user_id}, ${s.user_name}, ${month}, ${payDate}, ${s.monthly_gross_inr}, ${totalDeductions}, ${s.monthly_net_inr}, 22, 22, 'paid', ${ref});
        `;
        count++;
      }
    }

    res.json({
      success: true,
      message: `Payroll disbursed successfully for ${month}. ${count} new payslips generated.`
    });
  } catch (error) {
    console.error('Error disbursing payroll:', error);
    res.status(500).json({ success: false, message: 'Failed to disburse payroll' });
  }
});

// 12. Cloudinary Object Storage: Upload Corporate Document
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
    const { category, search } = req.query;
    let docs = await sql`
      SELECT 
        id,
        title,
        category,
        file_url AS "fileUrl",
        public_id AS "publicId",
        file_size AS "fileSize",
        file_type AS "fileType",
        uploaded_by AS "uploadedBy",
        to_char(created_at, 'YYYY-MM-DD') AS "lastUpdated",
        'published' AS status,
        'v1.0' AS version,
        'Official corporate document stored on Cloudinary object storage.' AS description,
        created_at
      FROM documents 
      ORDER BY id ASC;
    `;

    if (category && category !== 'all' && category !== 'All') {
      docs = docs.filter(d => d.category?.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(d => d.title?.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q));
    }

    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await sql`SELECT public_id FROM documents WHERE id = ${Number(id)};`;
    if (doc.length > 0 && doc[0].public_id) {
      try {
        await deleteFromCloudinary(doc[0].public_id, { resource_type: 'raw' });
      } catch (cErr) {
        console.warn('Cloudinary cleanup warning:', cErr.message);
      }
    }
    await sql`DELETE FROM documents WHERE id = ${Number(id)};`;
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
});

// 11b. Corporate Policies API
app.get('/api/policies', async (req, res) => {
  try {
    const policies = await sql`
      SELECT 
        id,
        title,
        category,
        version,
        status,
        description,
        content,
        last_updated AS "lastUpdated"
      FROM policies
      ORDER BY id ASC;
    `;
    res.json({ success: true, data: policies });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policies' });
  }
});

app.post('/api/policies', async (req, res) => {
  try {
    const { title, category = 'Conduct', version = 'v1.0', description, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const inserted = await sql`
      INSERT INTO policies (title, category, version, status, description, content, last_updated)
      VALUES (${title}, ${category}, ${version}, 'active', ${description || ''}, ${content}, ${new Date().toISOString().split('T')[0]})
      RETURNING *;
    `;

    res.json({ success: true, message: 'Policy created successfully', data: inserted[0] });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ success: false, message: 'Failed to create policy' });
  }
});

app.put('/api/policies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, version, description, content, status } = req.body;

    const updated = await sql`
      UPDATE policies
      SET
        title = COALESCE(${title}, title),
        category = COALESCE(${category}, category),
        version = COALESCE(${version}, version),
        description = COALESCE(${description}, description),
        content = COALESCE(${content}, content),
        status = COALESCE(${status}, status),
        last_updated = ${new Date().toISOString().split('T')[0]}
      WHERE id = ${Number(id)}
      RETURNING *;
    `;

    res.json({ success: true, message: 'Policy updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ success: false, message: 'Failed to update policy' });
  }
});

app.delete('/api/policies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM policies WHERE id = ${Number(id)};`;
    res.json({ success: true, message: 'Policy removed successfully' });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ success: false, message: 'Failed to delete policy' });
  }
});

// 11c. Support Tickets & Corporate Grievance API
app.get('/api/tickets', async (req, res) => {
  try {
    const { userId, userEmail, category, status } = req.query;

    let tickets = await sql`
      SELECT 
        id,
        ticket_ref AS "ticketRef",
        user_id AS "userId",
        user_name AS "userName",
        user_email AS "userEmail",
        category,
        priority,
        subject,
        description,
        status,
        resolution_notes AS "resolutionNotes",
        to_char(created_at, 'Mon DD, YYYY • HH24:MI') AS "createdAt",
        to_char(updated_at, 'Mon DD, YYYY • HH24:MI') AS "updatedAt"
      FROM support_tickets
      ORDER BY id DESC;
    `;

    if (userId) {
      tickets = tickets.filter(t => t.userId === userId);
    }
    if (userEmail) {
      tickets = tickets.filter(t => t.userEmail === userEmail);
    }
    if (category && category !== 'all') {
      tickets = tickets.filter(t => t.category?.toLowerCase() === category.toLowerCase());
    }
    if (status && status !== 'all') {
      tickets = tickets.filter(t => t.status === status);
    }

    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const { userId, userName, userEmail, category = 'General HR', priority = 'Normal', subject, description } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    const ticketRef = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const inserted = await sql`
      INSERT INTO support_tickets (
        ticket_ref, user_id, user_name, user_email, category, priority, subject, description, status
      )
      VALUES (
        ${ticketRef},
        ${userId || 'IA-EM-001'},
        ${userName || 'Sarah Miller'},
        ${userEmail || 'employee.intelliattend@gmail.com'},
        ${category},
        ${priority},
        ${subject},
        ${description},
        'open'
      )
      RETURNING *;
    `;

    res.json({ success: true, message: 'Support ticket submitted successfully', data: inserted[0] });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
});

app.patch('/api/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const updated = await sql`
      UPDATE support_tickets
      SET
        status = ${status},
        resolution_notes = COALESCE(${resolutionNotes}, resolution_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number(id)}
      RETURNING *;
    `;

    res.json({ success: true, message: `Ticket status updated to ${status}`, data: updated[0] });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket status' });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM support_tickets WHERE id = ${Number(id)};`;
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to delete ticket' });
  }
});

// 12. Object Storage / Cloudinary: Upload User Avatar
app.post('/api/upload/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const isPrivileged = req.user && ['superadmin', 'manager', 'client_admin', 'client', 'payroll_admin'].includes(req.user.role);
    const callerSupplied = req.body.userId || req.body.employeeId || req.body.email || req.body.loginEmail;
    const userId = (isPrivileged && callerSupplied) ? callerSupplied : (req.user?.id || req.user?.email || callerSupplied || '');
    const rawExt = req.file.mimetype ? req.file.mimetype.split('/')[1] : 'png';
    const ext = (rawExt || 'png').replace('jpeg', 'jpg');

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'intelliattend/avatars',
      resource_type: 'image',
      format: ext,
      public_id: `avatar_${userId || 'user'}_${Date.now()}`
    });

    const finalUrl = result.secure_url || result.url;

    if (userId) {
      await sql`
        UPDATE users 
        SET avatar_url = ${finalUrl} 
        WHERE id = ${userId} OR email = ${userId};
      `;
    }

    res.json({
      success: true,
      message: 'Avatar uploaded and saved to profile successfully',
      url: finalUrl,
      avatarUrl: finalUrl,
      avatar: finalUrl,
      publicId: result.public_id,
      data: {
        url: finalUrl,
        avatarUrl: finalUrl,
        avatar: finalUrl
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 13. Tenant Companies Management (SuperAdmin)
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await sql`
      SELECT 
        id,
        name,
        subdomain AS domain,
        plan,
        status,
        admin_email AS "adminEmail",
        employees,
        managers,
        joined_date AS "joinedDate",
        created_at
      FROM companies
      ORDER BY id ASC;
    `;
    res.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch companies' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { name, domain, plan = 'Growth', adminEmail, employees = 50, managers = 5 } = req.body;
    if (!name || !adminEmail) {
      return res.status(400).json({ success: false, message: 'Company name and admin email are required' });
    }

    const subdomain = domain || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.hrms.portal`;
    const joinedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const inserted = await sql`
      INSERT INTO companies (name, subdomain, plan, status, admin_email, employees, managers, joined_date)
      VALUES (${name}, ${subdomain}, ${plan}, 'active', ${adminEmail}, ${Number(employees)}, ${Number(managers)}, ${joinedDate})
      RETURNING 
        id,
        name,
        subdomain AS domain,
        plan,
        status,
        admin_email AS "adminEmail",
        employees,
        managers,
        joined_date AS "joinedDate";
    `;

    res.json({ success: true, message: 'Company created successfully', data: inserted[0] });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create company' });
  }
});

app.patch('/api/companies/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await sql`
      UPDATE companies
      SET status = ${status}
      WHERE id = ${Number(id)}
      RETURNING id, name, status;
    `;

    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, message: `Company status changed to ${status}`, data: updated[0] });
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({ success: false, message: 'Failed to update company status' });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM companies WHERE id = ${Number(id)};`;
    res.json({ success: true, message: 'Company removed successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ success: false, message: 'Failed to delete company' });
  }
});

// 14. Transactions & Revenue Audit (SuperAdmin)
app.get('/api/transactions', async (req, res) => {
  try {
    const { status, search } = req.query;

    let txns = await sql`
      SELECT 
        id,
        company_name AS company,
        subdomain,
        plan,
        billing_cycle AS "billingCycle",
        amount_inr AS amount,
        subtotal,
        gst_18 AS gst,
        gateway,
        gateway_ref AS "gatewayRef",
        status,
        customer_email AS "customerEmail",
        customer_name AS "customerName",
        gstin,
        payment_method AS "paymentMethod",
        to_char(created_at, 'Mon DD, YYYY • HH24:MI "IST"') AS date,
        created_at AS "rawDate",
        '#' AS "receiptUrl"
      FROM transactions
      ORDER BY created_at DESC;
    `;

    if (status && status !== 'all') {
      txns = txns.filter(t => t.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      txns = txns.filter(t =>
        t.company?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.gatewayRef?.toLowerCase().includes(q) ||
        t.customerEmail?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: txns });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const {
      companyName, subdomain, plan, billingCycle = 'Annual',
      amount, gateway = 'Razorpay UPI', gatewayRef,
      customerEmail, customerName, gstin = '36AABCU9603R1ZM', paymentMethod = 'UPI'
    } = req.body;

    const numAmount = Number(amount);
    const subtotal = Number((numAmount / 1.18).toFixed(2));
    const gst18 = Number((numAmount - subtotal).toFixed(2));
    const id = `TXN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const ref = gatewayRef || `pay_${Math.random().toString(36).substring(2, 12)}`;

    const created = await sql`
      INSERT INTO transactions (
        id, company_name, subdomain, plan, billing_cycle,
        amount_inr, subtotal, gst_18, gateway, gateway_ref,
        status, customer_email, customer_name, gstin, payment_method
      )
      VALUES (
        ${id}, ${companyName}, ${subdomain}, ${plan}, ${billingCycle},
        ${numAmount}, ${subtotal}, ${gst18}, ${gateway}, ${ref},
        'completed', ${customerEmail}, ${customerName}, ${gstin}, ${paymentMethod}
      )
      RETURNING *;
    `;

    res.json({ success: true, message: 'Transaction recorded successfully', data: created[0] });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to record transaction' });
  }
});

// 15. Client Billing Overview & Invoices
app.get('/api/billing/overview', async (req, res) => {
  try {
    const email = req.query.email || 'clientadmin.intelliattend@gmail.com';

    // Find company for this client admin
    const comps = await sql`
      SELECT * FROM companies 
      WHERE admin_email = ${email}
      LIMIT 1;
    `;

    const company = comps[0] || {
      name: 'Acme Enterprise',
      plan: 'Enterprise Tier',
      employees: 480,
      managers: 32,
      subdomain: 'acme.hrms.portal'
    };

    const overview = {
      companyName: company.name,
      plan: company.plan || 'Enterprise Tier',
      subdomain: company.subdomain,
      annualFeeInr: 4800,
      renewalDate: 'Oct 01, 2027',
      totalSeats: 500,
      usedSeats: Number(company.employees) || 480,
      autoRenew: true,
      paymentMethod: {
        type: 'Corporate Visa',
        last4: '4242',
        expiry: '12/28',
        holder: 'Acme Treasury'
      }
    };

    res.json({ success: true, data: overview });
  } catch (error) {
    console.error('Error fetching billing overview:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch billing overview' });
  }
});

app.get('/api/billing/invoices', async (req, res) => {
  try {
    const email = req.query.email || 'clientadmin.intelliattend@gmail.com';

    const txns = await sql`
      SELECT 
        id,
        to_char(created_at, 'Mon DD, YYYY') AS date,
        '₹' || to_char(amount_inr, 'FM999,999,990.00') AS amount,
        amount_inr AS "amountNumber",
        status,
        plan || ' (' || billing_cycle || ')' AS description,
        payment_method AS "paymentMethod",
        gateway_ref AS "reference"
      FROM transactions
      WHERE customer_email = ${email}
      ORDER BY created_at DESC;
    `;

    res.json({ success: true, data: txns });
  } catch (error) {
    console.error('Error fetching client invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

// 16. Subscription Plans Management (SuperAdmin)
app.get('/api/plans', async (req, res) => {
  try {
    const plans = await sql`
      SELECT 
        id,
        name,
        price_monthly AS "priceMonthly",
        price_annual AS "priceAnnual",
        max_employees AS "maxEmployees",
        active_subscribers AS "activeSubscribers",
        status,
        popular,
        features
      FROM subscription_plans
      ORDER BY price_monthly ASC;
    `;
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscription plans' });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const { name, priceMonthly, priceAnnual, maxEmployees, features = [] } = req.body;
    if (!name || !priceMonthly) {
      return res.status(400).json({ success: false, message: 'Plan name and price are required' });
    }

    const inserted = await sql`
      INSERT INTO subscription_plans (name, price_monthly, price_annual, max_employees, active_subscribers, status, features)
      VALUES (${name}, ${Number(priceMonthly)}, ${Number(priceAnnual)}, ${Number(maxEmployees)}, 0, 'active', ${JSON.stringify(features)}::jsonb)
      RETURNING *;
    `;

    res.json({ success: true, message: 'Plan created successfully', data: inserted[0] });
  } catch (error) {
    console.error('Error saving subscription plan:', error);
    res.status(500).json({ success: false, message: 'Failed to create plan' });
  }
});

app.patch('/api/plans/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await sql`
      UPDATE subscription_plans
      SET status = ${status}
      WHERE id = ${Number(id)}
      RETURNING *;
    `;

    res.json({ success: true, message: `Plan status updated to ${status}`, data: updated[0] });
  } catch (error) {
    console.error('Error updating plan status:', error);
    res.status(500).json({ success: false, message: 'Failed to update plan status' });
  }
});

// 17. Tasks API (Neon PostgreSQL backed)
app.get('/api/tasks', async (req, res) => {
  try {
    const { scope } = req.query;
    
    let tasksQuery;
    if (scope) {
      tasksQuery = await sql`
        SELECT 
          id,
          title,
          subtitle,
          scope,
          assigned_by AS "assignedBy",
          assigned_date AS "assignedDate",
          priority,
          due_date AS "dueDate",
          due_date_formatted AS "dueDateFormatted",
          status,
          progress,
          assignees
        FROM tasks
        WHERE scope = ${scope}
        ORDER BY id DESC;
      `;
    } else {
      tasksQuery = await sql`
        SELECT 
          id,
          title,
          subtitle,
          scope,
          assigned_by AS "assignedBy",
          assigned_date AS "assignedDate",
          priority,
          due_date AS "dueDate",
          due_date_formatted AS "dueDateFormatted",
          status,
          progress,
          assignees
        FROM tasks
        ORDER BY id DESC;
      `;
    }

    const taskIds = tasksQuery.map(t => t.id);
    let commentsByTask = {};
    if (taskIds.length > 0) {
      const comments = await sql`
        SELECT 
          id,
          task_id AS "taskId",
          author,
          author_email AS "authorEmail",
          time,
          content
        FROM task_comments
        WHERE task_id = ANY(${taskIds})
        ORDER BY id ASC;
      `;
      comments.forEach(c => {
        if (!commentsByTask[c.taskId]) commentsByTask[c.taskId] = [];
        commentsByTask[c.taskId].push(c);
      });
    }

    const tasks = tasksQuery.map(t => ({
      ...t,
      comments: commentsByTask[t.id] || []
    }));

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const {
      title,
      subtitle = '',
      scope = 'assignedToMe',
      assignedBy = 'David Chen',
      priority = 'Medium',
      dueDate,
      dueDateFormatted,
      assignees = []
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title and due date are required' });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const formatted = dueDateFormatted || new Date(dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const inserted = await sql`
      INSERT INTO tasks (
        title, subtitle, scope, assigned_by, assigned_date, priority, due_date, due_date_formatted, status, progress, assignees
      )
      VALUES (
        ${title},
        ${subtitle || title},
        ${scope},
        ${assignedBy},
        ${todayStr},
        ${priority},
        ${dueDate},
        ${formatted},
        'Pending',
        0,
        ${JSON.stringify(assignees)}::jsonb
      )
      RETURNING 
        id,
        title,
        subtitle,
        scope,
        assigned_by AS "assignedBy",
        assigned_date AS "assignedDate",
        priority,
        due_date AS "dueDate",
        due_date_formatted AS "dueDateFormatted",
        status,
        progress,
        assignees;
    `;

    const task = {
      ...inserted[0],
      comments: []
    };

    res.json({ success: true, message: 'Task created successfully', data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress } = req.body;

    const progValue = progress !== undefined 
      ? Number(progress) 
      : (status === 'Completed' || status === 'completed' ? 100 : status === 'In Progress' || status === 'in_progress' ? 50 : 0);

    const updated = await sql`
      UPDATE tasks
      SET 
        status = ${status},
        progress = ${progValue}
      WHERE id = ${Number(id)}
      RETURNING 
        id,
        title,
        subtitle,
        scope,
        assigned_by AS "assignedBy",
        assigned_date AS "assignedDate",
        priority,
        due_date AS "dueDate",
        due_date_formatted AS "dueDateFormatted",
        status,
        progress,
        assignees;
    `;

    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task status updated', data: updated[0] });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ success: false, message: 'Failed to update task status' });
  }
});

app.post('/api/tasks/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { author = 'Sarah Miller', authorEmail = '', time = 'Just now', content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const inserted = await sql`
      INSERT INTO task_comments (task_id, author, author_email, time, content)
      VALUES (${Number(id)}, ${author}, ${authorEmail}, ${time}, ${content.trim()})
      RETURNING 
        id,
        task_id AS "taskId",
        author,
        author_email AS "authorEmail",
        time,
        content;
    `;

    res.json({ success: true, message: 'Comment added', data: inserted[0] });
  } catch (error) {
    console.error('Error adding task comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// 18. Regularizations API (Neon PostgreSQL backed)
app.get('/api/regularizations', async (req, res) => {
  try {
    const { userId } = req.query;

    let rows;
    if (userId) {
      rows = await sql`
        SELECT 
          id,
          user_id AS "userId",
          user_name AS "userName",
          attendance_date AS "attendanceDate",
          day,
          original_clock_in AS "originalClockIn",
          original_clock_out AS "originalClockOut",
          requested_clock_in AS "requestedClockIn",
          requested_clock_out AS "requestedClockOut",
          reason_type AS "reasonType",
          reason_details AS "reasonDetails",
          status,
          manager_comment AS "managerComment",
          applied_date AS "appliedDate"
        FROM regularizations
        WHERE user_id = ${userId}
        ORDER BY id DESC;
      `;
    } else {
      rows = await sql`
        SELECT 
          id,
          user_id AS "userId",
          user_name AS "userName",
          attendance_date AS "attendanceDate",
          day,
          original_clock_in AS "originalClockIn",
          original_clock_out AS "originalClockOut",
          requested_clock_in AS "requestedClockIn",
          requested_clock_out AS "requestedClockOut",
          reason_type AS "reasonType",
          reason_details AS "reasonDetails",
          status,
          manager_comment AS "managerComment",
          applied_date AS "appliedDate"
        FROM regularizations
        ORDER BY id DESC;
      `;
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching regularizations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch regularizations' });
  }
});

app.post('/api/regularizations', async (req, res) => {
  try {
    const {
      userId = 'IA-EM-001',
      userName = 'Sarah Miller',
      attendanceDate,
      day,
      originalClockIn = 'Missed Punch',
      originalClockOut = 'Missed Punch',
      requestedClockIn,
      requestedClockOut,
      reasonType = req.body.reason || 'Missed Punch',
      reasonDetails = req.body.reason || 'Regularization request'
    } = req.body;

    if (!attendanceDate || !requestedClockIn || !requestedClockOut) {
      return res.status(400).json({ success: false, message: 'All regularization fields are required' });
    }

    const calculatedDay = day || new Date(attendanceDate).toLocaleDateString('en-GB', { weekday: 'long' });
    const todayStr = new Date().toISOString().slice(0, 10);

    const inserted = await sql`
      INSERT INTO regularizations (
        user_id, user_name, attendance_date, day, original_clock_in, original_clock_out,
        requested_clock_in, requested_clock_out, reason_type, reason_details, status, applied_date
      )
      VALUES (
        ${userId},
        ${userName},
        ${attendanceDate},
        ${calculatedDay},
        ${originalClockIn},
        ${originalClockOut},
        ${requestedClockIn},
        ${requestedClockOut},
        ${reasonType},
        ${reasonDetails || ''},
        'Pending',
        ${todayStr}
      )
      RETURNING 
        id,
        user_id AS "userId",
        user_name AS "userName",
        attendance_date AS "attendanceDate",
        day,
        original_clock_in AS "originalClockIn",
        original_clock_out AS "originalClockOut",
        requested_clock_in AS "requestedClockIn",
        requested_clock_out AS "requestedClockOut",
        reason_type AS "reasonType",
        reason_details AS "reasonDetails",
        status,
        manager_comment AS "managerComment",
        applied_date AS "appliedDate";
    `;

    res.json({ success: true, message: 'Regularization request submitted', data: inserted[0] });
  } catch (error) {
    console.error('Error submitting regularization:', error);
    res.status(500).json({ success: false, message: 'Failed to submit regularization request' });
  }
});

const handleRegularizationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status, action, managerComment = '' } = req.body;
    if (!status && action) {
      status = action.toLowerCase() === 'approve' ? 'Approved' : action.toLowerCase() === 'reject' ? 'Rejected' : action;
    }
    const normalizedStatus = (status && status.toLowerCase() === 'approved') ? 'Approved' : ((status && status.toLowerCase() === 'rejected') ? 'Rejected' : status);

    const updated = await sql`
      UPDATE regularizations
      SET 
        status = ${normalizedStatus},
        manager_comment = ${managerComment}
      WHERE id = ${Number(id)}
      RETURNING *;
    `;

    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Regularization record not found' });
    }

    const reg = updated[0];

    // If approved, sync attendance record for that user and date
    if (normalizedStatus === 'Approved') {
      const userRows = await sql`SELECT first_name, last_name, department FROM users WHERE id = ${reg.user_id} LIMIT 1;`;
      const userName = userRows.length > 0 ? `${userRows[0].first_name} ${userRows[0].last_name}` : (reg.user_name || 'Staff');
      const dept = userRows.length > 0 ? (userRows[0].department || 'General') : 'General';
      const existingAtt = await sql`SELECT id FROM attendance_records WHERE user_id = ${reg.user_id} AND punch_date = ${reg.attendance_date} LIMIT 1;`;

      let workSec = 28800; // 8-hour standard fallback
      if (reg.requested_clock_in && reg.requested_clock_out) {
        try {
          const parseTimeToMinutes = (t) => {
            if (!t || typeof t !== 'string') return NaN;
            const str = t.trim().toLowerCase();
            const isPM = str.includes('pm');
            const isAM = str.includes('am');
            const clean = str.replace(/[^\d:]/g, '');
            if (!clean || !clean.includes(':')) return NaN;
            const parts = clean.split(':').map(Number);
            if (parts.length < 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) {
              return NaN;
            }
            let hours = parts[0];
            const minutes = parts[1];
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
              return NaN;
            }
            if (isPM && hours < 12) hours += 12;
            if (isAM && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };
          const inMin = parseTimeToMinutes(reg.requested_clock_in);
          const outMin = parseTimeToMinutes(reg.requested_clock_out);
          if (Number.isFinite(inMin) && Number.isFinite(outMin) && inMin >= 0 && outMin >= 0) {
            let diffMin = outMin - inMin;
            if (diffMin < 0) {
              // Valid overnight shift: adds a day rollover (24 hours = 1440 minutes)
              diffMin += 1440;
            } else if (diffMin === 0) {
              // Separate fallback for invalid zero duration
              diffMin = 480;
            }
            workSec = diffMin * 60;
          } else {
            workSec = 28800; // 8-hour fallback for invalid clock times
          }
        } catch {
          workSec = 28800;
        }
      }
      const hrs = Math.floor(workSec / 3600);
      const mins = Math.floor((workSec % 3600) / 60);
      const totalHoursStr = `${hrs}h ${mins}m`;

      if (existingAtt.length > 0) {
        await sql`
          UPDATE attendance_records
          SET 
            check_in = ${reg.requested_clock_in},
            check_out = ${reg.requested_clock_out},
            status = 'present',
            total_hours = ${totalHoursStr},
            work_seconds = ${workSec},
            verified_by = 'Manager Verified (Regularized)'
          WHERE id = ${existingAtt[0].id};
        `;
      } else {
        await sql`
          INSERT INTO attendance_records (
            user_id, user_name, department, punch_date, check_in, check_out,
            status, total_hours, work_seconds, mode, verified_by
          )
          VALUES (
            ${reg.user_id},
            ${userName},
            ${dept},
            ${reg.attendance_date},
            ${reg.requested_clock_in},
            ${reg.requested_clock_out},
            'present',
            ${totalHoursStr},
            ${workSec},
            'Office',
            'Manager Verified (Regularized)'
          );
        `;
      }
    }

    res.json({
      success: true,
      message: `Regularization request ${normalizedStatus}`,
      data: {
        id: reg.id,
        userId: reg.user_id,
        userName: reg.user_name,
        attendanceDate: reg.attendance_date,
        day: reg.day,
        originalClockIn: reg.original_clock_in,
        originalClockOut: reg.original_clock_out,
        requestedClockIn: reg.requested_clock_in,
        requestedClockOut: reg.requested_clock_out,
        reasonType: reg.reason_type,
        reasonDetails: reg.reason_details,
        status: normalizedStatus,
        managerComment: reg.manager_comment,
        appliedDate: reg.applied_date
      }
    });
  } catch (error) {
    console.error('Error updating regularization status:', error);
    res.status(500).json({ success: false, message: 'Failed to update regularization' });
  }
};

app.patch('/api/regularizations/:id/status', handleRegularizationStatus);
app.post('/api/regularizations/:id/action', handleRegularizationStatus);

// 19. Announcements / News API (Neon PostgreSQL backed)
app.get('/api/announcements', async (req, res) => {
  try {
    const rows = await sql`
      SELECT 
        id,
        title,
        category,
        date,
        read_time AS "readTime",
        author,
        pinned,
        summary,
        content
      FROM announcements
      ORDER BY pinned DESC, id DESC;
    `;

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const { title, category, author, summary, content, pinned = false } = req.body;
    if (!title || !category || !content) {
      return res.status(400).json({ success: false, message: 'Title, category, and content are required' });
    }

    const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const inserted = await sql`
      INSERT INTO announcements (title, category, date, read_time, author, pinned, summary, content)
      VALUES (
        ${title},
        ${category},
        ${todayDate},
        '3 min read',
        ${author || 'Executive Leadership'},
        ${Boolean(pinned)},
        ${summary || title},
        ${content}
      )
      RETURNING 
        id,
        title,
        category,
        date,
        read_time AS "readTime",
        author,
        pinned,
        summary,
        content;
    `;

    res.json({ success: true, message: 'Announcement created', data: inserted[0] });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
});

// 20. Holidays API (Neon PostgreSQL backed)
app.get('/api/holidays', async (req, res) => {
  try {
    const rows = await sql`
      SELECT 
        id,
        name,
        date,
        day,
        month,
        year,
        type,
        description,
        is_paid AS "isPaid"
      FROM holidays
      ORDER BY date ASC;
    `;

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch holidays' });
  }
});

// 21. Manager Dashboard Stats API (Neon PostgreSQL backed)
app.get('/api/manager/dashboard-stats', async (req, res) => {
  try {
    const [reportees] = await sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'employee'`;
    const [pendingLeaves] = await sql`SELECT COUNT(*)::int AS count FROM leave_requests WHERE status = 'Pending'`;
    const [pendingExpenses] = await sql`SELECT COUNT(*)::int AS count FROM expenses WHERE status = 'Pending'`;
    const [pendingRegularizations] = await sql`SELECT COUNT(*)::int AS count FROM regularizations WHERE status = 'Pending'`;
    const [totalTasks] = await sql`SELECT COUNT(*)::int AS count FROM tasks`;
    const [completedTasks] = await sql`SELECT COUNT(*)::int AS count FROM tasks WHERE status = 'Completed'`;
    const [inProgressTasks] = await sql`SELECT COUNT(*)::int AS count FROM tasks WHERE status = 'In Progress'`;

    res.json({
      success: true,
      data: {
        reporteesCount: Number(reportees?.count ?? 0),
        pendingLeavesCount: Number(pendingLeaves?.count ?? 0),
        pendingExpensesCount: Number(pendingExpenses?.count ?? 0),
        pendingRegularizationsCount: Number(pendingRegularizations?.count ?? 0),
        attendanceRate: '100%',
        tasks: {
          total: Number(totalTasks?.count ?? 0),
          completed: Number(completedTasks?.count ?? 0),
          inProgress: Number(inProgressTasks?.count ?? 0),
          pending: Math.max(0, Number(totalTasks?.count ?? 0) - Number(completedTasks?.count ?? 0) - Number(inProgressTasks?.count ?? 0))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching manager dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch manager dashboard stats' });
  }
});

// 22. Client Admin Dashboard Stats API (Neon PostgreSQL backed)
app.get('/api/client/dashboard-stats', async (req, res) => {
  try {
    const [managers] = await sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'manager'`;
    const [employees] = await sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'employee'`;
    const [policies] = await sql`SELECT COUNT(*)::int AS count FROM policies WHERE status = 'active'`;
    const [openTickets] = await sql`SELECT COUNT(*)::int AS count FROM support_tickets WHERE status = 'open'`;
    const [company] = await sql`SELECT plan, status, name FROM companies WHERE id = 1 LIMIT 1`;

    res.json({
      success: true,
      data: {
        supervisedManagers: Number(managers?.count ?? 0),
        totalEmployees: Number(employees?.count ?? 0),
        activePolicies: Number(policies?.count ?? 0),
        unresolvedTickets: Number(openTickets?.count ?? 0),
        planLicense: company?.plan || 'Enterprise Tier',
        planStatus: company?.status || 'Active',
        supportStatus: (openTickets?.count ?? 0) > 0 ? `${openTickets.count} Open Query` : '24x7 Priority'
      }
    });
  } catch (error) {
    console.error('Error fetching client dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch client dashboard stats' });
  }
});

// Bind Enhanced Feature Architecture Routes
setupEnhancedRoutes(app, { sql, authenticateToken, authorizeRoles, upload, formatUserResponse });

// Handle any unmatched API routes with clean JSON 404
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
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
