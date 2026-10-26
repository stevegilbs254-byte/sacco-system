import { useMemo, useState } from 'react';
import './App.css';

const DEMO_USER = {
  email: 'stevegilbs254@gamil.com',
  password: 'steveomo254',
};

const initialMembers = [
  {
    id: 1,
    name: 'Steve Gilbs',
    email: 'stevegilbs254@gamil.com',
    country: 'Kenya',
    phone: '+254712345678',
    joinedAt: '2024-01-15',
    savings: 45500,
    share: 12000,
    interest: 2450,
    contributionHistory: [
      { month: 'Sep 2026', amount: 5000 },
      { month: 'Oct 2026', amount: 6600 },
      { month: 'Nov 2026', amount: 7500 },
    ],
  },
];

const initialEmployees = [
  { id: 1, name: 'Alex Njoroge', position: 'Loan Committee Chair', country: 'Kenya' },
  { id: 2, name: 'Mary Wanjiku', position: 'Operations Manager', country: 'Kenya' },
];

const initialLoans = [
  {
    id: 1,
    memberName: 'Steve Gilbs',
    memberPosition: 'Treasurer',
    purpose: 'School fees',
    amount: 120000,
    contribution: 45500,
    status: 'Approved',
    date: '2026-10-20',
  },
  {
    id: 2,
    memberName: 'Jane Wanjiku',
    memberPosition: 'Member',
    purpose: 'Business expansion',
    amount: 95000,
    contribution: 38000,
    status: 'Pending',
    date: '2026-10-22',
  },
  {
    id: 3,
    memberName: 'Paul Otieno',
    memberPosition: 'Secretary',
    purpose: 'Emergency fund',
    amount: 70000,
    contribution: 27000,
    status: 'Reviewed',
    date: '2026-10-23',
  },
];

const defaultLoanApplication = {
  amount: '',
  purpose: 'School fees',
  phoneNumber: '+254712345678',
};

const defaultMemberForm = {
  name: '',
  email: '',
  phone: '',
  country: 'Kenya',
  idNumber: '',
  password: '',
};

const defaultContribution = {
  amount: '',
  month: 'October 2026',
};

const defaultLogin = {
  email: '',
  password: '',
  country: 'Kenya',
};

const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const chartSeries = [18, 32, 40, 58, 75, 98];

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

