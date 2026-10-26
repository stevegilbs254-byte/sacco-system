import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const monthsAgo = (n) => new Date(Date.now() - n * 30 * 24 * 60 * 60 * 1000);

const membersCache = [
  { _id: '1', name: 'Steve Gilbs', savings: 45500, joinedAt: monthsAgo(30), hasDefaulted: false },
];

const loansCache = [];

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

const Member = mongoose.model('Member', MemberSchema);
const Loan = mongoose.model('Loan', LoanSchema);

const dbReady = () => mongoose.connection.readyState === 1;

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
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
    })
    .catch((err) => console.log('MongoDB Error:', err.message));
} else {
  console.log('No MONGO_URI - using memory data');
}

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

app.post('/api/loans', (req, res) => {
  req.url = '/api/loans/request';
  app.handle(req, res);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server LIVE on port ${PORT}`);
});
