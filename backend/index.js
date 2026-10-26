import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { decisionMessage, sendSms, smsConfigured } from './sms.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const monthsAgo = (n) => new Date(Date.now() - n * 30 * 24 * 60 * 60 * 1000);

const membersCache = [
  { _id: '1', name: 'Steve Gilbs', savings: 45500, joinedAt: monthsAgo(30), hasDefaulted: false },
];

const loansCache = [];
const applicationsCache = [];

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  savings: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  hasDefaulted: { type: Boolean, default: false },
});

const LoanSchema = new mongoose.Schema(
  {
    memberId: { type: String },
    memberName: String,
    amount: { type: Number, required: true },
    reason: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

const ApplicationSchema = new mongoose.Schema(
  {
    memberName: { type: String, required: true },
    idNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    yearOfBirth: { type: String, required: true },
    yearsInSacco: { type: Number, default: 0 },
    savings: { type: Number, default: 0 },
    requestedAmount: { type: Number, default: 0 },
    purpose: { type: String, default: '' },
    hasDefaulted: { type: Boolean, default: false },
    hasLoanOpen: { type: Boolean, default: false },
    isRegularSaver: { type: Boolean, default: false },
    registryStatus: { type: String, default: 'pending' },
    qualificationStatus: { type: String, default: 'pending' },
    status: { type: String, default: 'Pending' },
    applicationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Member = mongoose.model('Member', MemberSchema);
const Loan = mongoose.model('Loan', LoanSchema);
const Application = mongoose.model('Application', ApplicationSchema);

const dbReady = () => mongoose.connection.readyState === 1;

let dbPromise = null;

// Serverless invocations must await the connection; a fire-and-forget connect
// leaves the first requests on a cold start using in-memory data.
function ensureDb() {
  if (!process.env.MONGO_URI) return Promise.resolve(false);
  if (dbReady()) return Promise.resolve(true);
  if (!dbPromise) {
    dbPromise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
      .then(async () => {
        console.log('MongoDB Connected OK');
        const count = await Member.countDocuments().catch(() => 0);
        if (count === 0) {
          await Member.create({
            name: 'Steve Gilbs',
            savings: 45500,
            joinedAt: monthsAgo(30),
            hasDefaulted: false,
          });
        }
        return true;
      })
      .catch((err) => {
        console.log('MongoDB Error:', err.message);
        dbPromise = null;
        return false;
      });
  }
  return dbPromise;
}

if (!process.env.MONGO_URI) {
  console.log('No MONGO_URI - using memory data');
}

app.use('/api', async (req, res, next) => {
  await ensureDb();
  next();
});

function monthsBetween(from, to = new Date()) {
  const d = new Date(from);
  if (isNaN(d)) return 0;
  return (to.getFullYear() - d.getFullYear()) * 12 + (to.getMonth() - d.getMonth());
}

function checkQualification(member, requestedAmount) {
  const savings = member.savings || 0;
  const months = monthsBetween(member.joinedAt);
  const limit = months >= 24 ? savings * 4 : savings * 3;

  if (member.hasDefaulted) {
    return { qualified: false, reason: 'Has previous default', limit };
  }

  if (months < 6) {
    return { qualified: false, reason: 'Member must be 6+ months old', limit };
  }

  if (requestedAmount > limit) {
    return { qualified: false, reason: `Exceeds limit of KES ${limit}`, limit };
  }

  return { qualified: true, limit };
}

function parseApplicationPayload(body) {
  const required = ['memberName', 'idNumber', 'phoneNumber', 'yearOfBirth'];
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      throw new Error(`${field} is required`);
    }
  }

  const requestedAmount = Number(body.requestedAmount || 0);
  const savings = Number(body.savings || 0);
  const yearsInSacco = Number(body.yearsInSacco || 0);

  return {
    memberName: String(body.memberName).trim(),
    idNumber: String(body.idNumber).trim(),
    phoneNumber: String(body.phoneNumber).trim(),
    yearOfBirth: String(body.yearOfBirth).trim(),
    yearsInSacco: Number.isFinite(yearsInSacco) ? yearsInSacco : 0,
    savings: Number.isFinite(savings) ? savings : 0,
    requestedAmount: Number.isFinite(requestedAmount) ? requestedAmount : 0,
    purpose: String(body.purpose || '').trim(),
    hasDefaulted: Boolean(body.hasDefaulted),
    hasLoanOpen: Boolean(body.hasLoanOpen),
    isRegularSaver: Boolean(body.isRegularSaver),
    registryStatus: body.registryStatus || 'pending',
    qualificationStatus: body.qualificationStatus || 'pending',
    status: body.status || 'Pending',
  };
}

app.get('/', (req, res) => res.send('SACCO API LIVE'));

app.get('/api/members', async (req, res) => {
  try {
    if (dbReady()) return res.json(await Member.find());
  } catch (e) {
    // fall through to cache
  }
  res.json(membersCache);
});

app.get('/api/loans', async (req, res) => {
  try {
    if (dbReady()) return res.json(await Loan.find());
  } catch (e) {
    // fall through to cache
  }
  res.json(loansCache);
});

app.get('/api/applications', async (req, res) => {
  try {
    if (dbReady()) {
      const saved = await Application.find().sort({ createdAt: -1 });
      return res.json(saved);
    }
  } catch (e) {
    // fall through to cache
  }

  res.json(applicationsCache.slice().sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)));
});

