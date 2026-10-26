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

const summaryCards = [
  { label: 'Total Members', value: ALL_MEMBERS.length, tone: '#4f46e5' },
  { label: 'Active Members', value: ALL_MEMBERS.filter((m) => m.status === 'Active').length, tone: '#10b981' },
  { label: 'Pending', value: ALL_MEMBERS.filter((m) => m.status === 'Pending').length, tone: '#f59e0b' },
  { label: 'Inactive', value: ALL_MEMBERS.filter((m) => m.status === 'Inactive').length, tone: '#ef4444' },
];

function App() {
  const [currentUser, setCurrentUser] = useState({
    name: 'Admin User',
    role: 'Administrator',
  });
  const [screen, setScreen] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMember, setSelectedMember] = useState(ALL_MEMBERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState('');

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
    setLoginRole(role);
    setCurrentUser({
      name: role === 'admin' ? 'Admin User' : 'Member User',
      role: role === 'admin' ? 'Administrator' : 'Member',
    });
    setIsLoggedIn(true);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setLoginRole('');
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
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
          <p style={styles.kicker}>Continue as</p>
          <h1 style={styles.roleTitle}>Choose your portal</h1>
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
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appShell}>
      <aside style={styles.sidebar}>
        <div style={styles.brandBox}>
          <div style={styles.brandIcon}>S</div>
          <div>
            <div style={styles.brandTitle}>SACCO</div>
            <div style={styles.brandSub}>{loginRole === 'admin' ? 'Admin Portal' : 'Member Portal'}</div>
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
            onClick={() => setScreen('members')}
            style={{ ...styles.navButton, ...(screen === 'members' ? styles.navButtonActive : {}) }}
          >
            All Members
          </button>
          <button
            type="button"
            onClick={() => setScreen('loans')}
            style={{ ...styles.navButton, ...(screen === 'loans' ? styles.navButtonActive : {}) }}
          >
            Loan Requests
          </button>
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
                <h1 style={styles.pageTitle}>SACCO Administration</h1>
              </div>
              <button type="button" style={styles.primaryButton}>+ Add Member</button>
            </header>

            <section style={styles.summaryGrid}>
              {summaryCards.map((card) => (
                <div key={card.label} style={{ ...styles.summaryCard, borderTop: `4px solid ${card.tone}` }}>
                  <div style={styles.summaryLabel}>{card.label}</div>
                  <div style={styles.summaryValue}>{card.value}</div>
                </div>
              ))}
            </section>

            <section style={styles.smallStatsRow}>
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
            </section>
          </>
        )}

        {screen === 'members' && (
          <>
            <header style={styles.headerRow}>
              <div>
                <p style={styles.kicker}>Directory</p>
                <h1 style={styles.pageTitle}>All Members</h1>
              </div>
              <button type="button" style={styles.primaryButton}>Register New Member</button>
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
        )}

        {screen === 'loans' && (
          <>
            <header style={styles.headerRow}>
              <div>
                <p style={styles.kicker}>Operations</p>
                <h1 style={styles.pageTitle}>Loan Requests</h1>
              </div>
            </header>

            <div style={styles.emptyState}>Loan management page is ready for approval workflows.</div>
          </>
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
    display: 'grid',
    placeItems: 'center',
    background: 'radial-gradient(circle at top, rgba(79,70,229,0.2), transparent 35%), #07111f',
    padding: '20px',
  },
  loginCard: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '24px',
    padding: '32px 28px',
    boxShadow: '0 24px 50px rgba(15, 23, 42, 0.35)',
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
  },
  roleSelectPage: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '32px',
    background: 'radial-gradient(circle at center, rgba(14,165,233,0.18), transparent 35%)',
  },
  roleSelectCard: {
    width: 'min(820px, 100%)',
    background: 'rgba(15, 23, 42, 0.82)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '28px',
    padding: '36px 28px',
    boxShadow: '0 24px 50px rgba(15, 23, 42, 0.35)',
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
    transition: 'transform 0.2s ease',
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
  appShell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#07111f',
    color: '#e2e8f0',
    fontFamily: 'Inter, Segoe UI, sans-serif',
  },
  sidebar: {
    width: '260px',
    background: 'rgba(15, 23, 42, 0.92)',
    borderRight: '1px solid rgba(148, 163, 184, 0.18)',
    padding: '24px 18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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
    background: 'rgba(79, 70, 229, 0.18)',
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
    background: 'rgba(15, 118, 110, 0.15)',
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
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '16px',
    padding: '18px 18px 16px',
    boxShadow: '0 12px 25px rgba(2, 6, 23, 0.25)',
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: '13px',
    marginBottom: '12px',
  },
  summaryValue: {
    fontSize: '30px',
    fontWeight: 700,
    color: '#f8fafc',
  },
  smallStatsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
    gap: '16px',
  },
  statCard: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '16px',
    padding: '18px',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '13px',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
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
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '16px',
    padding: '20px',
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
  },
  amountLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    marginBottom: '6px',
  },
  amountValue: {
    fontSize: '18px',
    fontWeight: 700,
  },
  emptyState: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    borderRadius: '16px',
    padding: '30px',
    color: '#cbd5e1',
    fontSize: '16px',
  },
};

export default App;
