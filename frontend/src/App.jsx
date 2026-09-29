import { useState, useEffect } from 'react';

const API_URL = "https://sacco-system-zmb4.onrender.com";

function App() {
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  // Load data from live backend
  const loadData = async () => {
    try {
      const mRes = await fetch(`${API_URL}/api/members`);
      if (!mRes.ok) throw new Error("Members failed");
      const mData = await mRes.json();

      const lRes = await fetch(`${API_URL}/api/loans`);
      if (!lRes.ok) throw new Error("Loans failed");
      const lData = await lRes.json();

      setMembers(mData);
      setLoans(lData);
      setStatus("✅ Connected to LIVE Backend");
      setLoading(false);
    } catch (err) {
      console.log("Backend waking up...", err);
      setStatus("⏳ Backend sleeping, waking up in 30 sec... Keep this page open");
      // Auto retry
      setTimeout(loadData, 5000);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, []);

  const requestLoan = async (e) => {
    e.preventDefault();
    if (!amount) return alert("Enter amount");
    try {
      const res = await fetch(`${API_URL}/api/loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          memberName: "Steve Gilbs", 
          amount: Number(amount), 
          reason: reason || "General" 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Loan Requested! ✅");
        setAmount("");
        setReason("");
        loadData();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Backend sleeping, try again in 30 sec");
      loadData();
    }
  };

  const totalSavings = members.reduce((sum, m) => sum + (m.savings || 0), 0);

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px', maxWidth: '900px', margin: '0 auto', background: '#f5f7fb', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#1e3a8a' }}>STEVE SACCO SYSTEM</h1>
      <p style={{ textAlign: 'center', background: '#e0f2fe', padding: '10px', borderRadius: '8px' }}>{status}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', margin: '20px 0' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px #0001' }}>
          <h3>Total Members</h3>
          <h1>{loading ? "..." : members.length}</h1>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px #0001' }}>
          <h3>Total Savings</h3>
          <h1>Ksh {totalSavings.toLocaleString()}</h1>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px #0001' }}>
          <h3>Loan Requests</h3>
          <h1>{loading ? "..." : loans.length}</h1>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <h2>Request Loan</h2>
        <form onSubmit={requestLoan} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="number" placeholder="Amount e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '10px', flex: 1, borderRadius: '8px', border: '1px solid #ccc' }} />
          <input type="text" placeholder="Reason e.g. School fees" value={reason} onChange={(e) => setReason(e.target.value)} style={{ padding: '10px', flex: 1, borderRadius: '8px', border: '1px solid #ccc' }} />
          <button type="submit" style={{ padding: '10px 20px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Request</button>
        </form>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
        <h2>Members</h2>
        {members.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}>
            <span>{m.name}</span>
            <strong>Ksh {m.savings?.toLocaleString()}</strong>
          </div>
        ))}
        <h2 style={{ marginTop: '20px' }}>Loan Requests</h2>
        {loans.length === 0 ? <p>No loans yet</p> : loans.map((l, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}>
            <span>{l.memberName} - {l.reason}</span>
            <span>Ksh {l.amount} - <b style={{ color: l.status === 'Approved' ? 'green' : 'orange' }}>{l.status || 'Pending'}</b></span>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>Backend: {API_URL} | Frontend: Live on Vercel</p>
    </div>
  );
}

export default App;