app.post('/api/applications', async (req, res) => {
  try {
    const payload = parseApplicationPayload(req.body);
    const appData = {
      ...payload,
      applicationDate: new Date().toISOString(),
    };

    if (!dbReady()) appData._id = `mem-${Date.now()}`;

    if (dbReady()) {
      const saved = await Application.create(appData);
      return res.status(201).json(saved);
    }

    applicationsCache.unshift(appData);
    return res.status(201).json(appData);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: dbReady(), sms: smsConfigured() });
});

app.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be Approved or Rejected' });
    }

    let application;

    if (dbReady()) {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid application id' });
      }
      application = await Application.findById(id);
      if (!application) return res.status(404).json({ error: 'Application not found' });
      if (application.status === status) {
        return res.json({ application, sms: { sent: false, skipped: true, error: `Already ${status}` } });
      }
      application.status = status;
      await application.save();
    } else {
      application = applicationsCache.find((item) => String(item._id) === id);
      if (!application) return res.status(404).json({ error: 'Application not found' });
      if (application.status === status) {
        return res.json({ application, sms: { sent: false, skipped: true, error: `Already ${status}` } });
      }
      application.status = status;
    }

    const sms = await sendSms(application.phoneNumber, decisionMessage(application, status));
    if (!sms.sent) console.log('SMS not sent:', sms.error);

    res.json({ application, sms });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/loans/request', async (req, res) => {
  try {
    const { memberId, amount, reason } = req.body;
    const requested = Number(amount);

    if (!memberId || !Number.isFinite(requested) || requested <= 0) {
      return res.status(400).json({ error: 'memberId and a positive amount are required' });
    }

    let member;

    if (dbReady()) {
      if (!mongoose.isValidObjectId(memberId)) {
        return res.status(400).json({ error: 'Invalid memberId' });
      }
      member = await Member.findById(memberId);
    } else {
      member = membersCache.find((m) => m._id === String(memberId));
    }

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const check = checkQualification(member, requested);

    if (!check.qualified) {
      return res.status(400).json({ error: check.reason, limit: check.limit });
    }

    const loanData = {
      memberId: String(member._id),
      memberName: member.name,
      amount: requested,
      reason,
      status: 'Pending',
    };

    if (dbReady()) {
      const saved = await Loan.create(loanData);
      return res.status(201).json(saved);
    }

    loansCache.push(loanData);
    res.status(201).json(loanData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/mpesa/stk-push', (req, res) => {
  const { phoneNumber, amount, reference = 'SACCO-APP', description = 'Loan application deposit' } = req.body || {};

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: 'phoneNumber and amount are required' });
  }

  const response = {
    success: true,
    merchantRequestID: `MR-${Date.now()}`,
    checkoutRequestID: `CR-${Date.now()}`,
    responseCode: '0',
    responseDescription: 'Success. Request accepted by M-Pesa.',
    customerMessage: 'Your payment request has been sent successfully.',
    phoneNumber,
    amount: Number(amount),
    reference,
    description,
  };

  res.status(200).json(response);
});

app.post('/api/mpesa/callback', (req, res) => {
  const callback = req.body || {};
  console.log('M-Pesa callback received:', callback);
  res.status(200).json({ success: true, message: 'Callback received.' });
});

app.post('/api/loans', (req, res) => {
  req.url = '/api/loans/request';
  app.handle(req, res);
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server LIVE on port ${PORT}`);
  });
}

export default app;
