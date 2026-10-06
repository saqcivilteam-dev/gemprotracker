import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'gaela-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Support large payloads for jpeg and pdf uploads/base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initial Default Seed Data
const defaultData = {
  appName: 'Gaela',
  appSubtitle: 'Customizable Multi-Tracker Studio',
  theme: 'slate',
  activeTrackerId: 'tracker-civil',
  users: [
    {
      id: 'admin-1',
      username: 'Admin',
      email: 'admin@gaela.com',
      password: '',
      role: 'admin',
      status: 'approved',
      permission: 'editor',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'staff-david',
      username: 'David Ramos',
      email: 'david.staff@gaela.com',
      password: 'staff123',
      role: 'staff',
      department: 'Site Execution',
      status: 'approved',
      permission: 'editor',
      createdAt: '2026-09-05T09:00:00.000Z',
    },
    {
      id: 'guest-demo',
      username: 'Alex Rivera',
      email: 'alex.rivera@team.com',
      password: 'guest1234',
      role: 'guest',
      department: 'Site Engineering',
      status: 'approved',
      permission: 'editor',
      createdAt: '2026-09-10T09:30:00.000Z',
    },
    {
      id: 'guest-pending',
      username: 'Sarah Chen',
      email: 'sarah.chen@contractor.org',
      password: 'guest1234',
      role: 'guest',
      department: 'Quality Audit',
      status: 'pending',
      permission: 'viewer',
      createdAt: '2026-09-22T14:15:00.000Z',
    }
  ],
  trackerPermissions: [
    {
      id: 'perm-staff-civil',
      userId: 'staff-david',
      trackerId: 'tracker-civil',
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: false,
      canExport: true,
      fieldPermissions: {
        'col-item': 'view',
        'col-station': 'view',
        'col-status': 'edit',
        'col-amount': 'no_access',
        'col-percent': 'edit',
        'col-date': 'view',
        'col-photo': 'edit',
        'col-pdf': 'view',
        'col-notes': 'edit'
      },
      approvedBy: 'Admin (admin@gaela.com)',
      updatedAt: '2026-09-15T10:00:00.000Z'
    },
    {
      id: 'perm-guest-civil',
      userId: 'guest-demo',
      trackerId: 'tracker-civil',
      canView: true,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canExport: false,
      fieldPermissions: {
        'col-amount': 'view',
        'col-item': 'view',
        'col-station': 'view',
        'col-status': 'view'
      },
      approvedBy: 'Admin (admin@gaela.com)',
      updatedAt: '2026-09-12T08:30:00.000Z'
    }
  ],
  accessRequests: [
    {
      id: 'req-1',
      userId: 'guest-demo',
      userName: 'Alex Rivera',
      userEmail: 'alex.rivera@team.com',
      userRole: 'guest',
      trackerId: 'tracker-civil',
      trackerName: 'SAQC & Civil Project Tracker',
      requestedPermissions: {
        view: true,
        add: false,
        edit: true,
        delete: false,
        export: false
      },
      requestedFields: ['col-status', 'col-percent', 'col-notes'],
      reason: 'Need to record daily milestone progress and punchlist notes for civil works handover.',
      status: 'pending',
      createdAt: '2026-09-29T14:30:00.000Z'
    },
    {
      id: 'req-2',
      userId: 'staff-david',
      userName: 'David Ramos',
      userEmail: 'david.staff@gaela.com',
      userRole: 'staff',
      trackerId: 'tracker-budget',
      trackerName: 'Department Budget & Expense Monitor',
      requestedPermissions: {
        view: true,
        add: true,
        edit: true,
        delete: false,
        export: true
      },
      requestedFields: ['b-status', 'b-percent', 'b-vendor'],
      reason: 'Assigned to reconcile vendor invoice settlements and milestone progress for Q4.',
      status: 'pending',
      createdAt: '2026-09-30T10:15:00.000Z'
    }
  ],
  activityLogs: [
    {
      id: 'log-seed-1',
      userId: 'admin-1',
      userName: 'Admin',
      userEmail: 'admin@gaela.com',
      userRole: 'admin',
      trackerId: 'tracker-civil',
      trackerName: 'SAQC & Civil Project Tracker',
      action: 'APPROVE_PERMISSION',
      changedField: 'Tracker Access & Field Permissions',
      oldValue: 'No Access',
      newValue: 'View, Add, Edit, Export (Amount: No Access, Date: View Only)',
      approvedBy: 'Admin (admin@gaela.com)',
      timestamp: '2026-09-15T10:00:00.000Z',
      details: 'Approved Staff access for David Ramos with field-level restrictions.'
    },
    {
      id: 'log-seed-2',
      userId: 'staff-david',
      userName: 'David Ramos',
      userEmail: 'david.staff@gaela.com',
      userRole: 'staff',
      trackerId: 'tracker-civil',
      trackerName: 'SAQC & Civil Project Tracker',
      action: 'EDIT_CELL',
      changedField: 'Status',
      columnId: 'col-status',
      rowId: 'row-2',
      oldValue: 'Review',
      newValue: 'In Progress',
      approvedBy: 'System (Authorized)',
      timestamp: '2026-09-28T16:20:00.000Z',
      details: 'Updated work milestone status.'
    }
  ],
  trackers: [
    {
      id: 'tracker-civil',
      name: 'SAQC & Civil Project Tracker',
      description: 'Site civil works, structural quality check, bill of quantities & milestone inspections.',
      icon: 'Building2',
      color: 'blue',
      summaryCardsCollapsed: false,
      summaryCards: [
        {
          id: 's1',
          title: 'Total Project Value (₱)',
          columnId: 'col-amount',
          calcType: 'sum',
          format: 'currency',
          tag: 'Budget Cap',
          color: 'emerald'
        },
        {
          id: 's2',
          title: 'Avg Quality Progress',
          columnId: 'col-percent',
          calcType: 'average',
          format: 'percent',
          tag: 'Overall Milestone',
          color: 'indigo'
        },
        {
          id: 's3',
          title: 'Total Work Items',
          columnId: 'col-item',
          calcType: 'count',
          format: 'number',
          tag: 'WBS Units',
          color: 'slate'
        },
        {
          id: 's4',
          title: 'Completed Deliverables',
          columnId: 'col-status',
          calcType: 'count-completed',
          format: 'number',
          tag: 'Verified QMS',
          color: 'purple'
        }
      ],
      columns: [
        { id: 'col-item', name: 'Work Item & Description', type: 'text', width: 240, visible: true, color: 'slate' },
        { id: 'col-station', name: 'Station / Zone', type: 'text', width: 140, visible: true, color: 'blue' },
        { id: 'col-status', name: 'Status', type: 'status', width: 140, visible: true, color: 'indigo' },
        { id: 'col-amount', name: 'Contract Amount (₱)', type: 'amount', width: 170, visible: true, color: 'emerald' },
        { id: 'col-percent', name: 'Progress (%)', type: 'percent', width: 140, visible: true, color: 'amber' },
        { id: 'col-date', name: 'Target Inspection', type: 'date', width: 145, visible: true, color: 'rose' },
        { id: 'col-photo', name: 'Site Photo (JPEG)', type: 'jpeg', width: 150, visible: true, color: 'cyan' },
        { id: 'col-pdf', name: 'Inspection Report (PDF)', type: 'pdf', width: 160, visible: true, color: 'purple' },
        { id: 'col-notes', name: 'Engineer Remarks', type: 'text', width: 220, visible: true, color: 'slate' },
      ],
      rows: [
        {
          id: 'row-1',
          'col-item': 'Foundation Excavation & Rebar Reinforcement',
          'col-station': 'Sector A-1',
          'col-status': 'Completed',
          'col-amount': 45000,
          'col-percent': 100,
          'col-date': '2026-09-15',
          'col-photo': 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=500&auto=format&fit=crop&q=80',
          'col-pdf': 'SAQC-Excavation-SignOff-v1.pdf',
          'col-notes': 'Tested concrete batch #491. Passed 28-day compression test with 35MPa.'
        },
        {
          id: 'row-2',
          'col-item': 'Main Structural Steel Beam Framing',
          'col-station': 'Tower Core Level 3',
          'col-status': 'In Progress',
          'col-amount': 82500,
          'col-percent': 75,
          'col-date': '2026-09-28',
          'col-photo': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80',
          'col-pdf': 'Steel-Fabrication-NDT-Report.pdf',
          'col-notes': 'Ultrasonic test 100% accepted on joint welding.'
        },
        {
          id: 'row-3',
          'col-item': 'HVAC & MEP Ducting Installation',
          'col-station': 'Basement B2',
          'col-status': 'In Progress',
          'col-amount': 38200,
          'col-percent': 40,
          'col-date': '2026-10-10',
          'col-photo': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
          'col-pdf': 'MEP-Submittal-Approved.pdf',
          'col-notes': 'Fire damper testing scheduled for next Tuesday.'
        },
        {
          id: 'row-4',
          'col-item': 'Curtain Wall Facade Glazing',
          'col-station': 'North Elevation',
          'col-status': 'Review',
          'col-amount': 95000,
          'col-percent': 25,
          'col-date': '2026-10-25',
          'col-photo': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
          'col-pdf': 'Glazing-Water-Penetration-Spec.pdf',
          'col-notes': 'Thermal acoustic tests completed in laboratory.'
        },
        {
          id: 'row-5',
          'col-item': 'Electrical Transformer & Switchgear',
          'col-station': 'Substation Plant',
          'col-status': 'Pending Approval',
          'col-amount': 62000,
          'col-percent': 10,
          'col-date': '2026-11-05',
          'col-photo': '',
          'col-pdf': 'Switchgear-SingleLineDiagram.pdf',
          'col-notes': 'Awaiting utility provider grid interconnect permit.'
        }
      ]
    },
    {
      id: 'tracker-budget',
      name: 'Department Budget & Expense Monitor',
      description: 'Operating expenditure, contractor invoices, PO tracking and payment milestones.',
      icon: 'BadgeDollarSign',
      color: 'emerald',
      summaryCardsCollapsed: false,
      summaryCards: [
        {
          id: 'b1',
          title: 'Total Invoiced Cost',
          columnId: 'b-amount',
          calcType: 'sum',
          format: 'currency',
          tag: 'Actual vs Budget',
          color: 'emerald'
        },
        {
          id: 'b2',
          title: 'Payment Disbursed %',
          columnId: 'b-percent',
          calcType: 'average',
          format: 'percent',
          tag: 'Cashflow Pace',
          color: 'indigo'
        },
        {
          id: 'b3',
          title: 'Total Line Items',
          columnId: 'b-item',
          calcType: 'count',
          format: 'number',
          tag: 'Vouchers',
          color: 'slate'
        }
      ],
      columns: [
        { id: 'b-item', name: 'Expense Description', type: 'text', width: 220, visible: true, color: 'slate' },
        { id: 'b-vendor', name: 'Vendor / Contractor', type: 'text', width: 170, visible: true, color: 'blue' },
        { id: 'b-status', name: 'Invoice Status', type: 'status', width: 130, visible: true, color: 'indigo' },
        { id: 'b-amount', name: 'Invoice Amount ($)', type: 'amount', width: 150, visible: true, color: 'emerald' },
        { id: 'b-percent', name: 'Paid (%)', type: 'percent', width: 130, visible: true, color: 'amber' },
        { id: 'b-date', name: 'Due Date', type: 'date', width: 140, visible: true, color: 'rose' },
        { id: 'b-receipt', name: 'Receipt JPEG', type: 'jpeg', width: 140, visible: true, color: 'cyan' },
        { id: 'b-pdf', name: 'Invoice PDF', type: 'pdf', width: 150, visible: true, color: 'purple' },
      ],
      rows: [
        {
          id: 'brow-1',
          'b-item': 'Heavy Crane Rental (30-day)',
          'b-vendor': 'Apex Machinery Corp',
          'b-status': 'Completed',
          'b-amount': 18500,
          'b-percent': 100,
          'b-date': '2026-09-10',
          'b-receipt': 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500&auto=format&fit=crop&q=80',
          'b-pdf': 'Apex-Crane-Inv-889.pdf'
        },
        {
          id: 'brow-2',
          'b-item': 'Ready-Mix Concrete 300 cu.m',
          'b-vendor': 'Metro Ready-Mix Inc',
          'b-status': 'In Progress',
          'b-amount': 29400,
          'b-percent': 50,
          'b-date': '2026-09-30',
          'b-receipt': '',
          'b-pdf': 'Metro-BatchReceipts.pdf'
        }
      ]
    },
    {
      id: 'tracker-equipment',
      name: 'Equipment & Tool Inventory',
      description: 'Machinery allocation, inspection validity, maintenance and digital manuals.',
      icon: 'Wrench',
      color: 'purple',
      summaryCardsCollapsed: false,
      summaryCards: [
        {
          id: 'e1',
          title: 'Equipment Asset Value',
          columnId: 'e-value',
          calcType: 'sum',
          format: 'currency',
          tag: 'Fleet Total',
          color: 'emerald'
        },
        {
          id: 'e2',
          title: 'Fleet Operational Health',
          columnId: 'e-health',
          calcType: 'average',
          format: 'percent',
          tag: 'Readiness',
          color: 'indigo'
        },
        {
          id: 'e3',
          title: 'Tracked Assets',
          columnId: 'e-asset',
          calcType: 'count',
          format: 'number',
          tag: 'Active Units',
          color: 'slate'
        }
      ],
      columns: [
        { id: 'e-asset', name: 'Equipment / Tool Name', type: 'text', width: 220, visible: true, color: 'slate' },
        { id: 'e-serial', name: 'Serial / Plate #', type: 'text', width: 140, visible: true, color: 'slate' },
        { id: 'e-status', name: 'Operational State', type: 'status', width: 140, visible: true, color: 'indigo' },
        { id: 'e-value', name: 'Asset Value ($)', type: 'amount', width: 150, visible: true, color: 'emerald' },
        { id: 'e-health', name: 'Condition (%)', type: 'percent', width: 130, visible: true, color: 'amber' },
        { id: 'e-date', name: 'Next Calibration', type: 'date', width: 140, visible: true, color: 'rose' },
        { id: 'e-photo', name: 'Asset Photo (JPEG)', type: 'jpeg', width: 140, visible: true, color: 'cyan' },
        { id: 'e-pdf', name: 'Safety Certificate (PDF)', type: 'pdf', width: 160, visible: true, color: 'purple' },
      ],
      rows: [
        {
          id: 'erow-1',
          'e-asset': 'Total Station Theodolite TS-16',
          'e-serial': 'LEICA-773921',
          'e-status': 'Completed',
          'e-value': 14200,
          'e-health': 98,
          'e-date': '2026-12-01',
          'e-photo': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
          'e-pdf': 'Leica-Calibration-Cert-2026.pdf'
        },
        {
          id: 'erow-2',
          'e-asset': 'Hydraulic Excavator CAT 320',
          'e-serial': 'CAT-EX-99014',
          'e-status': 'In Progress',
          'e-value': 165000,
          'e-health': 85,
          'e-date': '2026-10-15',
          'e-photo': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
          'e-pdf': 'CAT320-Safety-Manual.pdf'
        }
      ]
    }
  ]
};