function App() {
  const [login, setLogin] = useState(defaultLogin);
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState('member');
  const [notification, setNotification] = useState('');
  const [members, setMembers] = useState(initialMembers);
  const [employees, setEmployees] = useState(initialEmployees);
  const [newMemberForm, setNewMemberForm] = useState(defaultMemberForm);
  const [contributionForm, setContributionForm] = useState(defaultContribution);
  const [loanForm, setLoanForm] = useState(defaultLoanApplication);
  const [loanQueue, setLoanQueue] = useState(initialLoans);
  const [selectedLoanId, setSelectedLoanId] = useState(initialLoans[0]?.id ?? null);
  const [employeeForm, setEmployeeForm] = useState({ name: '', position: '', country: 'Kenya' });

  const currentMember = useMemo(() => members[0], [members]);
  const selectedLoan = useMemo(
    () => loanQueue.find((loan) => loan.id === selectedLoanId) || loanQueue[0],
    [loanQueue, selectedLoanId]
  );

  const eligibleLoan = currentMember.savings * 3;
  const totalContributions = members.reduce((sum, member) => sum + Number(member.savings || 0), 0);
  const totalShare = members.reduce((sum, member) => sum + Number(member.share || 0), 0);

  const loginMember = () => {
    const email = login.email.trim().toLowerCase();
    const password = login.password.trim();

    if (email === DEMO_USER.email.toLowerCase() && password === DEMO_USER.password) {
      setLoggedIn(true);
      setPage('member');
      setNotification('Welcome back. Your SACCO dashboard is ready.');
      return;
    }

    setNotification('Invalid login. Please use the demo credentials provided.');
  };

  const addNewMember = () => {
    if (!newMemberForm.name || !newMemberForm.email || !newMemberForm.phone || !newMemberForm.idNumber || !newMemberForm.password) {
      setNotification('Please complete the new member form before saving.');
      return;
    }

    const nextMember = {
      id: Date.now(),
      name: newMemberForm.name,
      email: newMemberForm.email,
      country: newMemberForm.country,
      phone: newMemberForm.phone,
      joinedAt: new Date().toISOString().slice(0, 10),
      savings: 0,
      share: 0,
      interest: 0,
      contributionHistory: [],
    };

    setMembers((current) => [nextMember, ...current]);
    setNewMemberForm(defaultMemberForm);
    setPage('member');
    setNotification('New member has been added successfully.');
  };

  const addContribution = () => {
    const amount = Number(contributionForm.amount || 0);
    if (!amount || amount <= 0) {
      setNotification('Please enter a valid monthly contribution amount.');
      return;
    }

    const nextSavings = currentMember.savings + amount;
    const nextShare = currentMember.share + amount * 0.1;
    const nextInterest = currentMember.interest + amount * 0.06;

    setMembers((current) =>
      current.map((member) =>
        member.id === currentMember.id
          ? {
              ...member,
              savings: nextSavings,
              share: nextShare,
              interest: nextInterest,
              contributionHistory: [
                { month: contributionForm.month, amount },
                ...member.contributionHistory,
              ],
            }
          : member
      )
    );

    setContributionForm(defaultContribution);
    setNotification(`Contribution of ${formatCurrency(amount)} has been recorded.`);
  };

  const sendWhatsAppMessage = async (phoneNumber, text) => {
    try {
      await fetch('http://localhost:10000/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, message: text }),
      });
    } catch (error) {
      console.log('WhatsApp simulation:', text);
    }
  };

  const applyForLoan = async () => {
    const amount = Number(loanForm.amount || 0);
    if (!amount || amount <= 0) {
      setNotification('Please enter a valid loan amount.');
      return;
    }

    const pendingLoan = {
      id: Date.now(),
      memberName: currentMember.name,
      memberPosition: 'Member',
      purpose: loanForm.purpose,
      amount,
      contribution: currentMember.savings,
      status: 'Pending',
      date: new Date().toISOString().slice(0, 10),
    };

    setLoanQueue((current) => [pendingLoan, ...current]);
    setSelectedLoanId(pendingLoan.id);
    setLoanForm(defaultLoanApplication);

    const message = `Hello ${currentMember.name}, your SACCO loan application for ${formatCurrency(amount)} is pending review. We will notify you once a decision is made.`;
    await sendWhatsAppMessage(currentMember.phone, message);
    setNotification('Your loan application has been submitted and a WhatsApp confirmation has been sent.');
  };

  const updateLoanStatus = (id, status) => {
    setLoanQueue((current) =>
      current.map((loan) => (loan.id === id ? { ...loan, status } : loan))
    );

    const loan = loanQueue.find((item) => item.id === id);
    if (loan) {
      const message = `Hello ${loan.memberName}, your SACCO loan request of ${formatCurrency(loan.amount)} has been ${status.toLowerCase()}.`;
      sendWhatsAppMessage(loan.memberName === currentMember.name ? currentMember.phone : '+254700000000', message);
    }
  };

  const addEmployee = () => {
    if (!employeeForm.name || !employeeForm.position) {
      setNotification('Please provide the employee name and position.');
      return;
    }

    setEmployees((current) => [
      ...current,
      {
        id: Date.now(),
        name: employeeForm.name,
        position: employeeForm.position,
        country: employeeForm.country,
      },
    ]);

    setEmployeeForm({ name: '', position: '', country: 'Kenya' });
    setNotification('New employee has been added to the SACCO staff list.');
  };

  if (!loggedIn) {
    return (
      <main className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <div className="brand-mark">S</div>
            <div>
              <p className="small-label">SACCO</p>
              <h1>Welcome</h1>
            </div>
          </div>

          <h2>Sign in</h2>
          <p className="login-subtitle">Use the demo account to access the SACCO portal.</p>

          <div className="login-form">
            <label>
              <span>Email</span>
              <input
                value={login.email}
                onChange={(e) => setLogin((current) => ({ ...current, email: e.target.value }))}
                placeholder="stevegilbs254@gamil.com"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={login.password}
                onChange={(e) => setLogin((current) => ({ ...current, password: e.target.value }))}
                placeholder="steveomo254"
              />
            </label>

            <label>
              <span>Country</span>
              <select
                value={login.country}
                onChange={(e) => setLogin((current) => ({ ...current, country: e.target.value }))}
              >
                <option value="Kenya">Kenya</option>
                <option value="Uganda">Uganda</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Rwanda">Rwanda</option>
              </select>
            </label>

            {notification && <p className="login-error">{notification}</p>}

            <button className="primary-button" onClick={loginMember}>Login</button>
          </div>
        </div>
      </main>
    );
  }

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
          <button className={page === 'member' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('member')}>
            Member dashboard
          </button>
          <button className={page === 'new-member' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('new-member')}>
            New member
          </button>
          <button className={page === 'contribution' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('contribution')}>
            Contributions
          </button>
          <button className={page === 'admin' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('admin')}>
            Admin dashboard
          </button>
          <button className="nav-item secondary" onClick={() => setLoggedIn(false)}>
            Logout
          </button>
        </nav>

        <div className="mini-balance">
          <span>Current savings</span>
          <strong>{formatCurrency(currentMember.savings)}</strong>
        </div>
      </aside>

      <section className="main-panel">
        {notification && <div className="system-banner">{notification}</div>}

        {page === 'member' && (
          <>
            <header className="welcome-section">
              <div>
                <p className="eyebrow">Member private page</p>
                <h1>Welcome, {currentMember.name} 👋</h1>
              </div>
              <div className="status-pill success">Active member</div>
            </header>

            <div className="stats-grid">
              <div className="stat-card accent">
                <span>Savings</span>
                <strong>{formatCurrency(currentMember.savings)}</strong>
              </div>
              <div className="stat-card">
                <span>Interest</span>
                <strong>{formatCurrency(currentMember.interest)}</strong>
              </div>
              <div className="stat-card">
                <span>Eligible loan</span>
                <strong>{formatCurrency(eligibleLoan)}</strong>
              </div>
              <div className="stat-card">
                <span>SACCO share</span>
                <strong>{formatCurrency(currentMember.share)}</strong>
              </div>
            </div>

            <div className="content-grid two-col-layout">
              <div className="card">
                <div className="card-header">
                  <h3>Loan application</h3>
                  <span className="chip neutral">Quick apply</span>
                </div>

                <div className="form-grid">
                  <label>
                    <span>Loan amount</span>
                    <input
                      type="number"
                      value={loanForm.amount}
                      onChange={(e) => setLoanForm((current) => ({ ...current, amount: e.target.value }))}
                    />
                  </label>

                  <label>
                    <span>Purpose</span>
                    <input
                      value={loanForm.purpose}
                      onChange={(e) => setLoanForm((current) => ({ ...current, purpose: e.target.value }))}
                    />
                  </label>

                  <label>
                    <span>WhatsApp number</span>
                    <input
                      value={loanForm.phoneNumber}
                      onChange={(e) => setLoanForm((current) => ({ ...current, phoneNumber: e.target.value }))}
                    />
                  </label>
                </div>

                <button className="primary-button" onClick={applyForLoan}>Apply for loan</button>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Member details</h3>
                  <span className="chip success">Verified</span>
                </div>

                <div className="member-details">
                  <div><span>Name</span><strong>{currentMember.name}</strong></div>
                  <div><span>Email</span><strong>{currentMember.email}</strong></div>
                  <div><span>Country</span><strong>{currentMember.country}</strong></div>
                  <div><span>Phone</span><strong>{currentMember.phone}</strong></div>
                  <div><span>Joined</span><strong>{currentMember.joinedAt}</strong></div>
                  <div><span>Balance</span><strong>{formatCurrency(currentMember.savings)}</strong></div>
                </div>
              </div>
            </div>

            <div className="card table-card">
              <div className="card-header">
                <h3>Contribution history</h3>
                <span className="chip neutral">Recent</span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMember.contributionHistory.map((entry, index) => (
                    <tr key={`${entry.month}-${index}`}>
                      <td>{entry.month}</td>
                      <td>{formatCurrency(entry.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {page === 'new-member' && (
          <div className="card full-card">
            <div className="card-header">
              <h3>New member registration</h3>
              <span className="chip neutral">Create account</span>
            </div>

            <div className="form-grid three-col">
              <label>
                <span>Full name</span>
                <input
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm((current) => ({ ...current, name: e.target.value }))}
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm((current) => ({ ...current, email: e.target.value }))}
                />
              </label>

              <label>
                <span>Phone</span>
                <input
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm((current) => ({ ...current, phone: e.target.value }))}
                />
              </label>

              <label>
                <span>ID number</span>
                <input
                  value={newMemberForm.idNumber}
                  onChange={(e) => setNewMemberForm((current) => ({ ...current, idNumber: e.target.value }))}
                />
              </label>

              <label>
                <span>Country</span>
                <select
                  value={newMemberForm.country}
                  onChange={(e) => setNewMemberForm((current) => ({ ...current, country: e.target.value }))}
                >
                  <option value="Kenya">Kenya</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Rwanda">Rwanda</option>
                </select>
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={newMemberForm.password}
                  onChange={(e) => setNewMemberForm((current) => ({ ...current, password: e.target.value }))}
                />
              </label>
            </div>

            <button className="primary-button" onClick={addNewMember}>Create member</button>
          </div>
        )}

        {page === 'contribution' && (
          <div className="card full-card">
            <div className="card-header">
              <h3>Record monthly contribution</h3>
              <span className="chip neutral">Savings</span>
            </div>

            <div className="form-grid two-col">
              <label>
                <span>Contribution amount</span>
                <input
                  type="number"
                  value={contributionForm.amount}
                  onChange={(e) => setContributionForm((current) => ({ ...current, amount: e.target.value }))}
                />
              </label>

              <label>
                <span>Month</span>
                <select
                  value={contributionForm.month}
                  onChange={(e) => setContributionForm((current) => ({ ...current, month: e.target.value }))}
                >
                  <option value="October 2026">October 2026</option>
                  <option value="November 2026">November 2026</option>
                  <option value="December 2026">December 2026</option>
                  <option value="January 2027">January 2027</option>
                </select>
              </label>
            </div>

            <button className="primary-button" onClick={addContribution}>Save contribution</button>
          </div>
        )}

        {page === 'admin' && (
          <>
            <header className="admin-header">
              <div>
                <p className="eyebrow">Admin private page</p>
                <h1>SACCO growth dashboard</h1>
              </div>
              <div className="admin-user-badge">
                <strong>Alex Njoroge</strong>
                <span>Loan Committee Chair</span>
              </div>
            </header>

            <div className="stats-grid admin-grid">
              <div className="stat-card accent">
                <span>Members</span>
                <strong>{members.length}</strong>
              </div>
              <div className="stat-card">
                <span>Monthly savings</span>
                <strong>{formatCurrency(totalContributions)}</strong>
              </div>
              <div className="stat-card">
                <span>Total share</span>
                <strong>{formatCurrency(totalShare)}</strong>
              </div>
              <div className="stat-card">
                <span>Loan requests</span>
                <strong>{loanQueue.length}</strong>
              </div>
            </div>

            <div className="content-grid">
              <div className="card">
                <div className="card-header">
                  <h3>Add employee</h3>
                  <span className="chip neutral">Staff</span>
                </div>

                <div className="form-grid">
                  <label>
                    <span>Name</span>
                    <input
                      value={employeeForm.name}
                      onChange={(e) => setEmployeeForm((current) => ({ ...current, name: e.target.value }))}
                    />
                  </label>

                  <label>
                    <span>Position</span>
                    <input
                      value={employeeForm.position}
                      onChange={(e) => setEmployeeForm((current) => ({ ...current, position: e.target.value }))}
                    />
                  </label>

                  <label>
                    <span>Country</span>
                    <select
                      value={employeeForm.country}
                      onChange={(e) => setEmployeeForm((current) => ({ ...current, country: e.target.value }))}
                    >
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                    </select>
                  </label>
                </div>

                <button className="primary-button" onClick={addEmployee}>Add employee</button>

                <div className="employee-list">
                  {employees.map((employee) => (
                    <div key={employee.id} className="employee-row">
                      <div>
                        <strong>{employee.name}</strong>
                        <span>{employee.position}</span>
                      </div>
                      <small>{employee.country}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card chart-card">
                <div className="card-header">
                  <h3>SACCO growth</h3>
                  <span className="chip success">+32%</span>
                </div>

                <div className="chart-box">
                  {chartSeries.map((value, index) => (
                    <div key={value + index} className="chart-col">
                      <span style={{ height: `${value}%` }} />
                      <small>{chartLabels[index]}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card admin-table-card">
              <div className="card-header">
                <h3>Loan approvals queue</h3>
                <span className="chip neutral">Live</span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Position</th>
                    <th>Contribution</th>
                    <th>Loan</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loanQueue.map((loan) => (
                    <tr
                      key={loan.id}
                      className={selectedLoanId === loan.id ? 'selected-row' : ''}
                      onClick={() => setSelectedLoanId(loan.id)}
                    >
                      <td>{loan.memberName}</td>
                      <td>{loan.memberPosition || 'Member'}</td>
                      <td>{formatCurrency(loan.contribution || 0)}</td>
                      <td>{formatCurrency(loan.amount || 0)}</td>
                      <td>
                        <span className={`table-status ${loan.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button className="approve-btn" onClick={(e) => { e.stopPropagation(); updateLoanStatus(loan.id, 'Approved'); }}>
                          Approve
                        </button>
                        <button className="reject-btn" onClick={(e) => { e.stopPropagation(); updateLoanStatus(loan.id, 'Rejected'); }}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedLoan && (
              <div className="card detail-card">
                <div className="card-header">
                  <h3>Selected request</h3>
                  <span className={`chip ${selectedLoan.status === 'Approved' ? 'success' : selectedLoan.status === 'Rejected' ? 'warning' : 'neutral'}`}>
                    {selectedLoan.status}
                  </span>
                </div>

                <div className="detail-grid">
                  <div>
                    <label>Member</label>
                    <strong>{selectedLoan.memberName}</strong>
                  </div>
                  <div>
                    <label>Position</label>
                    <strong>{selectedLoan.memberPosition || 'Member'}</strong>
                  </div>
                  <div>
                    <label>Contribution</label>
                    <strong>{formatCurrency(selectedLoan.contribution || 0)}</strong>
                  </div>
                  <div>
                    <label>Loan amount</label>
                    <strong>{formatCurrency(selectedLoan.amount || 0)}</strong>
                  </div>
                  <div>
                    <label>Purpose</label>
                    <strong>{selectedLoan.purpose}</strong>
                  </div>
                  <div>
                    <label>Date</label>
                    <strong>{selectedLoan.date}</strong>
                  </div>
                </div>

                <div className="detail-actions">
                  <button className="approve-btn" onClick={() => updateLoanStatus(selectedLoan.id, 'Approved')}>Accept request</button>
                  <button className="reject-btn" onClick={() => updateLoanStatus(selectedLoan.id, 'Rejected')}>Reject request</button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default App;
