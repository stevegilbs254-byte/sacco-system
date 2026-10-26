import { useMemo, useState } from 'react';

const ALL_MEMBERS = [
  {
    id: 1,
    name: 'Mary Wanjiku Kariuki',
    email: 'mary.kariuki@sacco.co.ke',
    phone: '+254712345678',
    memberId: 'SAC-1001',
    status: 'Active',
    savings: 185000,
    shares: 60000,
    loan: 120000,
    joined: '2022-01-12',
    branch: 'Nairobi Central',
  },
  {
    id: 2,
    name: 'Peter Njoroge Mwangi',
    email: 'peter.mwangi@sacco.co.ke',
    phone: '+254723456789',
    memberId: 'SAC-1002',
    status: 'Active',
    savings: 240000,
    shares: 80000,
    loan: 150000,
    joined: '2021-09-05',
    branch: 'Kiambu',
  },
  {
    id: 3,
    name: 'Grace Achieng Otieno',
    email: 'grace.otieno@sacco.co.ke',
    phone: '+254734567890',
    memberId: 'SAC-1003',
    status: 'Pending',
    savings: 95000,
    shares: 25000,
    loan: 0,
    joined: '2024-03-20',
    branch: 'Kisumu',
  },
  {
    id: 4,
    name: 'Joseph Kiptoo Langat',
    email: 'joseph.langat@sacco.co.ke',
    phone: '+254745678901',
    memberId: 'SAC-1004',
    status: 'Active',
    savings: 310000,
    shares: 90000,
    loan: 220000,
    joined: '2020-11-18',
    branch: 'Eldoret',
  },
  {
    id: 5,
    name: 'Annastacia Muthoni',
    email: 'annastacia.muthoni@sacco.co.ke',
    phone: '+254756789012',
    memberId: 'SAC-1005',
    status: 'Inactive',
    savings: 65000,
    shares: 18000,
    loan: 0,
    joined: '2019-06-10',
    branch: 'Nakuru',
  },
  {
    id: 6,
    name: 'Samson Obare Ouma',
    email: 'samson.ouma@sacco.co.ke',
    phone: '+254767890123',
    memberId: 'SAC-1006',
    status: 'Active',
    savings: 205000,
    shares: 70000,
    loan: 98000,
    joined: '2023-02-14',
    branch: 'Mombasa',
  },
];

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const loanQualification = (member) =>
  member?.status === 'Active' && member?.savings >= 150000 && member?.shares >= 50000;

const defaultMemberProfile = ALL_MEMBERS[1];

const emptyMemberForm = {
  name: '',
  email: '',
  phone: '',
  branch: '',
  memberId: '',
  cvName: '',
  initialSavings: '',
  monthlySavings: '',
};

const summaryCards = [
  { label: 'Total Members', value: ALL_MEMBERS.length, tone: '#4f46e5' },
  { label: 'Active Members', value: ALL_MEMBERS.filter((m) => m.status === 'Active').length, tone: '#10b981' },
  { label: 'Pending', value: ALL_MEMBERS.filter((m) => m.status === 'Pending').length, tone: '#f59e0b' },
  { label: 'Inactive', value: ALL_MEMBERS.filter((m) => m.status === 'Inactive').length, tone: '#ef4444' },
];

const IllustrationScene = ({ accent = '#4f46e5' }) => (
  <div style={styles.heroVisual}>
    <div style={{ ...styles.orb, ...styles.orbPink }} />
    <div style={{ ...styles.orb, ...styles.orbGold }} />
    <div style={{ ...styles.orb, ...styles.orbBlue }} />

    <div style={{ ...styles.floatingCard, ...styles.floatingCardTop }}>
      <div style={styles.floatingLabel}>Monthly Flow</div>
      <div style={styles.floatingValue}>KSh 248K</div>
      <div style={styles.sparkline}>
        <span style={{ ...styles.sparkBar, ...styles.sparkBarA }} />
        <span style={{ ...styles.sparkBar, ...styles.sparkBarB }} />
        <span style={{ ...styles.sparkBar, ...styles.sparkBarC }} />
        <span style={{ ...styles.sparkBar, ...styles.sparkBarD }} />
        <span style={{ ...styles.sparkBar, ...styles.sparkBarE }} />
      </div>
    </div>

    <div style={{ ...styles.floatingCard, ...styles.floatingCardBottom }}>
      <div style={styles.floatingPill}>+18.4%</div>
      <div style={styles.floatingText}>Savings growth</div>
    </div>

    <div style={styles.peopleScene}>
      <div style={styles.person}>
        <div style={styles.personHead} />
        <div style={styles.personBody} />
        <div style={{ ...styles.personArm, ...styles.armLeft }} />
        <div style={{ ...styles.personArm, ...styles.armRight }} />
        <div style={styles.pocket} />
        <div style={{ ...styles.coin, ...styles.coinOne }} />
      </div>

      <div style={{ ...styles.person, ...styles.personTwo }}>
        <div style={styles.personHead} />
        <div style={styles.personBody} />
        <div style={{ ...styles.personArm, ...styles.armLeft }} />
        <div style={{ ...styles.personArm, ...styles.armRight }} />
        <div style={styles.pocket} />
        <div style={{ ...styles.coin, ...styles.coinTwo }} />
      </div>
    </div>

    <div style={{ ...styles.glowBadge, background: `linear-gradient(135deg, ${accent}, #22d3ee)` }}>
      Members saved today
    </div>
  </div>
);