// Read database with automatic schema migration
function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      let needsSave = false;

      if (!data.trackerPermissions || !Array.isArray(data.trackerPermissions)) {
        data.trackerPermissions = defaultData.trackerPermissions || [];
        needsSave = true;
      }
      if (!data.accessRequests || !Array.isArray(data.accessRequests)) {
        data.accessRequests = defaultData.accessRequests || [];
        needsSave = true;
      }
      if (!data.activityLogs || !Array.isArray(data.activityLogs)) {
        data.activityLogs = defaultData.activityLogs || [];
        needsSave = true;
      }
      if (!data.users || !Array.isArray(data.users)) {
        data.users = defaultData.users;
        needsSave = true;
      } else {
        // Ensure staff-david exists
        if (!data.users.some((u: any) => u.id === 'staff-david' || u.role === 'staff')) {
          data.users.push({
            id: 'staff-david',
            username: 'David Ramos',
            email: 'david.staff@gaela.com',
            password: 'staff123',
            role: 'staff',
            department: 'Site Execution',
            status: 'approved',
            permission: 'editor',
            createdAt: '2026-09-05T09:00:00.000Z',
          });
          needsSave = true;
        }
      }

      if (needsSave) {
        writeDB(data);
      }
      return data;
    }
  } catch (err) {
    console.error('Error reading DB file, using default seed:', err);
  }
  // Initialize file
  writeDB(defaultData);
  return defaultData;
}

