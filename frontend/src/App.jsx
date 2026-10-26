import { useMemo, useState } from 'react';
import './App.css';

const registry = [
  { idNumber: '12345678', name: 'Steve Gilbs', yearOfBirth: '1990', phoneNumber: '0712345678' },
  { idNumber: '87654321', name: 'Jane Wanjiku', yearOfBirth: '1988', phoneNumber: '0723456789' },
  { idNumber: '24681357', name: 'Paul Otieno', yearOfBirth: '1995', phoneNumber: '0734567890' },
  { idNumber: '98765432', name: 'Mary Njeri', yearOfBirth: '1992', phoneNumber: '0745678901' },
];

const starterApplications = [
  {
    id: 1,
    memberName: 'Steve Gilbs',
    purpose: 'School fees',
    amount: 120000,
    status: 'Approved',
    date: '2026-10-20',
  },
  {
    id: 2,
    memberName: 'Jane Wanjiku',
    purpose: 'Business expansion',
    amount: 95000,
    status: 'Pending',
    date: '2026-10-22',
  },
  {
    id: 3,
    memberName: 'Paul Otieno',
    purpose: 'Emergency fund',
    amount: 70000,
    status: 'Reviewed',
    date: '2026-10-23',
  },
];

const initialChats = [
  { sender: 'bot', text: 'Hi! I am the SACCO assistant. Ask me about qualification rules, approval process, or loan limits.' },
];

