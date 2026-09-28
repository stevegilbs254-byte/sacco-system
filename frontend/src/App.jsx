import { useState, useEffect } from 'react';

const API_URL = "https://sacco-system-zmb4.onrender.com";

function App() {
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Load data from live backend
  const loadData = async () => {
    try {
      const m = await fetch(`${API_URL}/api/members`).then(r => r.json());
      const l = await fetch(`${API_URL}/api/loans`).then(r => r.json());
      setMembers(m);
      setLoans(l);
    } catch (err) {
      console.log("Backend waking up... wait 30 secs");
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh every 5 sec
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  const requestLoan = async (e) => {
    e.preventDefault();
    if (!amount) return alert("Enter amount");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason })
      });
      const data = await res.json();
      if (data.success) {
        alert("Loan Request Sent! ✅");
        setAmount('');
        setReason('');
        loadData();
      }
    } catch (err) {
      alert("Error - Backend sleeping, try again in 30 sec");
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'Arial', background: '#f4f6f9', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <h1 style={{ textAlign: 'center', color: '#1a3d7c' }}>🏦 STEVE SACCO SYSTEM</h1>
        <p style={{ textAlign: 'center', color: 'green' }}>✅ Connected to LIVE Backend: {API_URL}</p>

        {/* STATS */}
        <div style={{ display: 'flex', gap: '15px', margin: '20px 0' }}>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px #ccc' }}>
            <h3>Total Members</h3>
            <h2 style={{ color: '#1a3d7c' }}>{members.length}</h2>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px #ccc' }}>
            <h3>Total Loans</h3>
            <h2 style={{ color: '#e67e22' }}>{loans.length}</h2>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px #ccc' }}>
            <h3>Steve Savings</h3>
            <h2 style={{ color: 'green' }}>Ksh {members[0]?.savings || 45500}</h2>
          </div>
        </div>

        {/* REQUEST LOAN FORM */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
          <h3>💰 Request New Loan</h3>
          <form onSubmit={requestLoan} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="number"
              placeholder="Amount e.g 10000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ padding: '10px', flex: 1, borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="Reason e.g School Fees"
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ padding: '10px', flex: 1, borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#1a3d7c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {loading? 'Sending...' : 'Request Loan'}
            </button>
          </form>
        </div>

        {/* LOANS LIST */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
          <h3>📋 Loan Requests</h3>
          {loans.length === 0? <p>No loans yet. Request one!</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Member</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px' }}>Reason</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{loan.member}</td>
                    <td style={{ padding: '10px' }}>Ksh {loan.amount}</td>
                    <td style={{ padding: '10px' }}>{loan.reason}</td>
                    <td style={{ padding: '10px' }}><span style={{ background: '#ffeaa7', padding: '3px 8px', borderRadius: '10px' }}>{loan.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888' }}>Built by Steve Gilbs | SACCO LIVE System</p>
      </div>
    </div>
  );
}

export default App;