// Write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB file:', err);
    return false;
  }
}

// Helper: resolve calling user from header or payload
function getCallingUser(req: Request, data: any) {
  const userId = (req.headers['x-user-id'] as string) || req.body?.currentUserId;
  if (!userId) return null;
  return data.users?.find((u: any) => u.id === userId) || null;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Server status
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    cloudDatabase: 'Gaela Cloud Shared DB',
    timestamp: new Date().toISOString()
  });
});

// Fetch full synchronized state
app.get('/api/data', (req: Request, res: Response) => {
  const data = readDB();
  res.json(data);
});

// Save synchronized state with backend security checks
app.post('/api/data', (req: Request, res: Response) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const current = readDB();
  const caller = getCallingUser(req, current);

  // SECURITY ENFORCEMENT:
  // If caller is NOT Admin, they cannot directly modify sensitive structures:
  // 1. Cannot modify users or give themselves roles
  // 2. Cannot modify trackerPermissions
  // 3. Cannot directly alter accessRequests approval
  if (caller && caller.role !== 'admin') {
    // Preserve existing users, permissions, and requests
    if (incoming.users) {
      delete incoming.users;
    }
    if (incoming.trackerPermissions) {
      delete incoming.trackerPermissions;
    }
    if (incoming.accessRequests) {
      delete incoming.accessRequests;
    }

    // Check tracker mutations:
    // If incoming trackers are provided, verify caller's permissions for any changed tracker
    if (incoming.trackers && Array.isArray(incoming.trackers)) {
      for (const incTracker of incoming.trackers) {
        const curTracker = current.trackers?.find((t: any) => t.id === incTracker.id);
        if (!curTracker) {
          // Non-admin cannot create new trackers without Admin role
          return res.status(403).json({ error: 'Forbidden: Only Administrators can create new trackers' });
        }

        // Check user permission on this tracker
        const userPerm = current.trackerPermissions?.find(
          (p: any) => p.userId === caller.id && p.trackerId === incTracker.id
        );

        if (caller.role === 'staff' && (!userPerm || !userPerm.canView)) {
          return res.status(403).json({ error: `Forbidden: Staff access to tracker "${incTracker.name || incTracker.id}" is not approved by Administrator.` });
        }

        // Check if rows were added
        if (incTracker.rows && curTracker.rows) {
          if (incTracker.rows.length > curTracker.rows.length) {
            if (userPerm && !userPerm.canAdd) {
              return res.status(403).json({ error: 'Forbidden: You do not have permission to ADD rows to this tracker.' });
            }
          }
          // Check if rows were deleted
          if (incTracker.rows.length < curTracker.rows.length) {
            if (userPerm && !userPerm.canDelete) {
              return res.status(403).json({ error: 'Forbidden: You do not have permission to DELETE rows from this tracker.' });
            }
          }

          // Check Field-Level Editing Permissions
          if (userPerm && userPerm.fieldPermissions) {
            const fieldPerms = userPerm.fieldPermissions;
            for (const incRow of incTracker.rows) {
              const curRow = curTracker.rows.find((r: any) => r.id === incRow.id);
              if (curRow) {
                // Check every column for edits
                for (const col of incTracker.columns || []) {
                  const oldVal = curRow[col.id];
                  const newVal = incRow[col.id];
                  if (oldVal !== newVal && newVal !== undefined) {
                    const access = fieldPerms[col.id] || (userPerm.canEdit ? 'edit' : 'view');
                    if (access !== 'edit') {
                      return res.status(403).json({
                        error: `Forbidden: Field "${col.name || col.id}" is restricted to "${access.toUpperCase()}". Editing is not approved.`
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const merged = {
    ...current,
    ...incoming,
    // Preserve critical system tables if non-admin
    users: (caller && caller.role !== 'admin') ? current.users : (incoming.users || current.users),
    trackerPermissions: (caller && caller.role !== 'admin') ? current.trackerPermissions : (incoming.trackerPermissions || current.trackerPermissions),
    accessRequests: (caller && caller.role !== 'admin') ? current.accessRequests : (incoming.accessRequests || current.accessRequests),
    activityLogs: incoming.activityLogs || current.activityLogs || [],
    lastSyncedAt: new Date().toISOString()
  };

  const success = writeDB(merged);
  if (success) {
    res.json({ success: true, timestamp: merged.lastSyncedAt });
  } else {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

// Save or Update Tracker Permission (Admin Only)
app.post('/api/permissions/save', (req: Request, res: Response) => {
  const { adminUserId, permission } = req.body;
  const data = readDB();

  // Verify Admin authorization
  const admin = data.users.find((u: any) => u.id === adminUserId && u.role === 'admin');
  if (!admin) {
    return res.status(403).json({ error: 'Forbidden: Only Administrators can configure permissions.' });
  }

  if (!permission || !permission.userId || !permission.trackerId) {
    return res.status(400).json({ error: 'userId and trackerId are required in permission.' });
  }

  if (!data.trackerPermissions) data.trackerPermissions = [];
  const idx = data.trackerPermissions.findIndex(
    (p: any) => p.userId === permission.userId && p.trackerId === permission.trackerId
  );

  const targetUser = data.users.find((u: any) => u.id === permission.userId);
  const targetTracker = data.trackers.find((t: any) => t.id === permission.trackerId);

  const updatedPerm = {
    ...permission,
    id: permission.id || `perm-${permission.userId}-${permission.trackerId}`,
    approvedBy: `${admin.username} (${admin.email})`,
    updatedAt: new Date().toISOString()
  };

  if (idx !== -1) {
    data.trackerPermissions[idx] = updatedPerm;
  } else {
    data.trackerPermissions.push(updatedPerm);
  }

  // Record in Activity Log
  if (!data.activityLogs) data.activityLogs = [];
  data.activityLogs.unshift({
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId: admin.id,
    userName: admin.username,
    userEmail: admin.email,
    userRole: 'admin',
    trackerId: targetTracker?.id,
    trackerName: targetTracker?.name,
    action: 'UPDATE_PERMISSION',
    changedField: 'Access & Field Permissions',
    oldValue: idx !== -1 ? 'Previous Permission' : 'No Permission',
    newValue: `View:${updatedPerm.canView ? 'Y' : 'N'} Add:${updatedPerm.canAdd ? 'Y' : 'N'} Edit:${updatedPerm.canEdit ? 'Y' : 'N'} Delete:${updatedPerm.canDelete ? 'Y' : 'N'} Export:${updatedPerm.canExport ? 'Y' : 'N'}`,
    approvedBy: admin.username,
    timestamp: new Date().toISOString(),
    details: `Configured permissions for ${targetUser?.username || permission.userId} on ${targetTracker?.name || permission.trackerId}.`
  });

  writeDB(data);
  res.json({ success: true, trackerPermissions: data.trackerPermissions, activityLogs: data.activityLogs });
});

// Revoke Tracker Permission (Admin Only)
app.post('/api/permissions/revoke', (req: Request, res: Response) => {
  const { adminUserId, userId, trackerId } = req.body;
  const data = readDB();

  const admin = data.users.find((u: any) => u.id === adminUserId && u.role === 'admin');
  if (!admin) {
    return res.status(403).json({ error: 'Forbidden: Only Administrators can revoke permissions.' });
  }

  if (!data.trackerPermissions) data.trackerPermissions = [];
  data.trackerPermissions = data.trackerPermissions.filter(
    (p: any) => !(p.userId === userId && p.trackerId === trackerId)
  );

  const targetUser = data.users.find((u: any) => u.id === userId);
  const targetTracker = data.trackers.find((t: any) => t.id === trackerId);

  // Update any existing access request status to revoked
  if (data.accessRequests) {
    data.accessRequests.forEach((r: any) => {
      if (r.userId === userId && r.trackerId === trackerId && r.status === 'approved') {
        r.status = 'revoked';
      }
    });
  }

  // Record in Activity Log
  if (!data.activityLogs) data.activityLogs = [];
  data.activityLogs.unshift({
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId: admin.id,
    userName: admin.username,
    userEmail: admin.email,
    userRole: 'admin',
    trackerId: targetTracker?.id,
    trackerName: targetTracker?.name,
    action: 'REVOKE_PERMISSION',
    changedField: 'Access Status',
    oldValue: 'Approved',
    newValue: 'Revoked (No Access)',
    approvedBy: admin.username,
    timestamp: new Date().toISOString(),
    details: `Revoked access for user ${targetUser?.username || userId} on tracker ${targetTracker?.name || trackerId}.`
  });

  writeDB(data);
  res.json({
    success: true,
    trackerPermissions: data.trackerPermissions,
    accessRequests: data.accessRequests,
    activityLogs: data.activityLogs
  });
});

// Submit Access Request (Staff or Guest)
app.post('/api/access-requests/create', (req: Request, res: Response) => {
  const { userId, trackerId, requestedPermissions, requestedFields, reason } = req.body;
  if (!userId || !trackerId) {
    return res.status(400).json({ error: 'userId and trackerId are required.' });
  }

  const data = readDB();
  const user = data.users.find((u: any) => u.id === userId);
  const tracker = data.trackers.find((t: any) => t.id === trackerId);

  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (!tracker) return res.status(404).json({ error: 'Tracker not found.' });

  const newRequest = {
    id: 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId: user.id,
    userName: user.username,
    userEmail: user.email,
    userRole: user.role,
    trackerId: tracker.id,
    trackerName: tracker.name,
    requestedPermissions: requestedPermissions || { view: true, add: false, edit: true, delete: false, export: false },
    requestedFields: requestedFields || [],
    reason: reason ? reason.trim() : 'Requested access to perform duties.',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (!data.accessRequests) data.accessRequests = [];
  data.accessRequests.unshift(newRequest);

  // Record in Activity Log
  if (!data.activityLogs) data.activityLogs = [];
  data.activityLogs.unshift({
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId: user.id,
    userName: user.username,
    userEmail: user.email,
    userRole: user.role,
    trackerId: tracker.id,
    trackerName: tracker.name,
    action: 'CREATE_ACCESS_REQUEST',
    changedField: 'Access Request',
    oldValue: 'None',
    newValue: `Requested [${Object.keys(newRequest.requestedPermissions).filter((k: any) => (newRequest.requestedPermissions as any)[k]).join(', ')}]`,
    timestamp: new Date().toISOString(),
    details: `Access request submitted for ${tracker.name}: "${newRequest.reason}"`
  });

  writeDB(data);
  res.json({ success: true, accessRequest: newRequest, accessRequests: data.accessRequests });
});

// Admin Review Access Request (Approve, Reject, Edit Permission, Revoke)
app.post('/api/access-requests/review', (req: Request, res: Response) => {
  const { adminUserId, requestId, action, permissions, adminNote } = req.body;
  const data = readDB();

  const admin = data.users.find((u: any) => u.id === adminUserId && u.role === 'admin');
  if (!admin) {
    return res.status(403).json({ error: 'Forbidden: Only Administrators can review access requests.' });
  }

  if (!data.accessRequests) data.accessRequests = [];
  const reqItem = data.accessRequests.find((r: any) => r.id === requestId);
  if (!reqItem) {
    return res.status(404).json({ error: 'Access request not found.' });
  }

  reqItem.reviewedBy = `${admin.username} (${admin.email})`;
  reqItem.reviewedAt = new Date().toISOString();
  if (adminNote) reqItem.adminNote = adminNote.trim();

  if (!data.trackerPermissions) data.trackerPermissions = [];
  if (!data.activityLogs) data.activityLogs = [];

  const targetTracker = data.trackers.find((t: any) => t.id === reqItem.trackerId);

  if (action === 'approve' || action === 'edit-approve') {
    reqItem.status = 'approved';

    // Build or update permission
    const existingIdx = data.trackerPermissions.findIndex(
      (p: any) => p.userId === reqItem.userId && p.trackerId === reqItem.trackerId
    );

    // Build field permissions
    const fieldPerms: Record<string, string> = {};
    if (permissions?.fieldPermissions) {
      Object.assign(fieldPerms, permissions.fieldPermissions);
    } else {
      // Default from requested fields
      for (const col of targetTracker?.columns || []) {
        if (reqItem.requestedFields?.includes(col.id)) {
          fieldPerms[col.id] = 'edit';
        } else {
          fieldPerms[col.id] = permissions?.canEdit ? 'edit' : 'view';
        }
      }
    }

    const newPerm = {
      id: `perm-${reqItem.userId}-${reqItem.trackerId}`,
      userId: reqItem.userId,
      trackerId: reqItem.trackerId,
      canView: permissions?.canView !== undefined ? permissions.canView : (reqItem.requestedPermissions.view ?? true),
      canAdd: permissions?.canAdd !== undefined ? permissions.canAdd : (reqItem.requestedPermissions.add ?? false),
      canEdit: permissions?.canEdit !== undefined ? permissions.canEdit : (reqItem.requestedPermissions.edit ?? true),
      canDelete: permissions?.canDelete !== undefined ? permissions.canDelete : (reqItem.requestedPermissions.delete ?? false),
      canExport: permissions?.canExport !== undefined ? permissions.canExport : (reqItem.requestedPermissions.export ?? false),
      fieldPermissions: fieldPerms,
      approvedBy: `${admin.username} (${admin.email})`,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      data.trackerPermissions[existingIdx] = newPerm;
    } else {
      data.trackerPermissions.push(newPerm);
    }

    data.activityLogs.unshift({
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: admin.id,
      userName: admin.username,
      userEmail: admin.email,
      userRole: 'admin',
      trackerId: reqItem.trackerId,
      trackerName: reqItem.trackerName,
      action: 'APPROVE_REQUEST',
      changedField: 'Access Request & Permissions',
      oldValue: 'Pending Request',
      newValue: `Approved: View:${newPerm.canView ? 'Y' : 'N'} Add:${newPerm.canAdd ? 'Y' : 'N'} Edit:${newPerm.canEdit ? 'Y' : 'N'} Delete:${newPerm.canDelete ? 'Y' : 'N'} Export:${newPerm.canExport ? 'Y' : 'N'}`,
      approvedBy: admin.username,
      timestamp: new Date().toISOString(),
      details: `Approved access for ${reqItem.userName} on tracker ${reqItem.trackerName}. Note: ${adminNote || 'None'}`
    });
  } else if (action === 'reject') {
    reqItem.status = 'rejected';

    data.activityLogs.unshift({
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: admin.id,
      userName: admin.username,
      userEmail: admin.email,
      userRole: 'admin',
      trackerId: reqItem.trackerId,
      trackerName: reqItem.trackerName,
      action: 'REJECT_REQUEST',
      changedField: 'Access Request Status',
      oldValue: 'Pending',
      newValue: 'Rejected',
      approvedBy: admin.username,
      timestamp: new Date().toISOString(),
      details: `Rejected access request by ${reqItem.userName} for ${reqItem.trackerName}. Reason: ${adminNote || 'Declined by Administrator'}`
    });
  } else if (action === 'revoke') {
    reqItem.status = 'revoked';

    data.trackerPermissions = data.trackerPermissions.filter(
      (p: any) => !(p.userId === reqItem.userId && p.trackerId === reqItem.trackerId)
    );

    data.activityLogs.unshift({
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: admin.id,
      userName: admin.username,
      userEmail: admin.email,
      userRole: 'admin',
      trackerId: reqItem.trackerId,
      trackerName: reqItem.trackerName,
      action: 'REVOKE_PERMISSION',
      changedField: 'Access Status',
      oldValue: 'Approved',
      newValue: 'Revoked',
      approvedBy: admin.username,
      timestamp: new Date().toISOString(),
      details: `Revoked access for ${reqItem.userName} on ${reqItem.trackerName}.`
    });
  }

  writeDB(data);
  res.json({
    success: true,
    accessRequests: data.accessRequests,
    trackerPermissions: data.trackerPermissions,
    activityLogs: data.activityLogs
  });
});

// User Management (Admin Only)
app.post('/api/users/manage', (req: Request, res: Response) => {
  const { adminUserId, targetUserId, action, role, status, department, password, username, email } = req.body;
  const data = readDB();

  const admin = data.users.find((u: any) => u.id === adminUserId && u.role === 'admin');
  if (!admin) {
    return res.status(403).json({ error: 'Forbidden: Only Administrators can manage user accounts and roles.' });
  }

  if (action === 'create') {
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (data.users.some((u: any) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const newUser = {
      id: 'user-' + Date.now(),
      username: username.trim(),
      email: cleanEmail,
      password: password ? password.trim() : 'user123',
      role: role || 'staff', // Admin, Staff, Guest
      department: department ? department.trim() : 'Operations',
      status: status || 'approved',
      permission: role === 'admin' ? 'editor' : 'viewer',
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);

    if (!data.activityLogs) data.activityLogs = [];
    data.activityLogs.unshift({
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: admin.id,
      userName: admin.username,
      userEmail: admin.email,
      userRole: 'admin',
      action: 'CREATE_USER',
      changedField: 'User Account',
      oldValue: null,
      newValue: `${newUser.username} (${newUser.role})`,
      approvedBy: admin.username,
      timestamp: new Date().toISOString(),
      details: `Created new user account: ${newUser.username} with role ${newUser.role}.`
    });

    writeDB(data);
    return res.json({ success: true, users: data.users, activityLogs: data.activityLogs });
  }

  const userIdx = data.users.findIndex((u: any) => u.id === targetUserId);
  if (userIdx === -1) {
    return res.status(404).json({ error: 'Target user not found.' });
  }

  const targetUser = data.users[userIdx];
  const oldRole = targetUser.role;

  if (action === 'update-role' && role) {
    targetUser.role = role;
    if (!data.activityLogs) data.activityLogs = [];
    data.activityLogs.unshift({
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: admin.id,
      userName: admin.username,
      userEmail: admin.email,
      userRole: 'admin',
      action: 'UPDATE_ROLE',
      changedField: 'User Role',
      oldValue: oldRole,
      newValue: role,
      approvedBy: admin.username,
      timestamp: new Date().toISOString(),
      details: `Changed role for ${targetUser.username} from ${oldRole} to ${role}.`
    });
  } else if (action === 'update-status' && status) {
    targetUser.status = status;
  } else if (action === 'reset-password' && password) {
    targetUser.password = password.trim();
  } else if (action === 'delete') {
    data.users.splice(userIdx, 1);
    // Cleanup permissions
    if (data.trackerPermissions) {
      data.trackerPermissions = data.trackerPermissions.filter((p: any) => p.userId !== targetUserId);
    }
  }

  writeDB(data);
  res.json({ success: true, users: data.users, activityLogs: data.activityLogs });
});

// Append to Activity Logs
app.post('/api/activity-logs', (req: Request, res: Response) => {
  const logEntry = req.body;
  if (!logEntry || !logEntry.action) {
    return res.status(400).json({ error: 'Valid logEntry is required.' });
  }

  const data = readDB();
  if (!data.activityLogs) data.activityLogs = [];

  const completeLog = {
    ...logEntry,
    id: logEntry.id || 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: logEntry.timestamp || new Date().toISOString()
  };

  data.activityLogs.unshift(completeLog);
  // Cap at 1000 logs
  if (data.activityLogs.length > 1000) {
    data.activityLogs = data.activityLogs.slice(0, 1000);
  }

  writeDB(data);
  res.json({ success: true, log: completeLog });
});

// Fetch Activity Logs with optional filtering
app.get('/api/activity-logs', (req: Request, res: Response) => {
  const data = readDB();
  const { trackerId, userId, action } = req.query;
  let logs = data.activityLogs || [];

  if (trackerId) {
    logs = logs.filter((l: any) => l.trackerId === trackerId);
  }
  if (userId) {
    logs = logs.filter((l: any) => l.userId === userId);
  }
  if (action) {
    logs = logs.filter((l: any) => l.action === action);
  }

  res.json(logs);
});

// Register guest endpoint
app.post('/api/auth/register-guest', (req: Request, res: Response) => {
  const { username, email, password, department, requestedRole } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const data = readDB();
  const existing = data.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email already registered. Please log in or wait for admin approval.' });
  }

  const newUser = {
    id: 'user-' + Date.now(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role: (requestedRole === 'staff' ? 'staff' : 'guest'),
    department: department ? department.trim() : 'General',
    status: 'pending', // Requires admin approval!
    permission: 'viewer',
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);

  if (!data.activityLogs) data.activityLogs = [];
  data.activityLogs.unshift({
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId: newUser.id,
    userName: newUser.username,
    userEmail: newUser.email,
    userRole: newUser.role,
    action: 'REGISTER_ACCOUNT',
    changedField: 'Account Registration',
    oldValue: null,
    newValue: `Pending Approval (${newUser.role})`,
    timestamp: new Date().toISOString(),
    details: `User registered as ${newUser.role}. Awaiting Administrator approval.`
  });

  writeDB(data);

  res.json({
    success: true,
    message: 'Registration submitted successfully! Your account is pending Administrator approval.',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      status: newUser.status,
      role: newUser.role
    }
  });
});

// Admin approves/rejects guest or staff
app.post('/api/auth/manage-guest', (req: Request, res: Response) => {
  const { userId, action, permission, role } = req.body;
  if (!userId || !action) {
    return res.status(400).json({ error: 'userId and action are required' });
  }

  const data = readDB();
  const userIndex = data.users.findIndex((u: any) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (action === 'approve') {
    data.users[userIndex].status = 'approved';
    if (role) {
      data.users[userIndex].role = role;
    }
    if (permission) {
      data.users[userIndex].permission = permission; // 'editor' or 'viewer'
    }
  } else if (action === 'reject') {
    data.users[userIndex].status = 'rejected';
  } else if (action === 'delete') {
    data.users.splice(userIndex, 1);
  } else if (action === 'change-permission') {
    data.users[userIndex].permission = permission || 'viewer';
  }

  writeDB(data);
  res.json({ success: true, users: data.users });
});

// Admin or user change password endpoint
app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const { username, currentPassword, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Username and new password are required' });
  }

  if (newPassword.trim().length < 3) {
    return res.status(400).json({ error: 'New password must be at least 3 characters long' });
  }

  const data = readDB();
  const cleanUser = username.trim().toLowerCase();
  const user = data.users.find((u: any) => 
    u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
  );

  if (!user) {
    return res.status(404).json({ error: `User "${username}" not found` });
  }

  // If user has existing password and currentPassword was provided, verify it (unless empty)
  if (user.password && currentPassword && user.password !== currentPassword.trim()) {
    return res.status(400).json({ error: 'Current password does not match' });
  }

  user.password = newPassword.trim();
  writeDB(data);

  res.json({
    success: true,
    message: `Password for ${user.username} updated successfully!`,
    userId: user.id
  });
});

// Vite dev server mounting or static serving
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Gaela Tracker Server] running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch(err => {
  console.error('Failed to start server:', err);
});