function App() {
  const [currentUser, setCurrentUser] = useState({
    name: 'Admin User',
    role: 'Administrator',
  });
  const [screen, setScreen] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMember, setSelectedMember] = useState(defaultMemberProfile);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState('');
  const [memberMode, setMemberMode] = useState('new');
  const [loanForm, setLoanForm] = useState({
    amount: 50000,
    purpose: 'Business growth',
    months: 12,
  });
  const [loanNotice, setLoanNotice] = useState('');
  const [newMemberForm, setNewMemberForm] = useState(emptyMemberForm);
  const [newMemberNotice, setNewMemberNotice] = useState('');
  const [memberApplications, setMemberApplications] = useState([
    {
      id: 101,
      name: 'David Otieno',
      email: 'david.otieno@sacco.co.ke',
      phone: '+254700112233',
      branch: 'Mombasa',
      memberId: 'SAC-2001',
      cvName: 'david-otieno-cv.pdf',
      status: 'Awaiting admin review',
      credentials: { username: 'david.otieno', password: 'SACCO-7KJ4PM' },
      initialSavings: 25000,
      monthlySavings: 5000,
    },
  ]);

  const memberProfile = loginRole === 'member' ? defaultMemberProfile : selectedMember || defaultMemberProfile;
  const isAdmin = loginRole === 'admin';
  const memberCanApply = loanQualification(memberProfile);

  const visibleMembers = useMemo(() => {
    return ALL_MEMBERS.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.memberId.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalSavings = ALL_MEMBERS.reduce((sum, member) => sum + member.savings, 0);
  const totalShares = ALL_MEMBERS.reduce((sum, member) => sum + member.shares, 0);

  const chooseRole = (role) => {
    const nextMember = role === 'admin' ? ALL_MEMBERS[0] : defaultMemberProfile;
    setLoginRole(role);
    setSelectedMember(nextMember);
    setCurrentUser({
      name: role === 'admin' ? 'Admin User' : 'Member User',
      role: role === 'admin' ? 'Administrator' : 'Member',
    });
    setScreen('dashboard');
    setIsLoggedIn(true);
    setLoanNotice('');
    setNewMemberNotice('');
    setMemberMode('new');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setLoginRole('');
  };

  const handleLoanSubmit = (event) => {
    event.preventDefault();

    if (!memberCanApply) {
      setLoanNotice('Qualification required: active member, savings above KES 150,000 and shares above KES 50,000.');
      return;
    }

    setLoanNotice(`Loan application submitted for KES ${Number(loanForm.amount).toLocaleString()} for ${loanForm.purpose}.`);
  };

  const handleNewMemberSubmit = (event) => {
    event.preventDefault();

    if (
      !newMemberForm.name ||
      !newMemberForm.email ||
      !newMemberForm.phone ||
      !newMemberForm.branch ||
      !newMemberForm.memberId ||
      !newMemberForm.initialSavings ||
      !newMemberForm.monthlySavings
    ) {
      setNewMemberNotice('Please fill in all required member details and your starting savings amount before submitting.');
      return;
    }

    const username = newMemberForm.email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '.');
    const password = `SACCO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const application = {
      id: Date.now(),
      name: newMemberForm.name,
      email: newMemberForm.email,
      phone: newMemberForm.phone,
      branch: newMemberForm.branch,
      memberId: newMemberForm.memberId,
      cvName: newMemberForm.cvName || 'No CV uploaded',
      status: 'Awaiting admin review',
      credentials: { username, password },
      initialSavings: Number(newMemberForm.initialSavings),
      monthlySavings: Number(newMemberForm.monthlySavings),
    };

    setMemberApplications((current) => [application, ...current]);
    setNewMemberForm(emptyMemberForm);
    setNewMemberNotice(
      `Your new member request has been submitted. You started with KES ${Number(newMemberForm.initialSavings).toLocaleString()} and monthly savings of KES ${Number(newMemberForm.monthlySavings).toLocaleString()}. Keep saving until you meet the loan qualification thresholds.`
    );
  };

  const dashboardCards = isAdmin
    ? [
        { label: 'Total Members', value: ALL_MEMBERS.length, tone: '#4f46e5' },
        { label: 'Active Members', value: ALL_MEMBERS.filter((m) => m.status === 'Active').length, tone: '#10b981' },
        { label: 'Pending', value: ALL_MEMBERS.filter((m) => m.status === 'Pending').length, tone: '#f59e0b' },
        { label: 'Inactive', value: ALL_MEMBERS.filter((m) => m.status === 'Inactive').length, tone: '#ef4444' },
      ]
    : [
        { label: 'Savings', value: formatCurrency(memberProfile.savings), tone: '#10b981' },
        { label: 'Shares', value: formatCurrency(memberProfile.shares), tone: '#8b5cf6' },
        { label: 'Loan Balance', value: formatCurrency(memberProfile.loan), tone: '#f59e0b' },
        {
          label: 'Qualification',
          value: memberCanApply ? 'Qualified' : 'Pending',
          tone: memberCanApply ? '#10b981' : '#f59e0b',
        },
      ];

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginVisualWrap}>
          <div style={styles.loginCopy}>
            <p style={styles.kicker}>Smart SACCO</p>
            <h1 style={styles.heroTitle}>Build wealth together.<br />Every coin counts.</h1>
            <p style={styles.heroText}>
              Secure member savings, faster loan flows, and brighter financial futures in one vibrant dashboard.
            </p>
          </div>

          <IllustrationScene accent="#4f46e5" />
        </div>

        <div style={styles.loginCard}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>S</div>
            <div>
              <div style={styles.brandText}>SACCO</div>
              <h1 style={styles.loginTitle}>Welcome</h1>
            </div>
          </div>

          <p style={styles.loginSubtitle}>Sign in to continue</p>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="member@example.com" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Enter password" />
          </div>

          <button type="button" style={styles.primaryButton} onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  if (isLoggedIn && !loginRole) {
    return (
      <div style={styles.roleSelectPage}>
        <div style={styles.roleSelectCard}>
          <div style={styles.roleHeaderWrap}>
            <div>
              <p style={styles.kicker}>Continue as</p>
              <h1 style={styles.roleTitle}>Choose your portal</h1>
            </div>
            <button type="button" style={styles.backLink} onClick={() => setIsLoggedIn(false)}>Back</button>
          </div>

          <p style={styles.roleSubtitle}>Select whether you want to access the member or admin dashboard.</p>

          <div style={styles.roleGrid}>
            <button type="button" onClick={() => chooseRole('member')} style={{ ...styles.roleButton, ...styles.memberRoleButton }}>
              <span style={styles.roleIcon}>👤</span>
              <span style={styles.roleLabel}>Member</span>
              <small style={styles.roleText}>View your profile, savings, and loan details.</small>
            </button>

            <button type="button" onClick={() => chooseRole('admin')} style={{ ...styles.roleButton, ...styles.adminRoleButton }}>
              <span style={styles.roleIcon}>🛡️</span>
              <span style={styles.roleLabel}>Admin</span>
              <small style={styles.roleText}>Manage members, loans, and SACCO reports.</small>
            </button>
          </div>

          <div style={styles.roleSceneWrap}>
            <IllustrationScene accent="#8b5cf6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appShell}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brandBox}>
            <div style={styles.brandIcon}>S</div>
            <div>
              <div style={styles.brandTitle}>SACCO</div>
              <div style={styles.brandSub}>{isAdmin ? 'Admin Portal' : 'Member Portal'}</div>
            </div>
          </div>

          <nav style={styles.navList}>
            <button
              type="button"
              onClick={() => setScreen('dashboard')}
              style={{ ...styles.navButton, ...(screen === 'dashboard' ? styles.navButtonActive : {}) }}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setScreen(isAdmin ? 'members' : 'new-member')}
              style={{ ...styles.navButton, ...(screen === (isAdmin ? 'members' : 'new-member') ? styles.navButtonActive : {}) }}
            >
              {isAdmin ? 'All Members' : 'Add My Details'}
            </button>
            <button
              type="button"
              onClick={() => setScreen('loans')}
              style={{ ...styles.navButton, ...(screen === 'loans' ? styles.navButtonActive : {}) }}
            >
              {isAdmin ? 'Loan Requests' : 'Apply Loan'}
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setScreen('new-member')}
                style={{ ...styles.navButton, ...(screen === 'new-member' ? styles.navButtonActive : {}) }}
              >
                New Employee
              </button>
            )}
            <button
              type="button"
              onClick={() => setScreen('reports')}
              style={{ ...styles.navButton, ...(screen === 'reports' ? styles.navButtonActive : {}) }}
            >
              Reports
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(false);
                setLoginRole('');
              }}
              style={{ ...styles.navButton, ...styles.logoutButton }}
            >
              Logout
            </button>
          </nav>
        </div>

        <div style={styles.userBox}>
          <div style={styles.avatar}>{currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
          <div>
            <div style={styles.userName}>{currentUser.name}</div>
            <div style={styles.userRole}>{currentUser.role}</div>
          </div>
        </div>
      </aside>

      <main style={styles.mainContent}>
        {screen === 'dashboard' && (
          <>
            <header style={styles.headerRow}>
              <div>
                <p style={styles.kicker}>Overview</p>
                <h1 style={styles.pageTitle}>{isAdmin ? 'SACCO Administration' : 'My SACCO Dashboard'}</h1>
              </div>
              <button type="button" style={styles.primaryButton} onClick={() => setScreen('new-member')}>
                {isAdmin ? '+ Add Member' : 'Add My Details'}
              </button>
            </header>

            <section style={styles.summaryGrid}>
              {dashboardCards.map((card) => (
                <div key={card.label} style={{ ...styles.summaryCard, borderTop: `4px solid ${card.tone}` }}>
                  <div style={styles.summaryLabel}>{card.label}</div>
                  <div style={styles.summaryValue}>{card.value}</div>
                </div>
              ))}
            </section>

            <section style={styles.smallStatsRow}>
              {isAdmin ? (
                <>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Total Savings</div>
                    <div style={styles.statValue}>{formatCurrency(totalSavings)}</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Shares</div>
                    <div style={styles.statValue}>{formatCurrency(totalShares)}</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Outstanding Loans</div>
                    <div style={styles.statValue}>{formatCurrency(ALL_MEMBERS.reduce((sum, member) => sum + member.loan, 0))}</div>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Available Savings</div>
                    <div style={styles.statValue}>{formatCurrency(memberProfile.savings)}</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Loan Qualification</div>
                    <div style={styles.statValue}>{memberCanApply ? 'Qualified' : 'Not yet'}</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Current Loan</div>
                    <div style={styles.statValue}>{formatCurrency(memberProfile.loan)}</div>
                  </div>
                </>
              )}
            </section>
          </>
        )}

        {screen === 'new-member' && (
          isAdmin ? (
            <>
              <header style={styles.headerRow}>
                <div>
                  <p style={styles.kicker}>Recruitment</p>
                  <h1 style={styles.pageTitle}>New Employee Review</h1>
                </div>
              </header>

              <div style={styles.membersPanel}>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Applicant</th>
                        <th style={styles.th}>Branch</th>
                        <th style={styles.th}>CV</th>
                        <th style={styles.th}>Credentials</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberApplications.map((application) => (
                        <tr key={application.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.memberCell}>
                              <div style={styles.memberAvatar}>{application.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}</div>
                              <div>
                                <div style={styles.memberName}>{application.name}</div>
                                <div style={styles.memberEmail}>{application.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>{application.branch}</td>
                          <td style={styles.td}>{application.cvName}</td>
                          <td style={styles.td}>
                            <div><strong>Username:</strong> {application.credentials?.username}</div>
                            <div><strong>Password:</strong> {application.credentials?.password}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ ...styles.statusPill, ...statusColor(application.status === 'Awaiting admin review' ? 'Pending' : application.status) }}>
                              {application.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={styles.detailCard}>
                  <div style={styles.detailHeader}>Admin Action</div>
                  <div style={styles.detailTitle}>New employee credentials</div>
                  <div style={styles.detailMeta}>Review uploaded CVs and generated access details before approval.</div>

                  {memberApplications.length === 0 ? (
                    <div style={styles.emptyState}>No new employee submissions yet.</div>
                  ) : (
                    memberApplications.map((application) => (
                      <div key={`admin-${application.id}`} style={{ ...styles.amountBox, marginBottom: '12px' }}>
                        <div style={styles.amountLabel}>{application.name}</div>
                        <div style={styles.detailValue}>Username: {application.credentials?.username}</div>
                        <div style={styles.detailValue}>Password: {application.credentials?.password}</div>
                        <div style={{ ...styles.detailValue, marginTop: '8px' }}>CV: {application.cvName}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <header style={styles.headerRow}>
                <div>
                  <p style={styles.kicker}>Member registration</p>
                  <h1 style={styles.pageTitle}>Member portal</h1>
                </div>
              </header>

              <div style={styles.loanCard}>
                <div style={styles.memberModeSwitch}>
                  <button
                    type="button"
                    onClick={() => setMemberMode('new')}
                    style={{ ...styles.modeButton, ...(memberMode === 'new' ? styles.modeButtonActive : {}) }}
                  >
                    New Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberMode('normal')}
                    style={{ ...styles.modeButton, ...(memberMode === 'normal' ? styles.modeButtonActive : {}) }}
                  >
                    Normal Member
                  </button>
                </div>

                {memberMode === 'new' ? (
                  <>
                    <div style={{ ...styles.emptyState, marginBottom: '18px', background: 'rgba(59,130,246,0.08)' }}>
                      Start by adding your member details and the amount you want to begin saving with. Keep saving until your account becomes eligible for a loan.
                    </div>

                    <form onSubmit={handleNewMemberSubmit} style={styles.loanForm}>
                      <div style={styles.formGroupLoan}>
                        <label style={styles.label}>Full name</label>
                        <input
                          style={styles.input}
                          type="text"
                          value={newMemberForm.name}
                          onChange={(event) => setNewMemberForm((current) => ({ ...current, name: event.target.value }))}
                        />
                      </div>

                      <div style={styles.formGroupLoan}>
                        <label style={styles.label}>Email</label>
                        <input
                          style={styles.input}
                          type="email"
                          value={newMemberForm.email}
                          onChange={(event) => setNewMemberForm((current) => ({ ...current, email: event.target.value }))}
                        />
                      </div>

                      <div style={styles.formGroupLoan}>
                        <label style={styles.label}>Phone number</label>
                        <input
                          style={styles.input}
                          type="tel"
                          value={newMemberForm.phone}
                          onChange={(event) => setNewMemberForm((current) => ({ ...current, phone: event.target.value }))}
                        />
                      </div>

                      <div style={styles.formGroupLoan}>
                        <label style={styles.label}>Branch</label>
                        <input
                          style={styles.input}
                          type="text"
                          value={newMemberForm.branch}
                          onChange={(event) => setNewMemberForm((current) => ({ ...current, branch: event.target.value }))}
                        />
                      </div>

                      <div style={styles.formGroupLoan}>
                        <label style={styles.label}>Member ID</label>
                        <input
                          style={styles.input}
                          type="text"
                          value={newMemberForm.memberId}
                          onChange={(event) => setNewMemberForm((current) => ({ ...current, memberId: event.target.value }))}
                        />
                      </div>

                      <div style={styles.formGroupLoan}>
                        <label style={styles.label}>Opening savings amount (KES)</label>
                        <input
                          style={styles.input}
                          type="number"
                          min="0"
                          step="500"
                          value={newMemberForm.initialSavings}
                          onChange={(event) => setNewMemberForm((current) => ({ ...current, initialSavings: event.target.value }))}
                        />
                      </div>

                      <div style={styles.formGroupLoan}>
                        <label style={styles.label}>Monthly savings goal (KES)</label>
                        <input
                          style={styles.input}
                          type="number"
                          min="0"
                          step="500"
                          value={newMemberForm.monthlySavings}
                          onChange={(event) => setNewMemberForm((current) => ({ ...current, monthlySavings: event.target.value }))}
                        />
                      </div>

                      <div style={styles.formGroupLoan}>
                        <label style={styles.label}>CV upload</label>
                        <input
                          style={styles.input}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              setNewMemberForm((current) => ({ ...current, cvName: file.name }));
                            }
                          }}
                        />
                      </div>

                      <button type="submit" style={styles.primaryButton}>Send details to admin</button>
                    </form>

                    {newMemberNotice && (
                      <div style={{ ...styles.emptyState, marginTop: '18px', background: 'rgba(16,185,129,0.08)', color: '#d1fae5' }}>
                        {newMemberNotice}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ ...styles.emptyState, marginBottom: '18px', background: 'rgba(16,185,129,0.08)' }}>
                      Normal member section: review your current details and continue contributing until you meet loan eligibility.
                    </div>

                    <div style={styles.detailCard}>
                      <div style={styles.detailTitle}>{memberProfile.name}</div>
                      <div style={styles.detailMeta}>{memberProfile.memberId} • {memberProfile.branch}</div>

                      <div style={styles.detailGrid}>
                        <div>
                          <div style={styles.detailLabel}>Email</div>
                          <div style={styles.detailValue}>{memberProfile.email}</div>
                        </div>
                        <div>
                          <div style={styles.detailLabel}>Phone</div>
                          <div style={styles.detailValue}>{memberProfile.phone}</div>
                        </div>
                        <div>
                          <div style={styles.detailLabel}>Joined</div>
                          <div style={styles.detailValue}>{memberProfile.joined}</div>
                        </div>
                        <div>
                          <div style={styles.detailLabel}>Status</div>
                          <div style={{ ...styles.detailValue, ...statusColor(memberProfile.status) }}>{memberProfile.status}</div>
                        </div>
                      </div>

                      <div style={styles.amountGrid}>
                        <div style={styles.amountBox}>
                          <div style={styles.amountLabel}>Savings</div>
                          <div style={styles.amountValue}>{formatCurrency(memberProfile.savings)}</div>
                        </div>
                        <div style={styles.amountBox}>
                          <div style={styles.amountLabel}>Shares</div>
                          <div style={styles.amountValue}>{formatCurrency(memberProfile.shares)}</div>
                        </div>
                        <div style={styles.amountBox}>
                          <div style={styles.amountLabel}>Loan Balance</div>
                          <div style={styles.amountValue}>{formatCurrency(memberProfile.loan)}</div>
                        </div>
                      </div>

                      <div style={{ ...styles.emptyState, marginTop: '18px' }}>
                        {memberCanApply
                          ? 'You qualify for a loan. You can submit an application below.'
                          : 'Qualification required: active status, savings of at least KES 150,000 and shares of at least KES 50,000.'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )
        )}

        {screen === 'members' && (
          isAdmin ? (
            <>
              <header style={styles.headerRow}>
                <div>
                  <p style={styles.kicker}>Directory</p>
                  <h1 style={styles.pageTitle}>All Members</h1>
                </div>
                <button type="button" style={styles.primaryButton} onClick={() => setScreen('new-member')}>Register New Member</button>
              </header>

              <div style={styles.filterBar}>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search member, email or ID"
                  style={styles.searchInput}
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  style={styles.selectInput}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={styles.membersPanel}>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Member</th>
                        <th style={styles.th}>Member ID</th>
                        <th style={styles.th}>Phone</th>
                        <th style={styles.th}>Branch</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleMembers.map((member) => (
                        <tr
                          key={member.id}
                          onClick={() => setSelectedMember(member)}
                          style={{
                            ...styles.tr,
                            ...(selectedMember?.id === member.id ? styles.trActive : {}),
                          }}
                        >
                          <td style={styles.td}>
                            <div style={styles.memberCell}>
                              <div style={styles.memberAvatar}>{member.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}</div>
                              <div>
                                <div style={styles.memberName}>{member.name}</div>
                                <div style={styles.memberEmail}>{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>{member.memberId}</td>
                          <td style={styles.td}>{member.phone}</td>
                          <td style={styles.td}>{member.branch}</td>
                          <td style={styles.td}>
                            <span style={{ ...styles.statusPill, ...statusColor(member.status) }}>{member.status}</span>
                          </td>
                          <td style={styles.td}>{formatCurrency(member.savings)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={styles.detailCard}>
                  <div style={styles.detailHeader}>Member Details</div>
                  <div style={styles.detailTitle}>{selectedMember?.name}</div>
                  <div style={styles.detailMeta}>{selectedMember?.memberId} • {selectedMember?.branch}</div>

                  <div style={styles.detailGrid}>
                    <div>
                      <div style={styles.detailLabel}>Email</div>
                      <div style={styles.detailValue}>{selectedMember?.email}</div>
                    </div>
                    <div>
                      <div style={styles.detailLabel}>Phone</div>
                      <div style={styles.detailValue}>{selectedMember?.phone}</div>
                    </div>
                    <div>
                      <div style={styles.detailLabel}>Joined</div>
                      <div style={styles.detailValue}>{selectedMember?.joined}</div>
                    </div>
                    <div>
                      <div style={styles.detailLabel}>Status</div>
                      <div style={{ ...styles.detailValue, ...statusColor(selectedMember?.status) }}>{selectedMember?.status}</div>
                    </div>
                  </div>

                  <div style={styles.amountGrid}>
                    <div style={styles.amountBox}>
                      <div style={styles.amountLabel}>Savings</div>
                      <div style={styles.amountValue}>{formatCurrency(selectedMember?.savings)}</div>
                    </div>
                    <div style={styles.amountBox}>
                      <div style={styles.amountLabel}>Shares</div>
                      <div style={styles.amountValue}>{formatCurrency(selectedMember?.shares)}</div>
                    </div>
                    <div style={styles.amountBox}>
                      <div style={styles.amountLabel}>Loan Balance</div>
                      <div style={styles.amountValue}>{formatCurrency(selectedMember?.loan)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <header style={styles.headerRow}>
                <div>
                  <p style={styles.kicker}>Profile</p>
                  <h1 style={styles.pageTitle}>My Details</h1>
                </div>
              </header>

              <div style={styles.detailCard}>
                <div style={styles.detailTitle}>{memberProfile.name}</div>
                <div style={styles.detailMeta}>{memberProfile.memberId} • {memberProfile.branch}</div>

                <div style={styles.detailGrid}>
                  <div>
                    <div style={styles.detailLabel}>Email</div>
                    <div style={styles.detailValue}>{memberProfile.email}</div>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Phone</div>
                    <div style={styles.detailValue}>{memberProfile.phone}</div>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Joined</div>
                    <div style={styles.detailValue}>{memberProfile.joined}</div>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Status</div>
                    <div style={{ ...styles.detailValue, ...statusColor(memberProfile.status) }}>{memberProfile.status}</div>
                  </div>
                </div>

                <div style={styles.amountGrid}>
                  <div style={styles.amountBox}>
                    <div style={styles.amountLabel}>Savings</div>
                    <div style={styles.amountValue}>{formatCurrency(memberProfile.savings)}</div>
                  </div>
                  <div style={styles.amountBox}>
                    <div style={styles.amountLabel}>Shares</div>
                    <div style={styles.amountValue}>{formatCurrency(memberProfile.shares)}</div>
                  </div>
                  <div style={styles.amountBox}>
                    <div style={styles.amountLabel}>Loan Balance</div>
                    <div style={styles.amountValue}>{formatCurrency(memberProfile.loan)}</div>
                  </div>
                </div>

                <div style={{ ...styles.emptyState, marginTop: '18px' }}>
                  {memberCanApply
                    ? 'You qualify for a loan. You can submit an application below.'
                    : 'Qualification required: active status, savings of at least KES 150,000 and shares of at least KES 50,000.'}
                </div>
              </div>
            </>
          )
        )}

        {screen === 'loans' && (
          isAdmin ? (
            <>
              <header style={styles.headerRow}>
                <div>
                  <p style={styles.kicker}>Operations</p>
                  <h1 style={styles.pageTitle}>Loan Requests</h1>
                </div>
              </header>

              <div style={styles.emptyState}>Loan management page is ready for approval workflows.</div>
            </>
          ) : (
            <>
              <header style={styles.headerRow}>
                <div>
                  <p style={styles.kicker}>Member finance</p>
                  <h1 style={styles.pageTitle}>Apply for a Loan</h1>
                </div>
              </header>

              <div style={styles.loanCard}>
                <div style={{ ...styles.emptyState, marginBottom: '16px', background: memberCanApply ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)' }}>
                  {memberCanApply
                    ? 'Congratulations! You have passed the qualification check and can apply for a loan.'
                    : 'Qualification required: active member, savings above KES 150,000 and shares above KES 50,000.'}
                </div>

                <form onSubmit={handleLoanSubmit} style={styles.loanForm}>
                  <div style={styles.formGroupLoan}>
                    <label style={styles.label}>Loan Amount</label>
                    <input
                      style={styles.input}
                      type="number"
                      min="5000"
                      step="5000"
                      value={loanForm.amount}
                      onChange={(event) => setLoanForm((current) => ({ ...current, amount: Number(event.target.value) || 0 }))}
                      disabled={!memberCanApply}
                    />
                  </div>

                  <div style={styles.formGroupLoan}>
                    <label style={styles.label}>Purpose</label>
                    <input
                      style={styles.input}
                      type="text"
                      value={loanForm.purpose}
                      onChange={(event) => setLoanForm((current) => ({ ...current, purpose: event.target.value }))}
                      disabled={!memberCanApply}
                    />
                  </div>

                  <div style={styles.formGroupLoan}>
                    <label style={styles.label}>Repayment Months</label>
                    <select
                      style={styles.selectInput}
                      value={loanForm.months}
                      onChange={(event) => setLoanForm((current) => ({ ...current, months: Number(event.target.value) }))}
                      disabled={!memberCanApply}
                    >
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                      <option value={18}>18 Months</option>
                      <option value={24}>24 Months</option>
                    </select>
                  </div>

                  <button type="submit" style={{ ...styles.primaryButton, opacity: memberCanApply ? 1 : 0.6 }} disabled={!memberCanApply}>
                    {memberCanApply ? 'Submit Loan Application' : 'Loan Not Qualified'}
                  </button>
                </form>

                {loanNotice && (
                  <div style={{ ...styles.emptyState, marginTop: '18px', color: '#d1fae5', background: 'rgba(16,185,129,0.08)' }}>
                    {loanNotice}
                  </div>
                )}
              </div>
            </>
          )
        )}

        {screen === 'reports' && (
          <>
            <header style={styles.headerRow}>
              <div>
                <p style={styles.kicker}>Analytics</p>
                <h1 style={styles.pageTitle}>Reports</h1>
              </div>
            </header>

            <div style={styles.emptyState}>Reports page will show growth, deposits, arrears, and member activity.</div>
          </>
        )}
      </main>
    </div>
  );
}

const statusColor = (status) => {
  if (status === 'Active') return { background: '#d1fae5', color: '#065f46' };
  if (status === 'Pending') return { background: '#fef3c7', color: '#92400e' };
  return { background: '#fee2e2', color: '#991b1b' };
};

const styles = {
  loginPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    background: 'radial-gradient(circle at top left, rgba(79,70,229,0.3), transparent 35%), radial-gradient(circle at bottom right, rgba(14,165,233,0.28), transparent 30%), #07111f',
    padding: '30px',
  },
  loginVisualWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    width: 'min(560px, 50vw)',
    minWidth: '320px',
  },
  loginCopy: {
    paddingLeft: '8px',
  },
  heroTitle: {
    margin: '0 0 10px',
    color: '#f8fafc',
    fontSize: 'clamp(2.2rem, 4vw, 4rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
  },
  heroText: {
    margin: 0,
    color: '#cbd5e1',
    fontSize: '1.08rem',
    lineHeight: 1.7,
    maxWidth: '520px',
  },
  loginCard: {
    width: '100%',
    maxWidth: '420px',
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.82))',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '24px',
    padding: '32px 28px',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(10px)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '12px',
  },
  logoBox: {
    width: '48px',
    height: '48px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #4f46e5, #10b981)',
    fontWeight: 800,
    fontSize: '22px',
    boxShadow: '0 18px 32px rgba(79, 70, 229, 0.4)',
  },
  brandText: {
    fontSize: '12px',
    letterSpacing: '0.12em',
    color: '#a5b4fc',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  loginTitle: {
    margin: 0,
    fontSize: '36px',
  },
  loginSubtitle: {
    margin: '0 0 22px',
    color: '#94a3b8',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  formGroupLoan: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    width: '100%',
  },
  label: {
    fontSize: '13px',
    color: '#cbd5e1',
  },
  input: {
    width: '100%',
    background: '#0f172a',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    color: '#e2e8f0',
    padding: '12px 14px',
    outline: 'none',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03)',
  },
  roleSelectPage: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '32px',
    background: 'radial-gradient(circle at center, rgba(14,165,233,0.18), transparent 35%), #07111f',
  },
  roleSelectCard: {
    width: 'min(920px, 100%)',
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.76))',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '30px',
    padding: '36px 28px 26px',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.4)',
  },
  roleHeaderWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  backLink: {
    background: 'rgba(148, 163, 184, 0.08)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '10px',
    color: '#f8fafc',
    padding: '10px 14px',
    cursor: 'pointer',
  },
  roleTitle: {
    margin: '14px 0 10px',
    fontSize: 'clamp(2rem, 4vw, 3rem)',
  },
  roleSubtitle: {
    margin: '0 0 26px',
    color: '#94a3b8',
    fontSize: '1.05rem',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
    gap: '22px',
  },
  roleButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    minHeight: '220px',
    borderRadius: '22px',
    padding: '28px 22px',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'left',
    cursor: 'pointer',
    boxShadow: '0 22px 32px rgba(17, 24, 39, 0.18)',
  },
  memberRoleButton: {
    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
  },
  adminRoleButton: {
    background: 'linear-gradient(135deg, #8b5cf6, #4338ca)',
  },
  roleIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '58px',
    height: '58px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.14)',
    fontSize: '1.8rem',
  },
  roleLabel: {
    fontSize: '1.6rem',
    fontWeight: 700,
  },
  roleText: {
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1.5,
    fontSize: '0.96rem',
  },
  roleSceneWrap: {
    marginTop: '24px',
    borderRadius: '26px',
    background: 'rgba(15, 23, 42, 0.55)',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    overflow: 'hidden',
  },
  heroVisual: {
    position: 'relative',
    height: '320px',
    background: 'linear-gradient(180deg, rgba(79,70,229,0.15), rgba(15, 23, 42, 0.3))',
    borderRadius: '28px',
    overflow: 'hidden',
    border: '1px solid rgba(148, 163, 184, 0.12)',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(18px)',
    opacity: 0.8,
  },
  orbPink: {
    width: '180px',
    height: '180px',
    background: 'rgba(244, 114, 182, 0.45)',
    top: '-30px',
    right: '40px',
  },
  orbGold: {
    width: '180px',
    height: '180px',
    background: 'rgba(251, 191, 36, 0.22)',
    bottom: '-20px',
    left: '20px',
  },
  orbBlue: {
    width: '240px',
    height: '240px',
    background: 'rgba(56, 189, 248, 0.24)',
    bottom: '-60px',
    right: '120px',
  },
  floatingCard: {
    position: 'absolute',
    background: 'rgba(15, 23, 42, 0.65)',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    borderRadius: '18px',
    padding: '14px 16px',
    boxShadow: '0 20px 35px rgba(15, 23, 42, 0.3)',
    backdropFilter: 'blur(8px)',
  },
  floatingCardTop: {
    top: '30px',
    left: '26px',
    minWidth: '160px',
  },
  floatingCardBottom: {
    right: '28px',
    bottom: '22px',
    minWidth: '160px',
  },
  floatingLabel: {
    color: '#a5b4fc',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  floatingValue: {
    fontSize: '28px',
    fontWeight: 800,
    marginTop: '8px',
    color: '#f8fafc',
  },
  floatingPill: {
    display: 'inline-flex',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.24), rgba(34,197,94,0.12))',
    borderRadius: '999px',
    color: '#bbf7d0',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: 700,
  },
  floatingText: {
    marginTop: '10px',
    color: '#cbd5e1',
    fontSize: '13px',
  },
  sparkline: {
    marginTop: '14px',
    display: 'flex',
    alignItems: 'end',
    gap: '8px',
    height: '42px',
  },
  sparkBar: {
    display: 'block',
    width: '10px',
    borderRadius: '999px',
    background: 'linear-gradient(180deg, #7dd3fc, #4f46e5)',
  },
  sparkBarA: { height: '32%' },
  sparkBarB: { height: '54%' },
  sparkBarC: { height: '72%' },
  sparkBarD: { height: '88%' },
  sparkBarE: { height: '100%' },
  peopleScene: {
    position: 'absolute',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'end',
    gap: '48px',
    zIndex: 2,
  },
  person: {
    position: 'relative',
    width: '120px',
    height: '180px',
  },
  personTwo: {
    transform: 'translateY(12px) scale(0.96)',
  },
  personHead: {
    position: 'absolute',
    top: '18px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #fef3c7, #fbbf24)',
    boxShadow: 'inset 0 -8px 12px rgba(146, 64, 14, 0.1)',
    zIndex: 3,
  },
  personBody: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '78px',
    height: '90px',
    borderRadius: '20px 20px 26px 26px',
    background: 'linear-gradient(180deg, #4f46e5, #06b6d4)',
    boxShadow: 'inset 0 -10px 16px rgba(15, 23, 42, 0.1)',
  },
  personArm: {
    position: 'absolute',
    top: '86px',
    width: '16px',
    height: '58px',
    background: 'linear-gradient(180deg, #f8fafc, #dbeafe)',
    borderRadius: '12px',
    zIndex: 2,
  },
  armLeft: {
    left: '12px',
    transform: 'rotate(28deg)',
  },
  armRight: {
    right: '12px',
    transform: 'rotate(-28deg)',
  },
  pocket: {
    position: 'absolute',
    left: '50%',
    bottom: '18px',
    transform: 'translateX(-50%)',
    width: '44px',
    height: '28px',
    borderRadius: '0 0 18px 18px',
    background: 'rgba(15, 23, 42, 0.18)',
    border: '2px solid rgba(15, 23, 42, 0.18)',
    zIndex: 5,
  },
  coin: {
    position: 'absolute',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #fef08a, #fbbf24)',
    border: '3px solid rgba(255,255,255,0.6)',
    boxShadow: '0 12px 18px rgba(245, 158, 11, 0.28)',
    zIndex: 6,
  },
  coinOne: {
    bottom: '30px',
    right: '10px',
  },
  coinTwo: {
    bottom: '42px',
    left: '12px',
  },
  glowBadge: {
    position: 'absolute',
    right: '24px',
    top: '24px',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '999px',
    color: '#fff',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.04em',
    boxShadow: '0 18px 28px rgba(79,70,229,0.25)',
    zIndex: 7,
  },
  appShell: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #07111f 0%, #0b1529 100%)',
    color: '#e2e8f0',
    fontFamily: 'Inter, Segoe UI, sans-serif',
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.9))',
    borderRight: '1px solid rgba(148, 163, 184, 0.18)',
    padding: '24px 18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'rgba(15, 23, 42, 0.28) 0 20px 40px',
  },
  brandBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
  },
  brandIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #4f46e5, #10b981)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
    color: '#fff',
    boxShadow: '0 18px 28px rgba(79, 70, 229, 0.32)',
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  brandSub: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  navButton: {
    border: 'none',
    borderRadius: '12px',
    background: 'transparent',
    color: '#cbd5e1',
    textAlign: 'left',
    padding: '12px 14px',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navButtonActive: {
    background: 'linear-gradient(135deg, rgba(79,70,229,0.16), rgba(14,165,233,0.18))',
    color: '#fff',
    boxShadow: 'inset 0 0 0 1px rgba(129, 140, 248, 0.35)',
  },
  logoutButton: {
    marginTop: '8px',
    background: 'rgba(167, 139, 250, 0.12)',
    color: '#e9d5ff',
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(180deg, rgba(16,185,129,0.15), rgba(15,118,110,0.08))',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '14px',
    padding: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #22c55e)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
    fontSize: '13px',
    boxShadow: '0 16px 24px rgba(34,197,94,0.2)',
  },
  userName: {
    fontWeight: 700,
    fontSize: '14px',
  },
  userRole: {
    fontSize: '12px',
    color: '#a7f3d0',
  },
  mainContent: {
    flex: 1,
    padding: '28px',
    background: 'radial-gradient(circle at top left, rgba(79,70,229,0.08), transparent 26%)',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
  },
  kicker: {
    margin: '0 0 6px',
    color: '#a5b4fc',
    textTransform: 'uppercase',
    fontSize: '12px',
    letterSpacing: '0.12em',
  },
  pageTitle: {
    margin: 0,
    fontSize: '32px',
    lineHeight: 1.2,
  },
  primaryButton: {
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
    color: '#fff',
    padding: '12px 18px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 18px 28px rgba(79,70,229,0.28)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.86), rgba(15, 23, 42, 0.76))',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '16px',
    padding: '18px 18px 16px',
    boxShadow: '0 16px 28px rgba(15, 23, 42, 0.18)',
    overflow: 'hidden',
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: '13px',
    marginBottom: '12px',
  },
  summaryValue: {
    fontSize: 'clamp(18px, 2vw, 30px)',
    fontWeight: 700,
    color: '#f8fafc',
    lineHeight: 1.2,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  },
  smallStatsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
    gap: '16px',
  },
  statCard: {
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.72))',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '16px',
    padding: '18px',
    boxShadow: '0 16px 28px rgba(15, 23, 42, 0.18)',
    overflow: 'hidden',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '13px',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: 'clamp(18px, 1.8vw, 24px)',
    fontWeight: 700,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(15, 23, 42, 0.82)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '14px',
    padding: '12px',
    marginBottom: '18px',
  },
  searchInput: {
    flex: 1,
    background: '#0f172a',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '10px',
    color: '#e2e8f0',
    padding: '11px 12px',
    outline: 'none',
  },
  selectInput: {
    background: '#0f172a',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '10px',
    color: '#e2e8f0',
    padding: '11px 12px',
    outline: 'none',
  },
  membersPanel: {
    display: 'grid',
    gridTemplateColumns: '2.1fr 1fr',
    gap: '18px',
    alignItems: 'start',
  },
  tableWrap: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 16px 28px rgba(15, 23, 42, 0.18)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    fontSize: '12px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    background: 'rgba(15, 118, 110, 0.08)',
  },
  td: {
    padding: '14px 16px',
    borderTop: '1px solid rgba(148, 163, 184, 0.12)',
    fontSize: '14px',
    color: '#e2e8f0',
  },
  tr: {
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  trActive: {
    background: 'rgba(79, 70, 229, 0.12)',
  },
  memberCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  memberAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6d28d9, #0ea5e9)',
    display: 'grid',
    placeItems: 'center',
    fontSize: '11px',
    fontWeight: 700,
  },
  memberName: {
    fontWeight: 700,
  },
  memberEmail: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
  },
  detailCard: {
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.72))',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 16px 28px rgba(15, 23, 42, 0.18)',
  },
  detailHeader: {
    color: '#a5b4fc',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '12px',
  },
  detailTitle: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '6px',
  },
  detailMeta: {
    color: '#94a3b8',
    marginBottom: '22px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '22px',
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    marginBottom: '6px',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: 600,
  },
  amountGrid: {
    display: 'grid',
    gap: '12px',
  },
  amountBox: {
    background: '#0f172a',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '12px',
    padding: '12px',
    overflow: 'hidden',
  },
  amountLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    marginBottom: '6px',
  },
  amountValue: {
    fontSize: 'clamp(16px, 1.7vw, 18px)',
    fontWeight: 700,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  },
  emptyState: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    borderRadius: '16px',
    padding: '30px',
    color: '#cbd5e1',
    fontSize: '16px',
    boxShadow: '0 16px 28px rgba(15, 23, 42, 0.18)',
  },
  loanCard: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 16px 28px rgba(15, 23, 42, 0.18)',
  },
  loanForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    maxWidth: '520px',
  },
  memberModeSwitch: {
    display: 'inline-flex',
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    padding: '6px',
    gap: '8px',
    marginBottom: '18px',
  },
  modeButton: {
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: '#cbd5e1',
    fontWeight: 700,
    padding: '10px 16px',
    cursor: 'pointer',
  },
  modeButtonActive: {
    background: 'linear-gradient(135deg, rgba(79,70,229,0.18), rgba(14,165,233,0.18))',
    color: '#fff',
    boxShadow: 'inset 0 0 0 1px rgba(129,140,248,0.35)',
  },
};

export default App;
