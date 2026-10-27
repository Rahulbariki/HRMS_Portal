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

    const formatUserResponse = (u) => ({
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
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
});

// 3. Auth: Current User (/api/auth/me)
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
      id, email, firstName, lastName, phone, emergencyPhone,
      emergencyContactName, bloodGroup, dob, gender, address,
      workLocation, shift, panNumber, bankAccount, pfNumber, avatarUrl
    } = req.body;

    const targetUser = id || email;
    if (!targetUser) {
      return res.status(400).json({ success: false, message: 'User identifier required' });
    }

    const updated = await sql`
      UPDATE users SET
        first_name = COALESCE(${firstName}, first_name),
        last_name = COALESCE(${lastName}, last_name),
        phone = COALESCE(${phone}, phone),
        emergency_phone = COALESCE(${emergencyPhone}, emergency_phone),
        emergency_contact_name = COALESCE(${emergencyContactName}, emergency_contact_name),
        blood_group = COALESCE(${bloodGroup}, blood_group),
        dob = COALESCE(${dob}, dob),
        gender = COALESCE(${gender}, gender),
        address = COALESCE(${address}, address),
        work_location = COALESCE(${workLocation}, work_location),
        shift = COALESCE(${shift}, shift),
        pan_number = COALESCE(${panNumber}, pan_number),
        bank_account = COALESCE(${bankAccount}, bank_account),
        pf_number = COALESCE(${pfNumber}, pf_number),
        avatar_url = COALESCE(${avatarUrl}, avatar_url)
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
        { label: 'Present', value: String(c.present_count || 18), color: 'success' },
        { label: 'Absent', value: String(c.absent_count || 0), color: 'error' },
        { label: 'Late', value: String(c.late_count || 1), color: 'warning' },
        { label: 'WFH', value: String(c.wfh_count || 1), color: 'accent' },
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
app.patch('/api/leaves/:id/status', async (req, res) => {
  try {
    const leaveId = req.params.id;
    const { status, approvedBy = 'David Chen (Manager)' } = req.body;

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

    const userId = req.body.userId || req.body.email || '';

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'intelliattend/avatars',
      resource_type: 'image',
      public_id: `avatar_${userId || 'user'}_${Date.now()}`
    });

    if (userId) {
      await sql`
        UPDATE users 
        SET avatar_url = ${result.secure_url} 
        WHERE id = ${userId} OR email = ${userId};
      `;
    }

    res.json({
      success: true,
      message: 'Avatar uploaded to Cloudinary object storage and saved to database',
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