const defaultProfile = {
  memberName: 'Steve Gilbs',
  idNumber: '12345678',
  phoneNumber: '0712345678',
  yearOfBirth: '1990',
  yearsInSacco: '12',
  savings: '45000',
  requestedAmount: '120000',
  purpose: 'School fees',
  hasDefaulted: false,
  hasLoanOpen: false,
  isRegularSaver: true,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

function verifyAgainstRegistry(profile) {
  const match = registry.find(
    (item) =>
      item.idNumber === String(profile.idNumber || '').trim() &&
      item.name.trim().toLowerCase() === String(profile.memberName || '').trim().toLowerCase() &&
      item.yearOfBirth === String(profile.yearOfBirth || '').trim() &&
      item.phoneNumber === String(profile.phoneNumber || '').trim()
  );

  return match
    ? { verified: true, message: 'Registration confirmed. We found your record in the national registry.' }
    : { verified: false, message: 'We could not match your details to the registry. Please review your records.' };
}

function getQualification(profile) {
  const months = toNumber(profile.yearsInSacco);
  const savings = toNumber(profile.savings);
  const requestedAmount = toNumber(profile.requestedAmount);
  const limit = months >= 24 ? savings * 4 : savings * 3;

  if (profile.hasDefaulted) {
    return {
      qualified: false,
      reason: 'A previous default is still recorded, so the application cannot proceed.',
      limit,
    };
  }

  if (months < 6) {
    return {
      qualified: false,
      reason: 'You need to be a member for at least 6 months before you can apply.',
      limit,
    };
  }

  if (requestedAmount > limit) {
    return {
      qualified: false,
      reason: `The requested loan exceeds your limit of ${formatCurrency(limit)}.`,
      limit,
    };
  }

  return {
    qualified: true,
    reason: 'You qualify for the requested loan based on your SACCO record and savings pattern.',
    limit,
  };
}

function App() {
  const [profile, setProfile] = useState(defaultProfile);
  const [applications, setApplications] = useState(starterApplications);
  const [view, setView] = useState('member');
  const [chatMessages, setChatMessages] = useState(initialChats);
  const [chatInput, setChatInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const registryStatus = useMemo(() => verifyAgainstRegistry(profile), [profile]);
  const qualification = useMemo(() => getQualification(profile), [profile]);

  const updateField = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  const handleSubmit = () => {
    const nextApp = {
      id: Date.now(),
      memberName: profile.memberName,
      purpose: profile.purpose,
      amount: Number(profile.requestedAmount || 0),
      status: qualification.qualified ? 'Pending' : 'Review required',
      date: new Date().toISOString().slice(0, 10),
    };

    setApplications((current) => [nextApp, ...current]);
    setStatusMessage(
      qualification.qualified
        ? 'Application submitted and sent to the admin panel for review.'
        : 'Your application is saved, but it needs verification before approval.'
    );
  };

  const updateLoanStatus = (id, status) => {
    setApplications((current) =>
      current.map((application) =>
        application.id === id ? { ...application, status } : application
      )
    );
  };

  const sendBotQuestion = () => {
    const text = chatInput.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    let answer = 'I can help with loan limits, approval steps, and member verification.';

    if (lower.includes('loan') || lower.includes('limit')) {
      answer = `Your current loan limit is ${formatCurrency(qualification.limit)} based on your savings and membership period.`;
    } else if (lower.includes('approve') || lower.includes('process')) {
      answer = 'Applications are reviewed for member identity, savings history, default status, and whether the requested amount is within the approved limit.';
    } else if (lower.includes('how') && lower.includes('apply')) {
      answer = 'Fill in your member details, confirm your identity, request an amount, and submit the application for admin review.';
    } else if (lower.includes('member') || lower.includes('id')) {
      answer = `Your member profile shows ${profile.memberName} with ID ${profile.idNumber}. Registration status is ${registryStatus.verified ? 'verified' : 'pending review'}.`;
    }

    setChatMessages((current) => [...current, { sender: 'user', text }, { sender: 'bot', text: answer }]);
    setChatInput('');
  };

  const totalApproved = applications.filter((item) => item.status === 'Approved').length;
  const pendingReviews = applications.filter((item) => item.status === 'Pending' || item.status === 'Review required' || item.status === 'Reviewed').length;
  const totalAmount = applications.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">S</div>
          <div>
            <p className="small-label">SACCO</p>
            <h2>MemberHub</h2>
          </div>
        </div>

        <nav className="nav-menu">
          <button className={view === 'member' ? 'nav-item active' : 'nav-item'} onClick={() => setView('member')}>
            Member portal
          </button>
          <button className={view === 'admin' ? 'nav-item active' : 'nav-item'} onClick={() => setView('admin')}>
            Admin dashboard
          </button>
        </nav>

        <div className="mini-balance">
          <span>Total portfolio</span>
          <strong>{formatCurrency(totalAmount)}</strong>
        </div>
      </aside>

      <section className="main-panel">
        {view === 'member' ? (
          <>
            <header className="welcome-section">
              <div className="welcome-copy">
                <p className="eyebrow">Welcome back</p>
                <h1>Welcome, {profile.memberName} 👋</h1>
                <p className="welcome-text">
                  Your SACCO journey is almost ready. Review your details, confirm registration, and submit your application.
                </p>
              </div>

              <div className="cartoon-wrap" aria-label="Animated welcome mascot">
                <div className="cartoon">
                  <div className="face">
                    <span className="eye left" />
                    <span className="eye right" />
                    <span className="smile" />
                  </div>
                  <div className="body" />
                  <div className="arm left" />
                  <div className="arm right" />
                </div>
              </div>
            </header>

            <div className="stats-grid">
              <div className="stat-card accent">
                <span>Member savings</span>
                <strong>{formatCurrency(profile.savings)}</strong>
              </div>
              <div className="stat-card">
                <span>Loan limit</span>
                <strong>{formatCurrency(qualification.limit)}</strong>
              </div>
              <div className="stat-card">
                <span>Approved</span>
                <strong>{totalApproved}</strong>
              </div>
              <div className="stat-card">
                <span>Pending</span>
                <strong>{pendingReviews}</strong>
              </div>
            </div>

            <div className="content-grid">
              <div className="card form-card">
                <div className="card-header">
                  <h3>Qualification check</h3>
                  <span className={qualification.qualified ? 'chip success' : 'chip warning'}>
                    {qualification.qualified ? 'Qualified' : 'Review'}
                  </span>
                </div>

                <div className="two-col">
                  <label>
                    <span>Member name</span>
                    <input value={profile.memberName} onChange={(e) => updateField('memberName', e.target.value)} />
                  </label>

                  <label>
                    <span>ID number</span>
                    <input value={profile.idNumber} onChange={(e) => updateField('idNumber', e.target.value)} />
                  </label>

                  <label>
                    <span>Phone number</span>
                    <input value={profile.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} />
                  </label>

                  <label>
                    <span>Year of birth</span>
                    <input value={profile.yearOfBirth} onChange={(e) => updateField('yearOfBirth', e.target.value)} />
                  </label>

                  <label>
                    <span>Years in SACCO</span>
                    <select value={profile.yearsInSacco} onChange={(e) => updateField('yearsInSacco', e.target.value)}>
                      <option value="3">Less than 6 months</option>
                      <option value="6">6 months</option>
                      <option value="12">1 year</option>
                      <option value="24">2 years</option>
                      <option value="36">3+ years</option>
                    </select>
                  </label>

                  <label>
                    <span>Savings balance</span>
                    <input type="number" value={profile.savings} onChange={(e) => updateField('savings', e.target.value)} />
                  </label>

                  <label>
                    <span>Requested amount</span>
                    <input type="number" value={profile.requestedAmount} onChange={(e) => updateField('requestedAmount', e.target.value)} />
                  </label>

                  <label>
                    <span>Purpose</span>
                    <input value={profile.purpose} onChange={(e) => updateField('purpose', e.target.value)} />
                  </label>
                </div>

                <div className="check-list">
                  <label className="check-row">
                    <input type="checkbox" checked={profile.hasDefaulted} onChange={(e) => updateField('hasDefaulted', e.target.checked)} />
                    <span>Previous default</span>
                  </label>
                  <label className="check-row">
                    <input type="checkbox" checked={profile.isRegularSaver} onChange={(e) => updateField('isRegularSaver', e.target.checked)} />
                    <span>Regular monthly savings</span>
                  </label>
                  <label className="check-row">
                    <input type="checkbox" checked={profile.hasLoanOpen} onChange={(e) => updateField('hasLoanOpen', e.target.checked)} />
                    <span>Existing active loan</span>
                  </label>
                </div>

                <div className={`registry-banner ${registryStatus.verified ? 'ok' : 'warn'}`}>
                  <strong>{registryStatus.verified ? 'Registry check passed' : 'Registry check needs review'}</strong>
                  <p>{registryStatus.message}</p>
                </div>

                <button className="primary-button" onClick={handleSubmit}>Apply now</button>
                {statusMessage && <p className="status-message">{statusMessage}</p>}
              </div>

              <div className="card chat-card">
                <div className="card-header">
                  <h3>Ask the SACCO bot</h3>
                  <span className="chip neutral">Online</span>
                </div>

                <div className="chat-window">
                  {chatMessages.map((message, index) => (
                    <div key={`${message.sender}-${index}`} className={`message ${message.sender}`}>
                      {message.text}
                    </div>
                  ))}
                </div>

                <div className="chat-input-row">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about loan rules..."
                  />
                  <button className="primary-button small" onClick={sendBotQuestion}>Send</button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <header className="admin-header">
              <div>
                <p className="eyebrow">Admin console</p>
                <h1>Loan approvals dashboard</h1>
              </div>
              <button className="primary-button small" onClick={() => setView('member')}>Back to member view</button>
            </header>

            <div className="stats-grid admin-grid">
              <div className="stat-card accent">
                <span>Applications</span>
                <strong>{applications.length}</strong>
              </div>
              <div className="stat-card">
                <span>Approved</span>
                <strong>{totalApproved}</strong>
              </div>
              <div className="stat-card">
                <span>Pending review</span>
                <strong>{pendingReviews}</strong>
              </div>
              <div className="stat-card">
                <span>Largest loan</span>
                <strong>{formatCurrency(Math.max(...applications.map((item) => Number(item.amount || 0))))}</strong>
              </div>
            </div>

            <div className="card admin-table-card">
              <div className="card-header">
                <h3>Applications queue</h3>
                <span className="chip neutral">Live</span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Purpose</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>{app.memberName}</td>
                      <td>{app.purpose}</td>
                      <td>{formatCurrency(app.amount)}</td>
                      <td>
                        <span className={`table-status ${app.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button className="approve-btn" onClick={() => updateLoanStatus(app.id, 'Approved')}>Approve</button>
                        <button className="reject-btn" onClick={() => updateLoanStatus(app.id, 'Rejected')}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
