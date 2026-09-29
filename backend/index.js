import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

// MUST USE RENDER PORT!
const PORT = process.env.PORT || 10000;

// Fallback data if Mongo fails
let membersCache = [{ name: "Steve Gilbs", savings: 45500, id: "1" }];
let loansCache = [];

const MemberSchema = new mongoose.Schema({ name: String, savings: Number });
const LoanSchema = new mongoose.Schema({ memberName: String, amount: Number, reason: String, status: { type: String, default: "Pending" } });
const Member = mongoose.model('Member', MemberSchema);
const Loan = mongoose.model('Loan', LoanSchema);

// Connect but DON'T block server start
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("MongoDB Connected OK");
      const count = await Member.countDocuments().catch(()=>0);
      if (count === 0) await Member.create({ name: "Steve Gilbs", savings: 45500 });
    })
    .catch(err => console.log("MongoDB Error:", err.message));
} else {
  console.log("No MONGO_URI - using memory data");
}

app.get("/", (req,res) => res.send("SACCO API LIVE"));

app.get("/api/members", async (req,res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const data = await Member.find();
      return res.json(data);
    }
    res.json(membersCache);
  } catch(e){ res.json(membersCache); }
});

app.get("/api/loans", async (req,res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const data = await Loan.find();
      return res.json(data);
    }
    res.json(loansCache);
  } catch(e){ res.json(loansCache); }
});

app.post("/api/loans", async (req,res) => {
  try {
    const newLoan = { ...req.body, status: "Pending" };
    loansCache.push(newLoan);
    if (mongoose.connection.readyState === 1) {
      const saved = await Loan.create(req.body);
      return res.json(saved);
    }
    res.json(newLoan);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

// CRITICAL FIX - Bind to 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server LIVE on port ${PORT}`);
});