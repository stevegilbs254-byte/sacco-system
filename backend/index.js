require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT TO CLOUD MONGODB
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log('✅ MongoDB Connected - SACCO DB LIVE'))
.catch(err=> console.log('DB Error:', err.message));

const Member = mongoose.model('Member', {
  name:String, email:String, savings:Number, loan:Number
});
const Loan = mongoose.model('Loan', {
  member:String, amount:Number, reason:String, status:String,
  date:{type:Date, default:Date.now}
});

app.get('/', (req,res)=> res.send('SACCO Backend + MongoDB LIVE'));

app.get('/api/members', async (req,res)=>{
  let members = await Member.find();
  if(members.length===0){
    members = await Member.create({
      name:"Steve Gilbs", email:"stevegilbs.254@gmail.com",
      savings:45500, loan:20000
    });
    members = [members];
  }
  res.json(members);
});

app.get('/api/loans', async (req,res)=> {
  const loans = await Loan.find().sort({date:-1});
  res.json(loans);
});

app.post('/api/loans', async (req,res)=>{
  const loan = await Loan.create({
    member:"Steve Gilbs",
    amount:req.body.amount,
    reason:req.body.reason,
    status:"Pending"
  });
  console.log('New Loan Saved to MongoDB:', loan);
  res.json({success:true, loan});
});

app.listen(process.env.PORT||5000, ()=>
  console.log('✅ SACCO Backend running on http://localhost:5000 - KEEP THIS WINDOW OPEN!')
let members = [{id: 1,name: "steve gilbs",saving:45500}];
let loan = []
);