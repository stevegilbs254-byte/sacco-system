import { useEffect, useMemo, useState } from 'react';
import './App.css';

const steps = ['Membership', 'Identity', 'Loan', 'Review'];

const nationalRegistry = [
  { idNumber: '12345678', name: 'Steve Gilbs', yearOfBirth: '1990', phoneNumber: '0712345678' },
  { idNumber: '87654321', name: 'Jane Wanjiku', yearOfBirth: '1988', phoneNumber: '0723456789' },
  { idNumber: '24681357', name: 'Paul Otieno', yearOfBirth: '1995', phoneNumber: '0734567890' },
  { idNumber: '98765432', name: 'Mary Njeri', yearOfBirth: '1992', phoneNumber: '0745678901' },
];

const starterComments = [
  { name: 'Lucy', text: 'The SACCO process is transparent and fair. I liked the clear checks.' },
  { name: 'James', text: 'The team explains every step and makes it easier to plan a loan.' },
];

const memberProfiles = [
  { name: 'Jane Wanjiku', role: 'Retailer', savings: 62000, tenure: '2 years', status: 'Eligible' },
  { name: 'Paul Otieno', role: 'Teacher', savings: 48000, tenure: '18 months', status: 'Eligible' },
  { name: 'Mary Njeri', role: 'Farmer', savings: 26000, tenure: '7 months', status: 'In review' },
  { name: 'Peter Kimani', role: 'Driver', savings: 74000, tenure: '3 years', status: 'Eligible' },
];

const defaultState = {
  yearsInSacco: '12',
  savings: '45000',
  hasDefaulted: false,
  hasLoanOpen: false,
  isRegularSaver: true,
  memberName: 'Steve Gilbs',
  idNumber: '12345678',
  phoneNumber: '0712345678',
  yearOfBirth: '1990',
  requestedAmount: '120000',
  purpose: 'School fees',
  confirmDetails: false,
};

function toNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function validateAgainstRegistry(form) {
  const registryMatch = nationalRegistry.find(
    (entry) =>
      entry.idNumber === String(form.idNumber || '').trim() &&
      entry.name.trim().toLowerCase() === String(form.memberName || '').trim().toLowerCase() &&
      entry.yearOfBirth === String(form.yearOfBirth || '').trim() &&
      entry.phoneNumber === String(form.phoneNumber || '').trim()
  );

  if (!registryMatch) {
    return {
      verified: false,
      message: 'The ID number, name, birth year, and phone number were not found in the national registration records.',
    };
  }

  return {
    verified: true,
    message: 'Details match the registration records for this member.',
  };
}

function getQualification(form) {
  const months = toNumber(form.yearsInSacco);
  const savings = toNumber(form.savings);
  const requestedAmount = toNumber(form.requestedAmount);
  const limit = months >= 24 ? savings * 4 : savings * 3;

  if (form.hasDefaulted) {
    return {
      qualified: false,
      reason: 'A previous default is still recorded, so the application cannot proceed.',
      limit,
    };
  }

  if (months < 6) {
    return {
      qualified: false,
      reason: 'You need at least 6 months in the SACCO before you can qualify for a loan.',
      limit,
    };
  }

  if (requestedAmount > limit) {
    return {
      qualified: false,
      reason: `The requested amount exceeds your maximum limit of ${formatCurrency(limit)}.`,
      limit,
    };
  }

  return {
    qualified: true,
    reason: 'You are eligible for the requested loan amount based on your SACCO history.',
    limit,
  };
}

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(defaultState);
  const [comments, setComments] = useState(starterComments);
  const [commentText, setCommentText] = useState('');
  const [adminQueue, setAdminQueue] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const registryStatus = useMemo(() => validateAgainstRegistry(form), [form]);
  const qualification = useMemo(() => getQualification(form), [form]);

  useEffect(() => {
    fetch('http://localhost:10000/api/applications')
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setAdminQueue(data))
      .catch(() => setAdminQueue([]));
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const submitComment = () => {
    const cleanComment = commentText.trim();
    if (!cleanComment) return;

    setComments((current) => [{ name: 'You', text: cleanComment }, ...current]);
    setCommentText('');
  };

  const submitApplication = async () => {
    const payload = {
      memberName: form.memberName,
      idNumber: form.idNumber,
      phoneNumber: form.phoneNumber,
      yearOfBirth: form.yearOfBirth,
      savings: Number(form.savings || 0),
      yearsInSacco: Number(form.yearsInSacco || 0),
      requestedAmount: Number(form.requestedAmount || 0),
      purpose: form.purpose,
      hasDefaulted: form.hasDefaulted,
      hasLoanOpen: form.hasLoanOpen,
      isRegularSaver: form.isRegularSaver,
      status: qualification.qualified ? 'Approved for review' : 'Pending verification',
    };

    try {
      const response = await fetch('http://localhost:10000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setAdminQueue((current) => [data, ...current]);

      try {
        await fetch('http://localhost:10000/api/mpesa/stkpush', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: form.phoneNumber,
            amount: Number(form.requestedAmount || 0),
            accountReference: form.memberName,
            transactionDesc: `Loan application for ${form.memberName}`,
          }),
        });
      } catch {
        // graceful fallback: do not block the admin submission
      }

      setStatusMessage('Application sent to admin and confirmation pushed to the member with a simulated M-Pesa request.');
      setCurrentStep(3);
    } catch (error) {
      setAdminQueue((current) => [
        {
          _id: `local-${Date.now()}`,
          memberName: form.memberName,
          idNumber: form.idNumber,
          phoneNumber: form.phoneNumber,
          requestedAmount: Number(form.requestedAmount || 0),
          purpose: form.purpose,
          status: 'Saved locally',
        },
        ...current,
      ]);
      setStatusMessage(`Local fallback saved: ${error.message}`);
      setCurrentStep(3);
    }
  };

  const canAdvance =
    currentStep === 0
      ? true
      : currentStep === 1
        ? registryStatus.verified && form.confirmDetails
        : currentStep === 2
          ? Number(form.requestedAmount || 0) > 0
          : true;

  return (
    <main className="qualification-shell">
      <div className="page-glow page-glow--left" />
      <div className="page-glow page-glow--right" />

      <section className="app-card">
        <header className="topbar">
          <div>
            <p className="eyebrow">SACCO member access</p>
            <h1>Loan qualification journey</h1>
          </div>
          <div className="badge">Member portal</div>
        </header>

        <nav className="stepper" aria-label="Qualification steps">
          {steps.map((step, index) => (
            <div key={step} className={`step ${index === currentStep ? 'active' : ''}`}>
              <span>{index + 1}</span>
              <small>{step}</small>
            </div>
          ))}
        </nav>

        {currentStep === 0 && (
          <div className="panel">
            <h2>Tell us about your SACCO journey</h2>
            <div className="question-grid">
              <label className="field-box">
                <span>How long have you been a member?</span>
                <select value={form.yearsInSacco} onChange={(e) => updateField('yearsInSacco', e.target.value)}>
                  <option value="3">Less than 6 months</option>
                  <option value="6">6 months</option>
                  <option value="12">1 year</option>
                  <option value="24">2 years</option>
                  <option value="36">3+ years</option>
                </select>
              </label>

              <label className="field-box">
                <span>What is your savings balance?</span>
                <input
                  type="number"
                  value={form.savings}
                  min="0"
                  onChange={(e) => updateField('savings', e.target.value)}
                />
              </label>

              <label className="field-box checkbox-box">
                <input
                  type="checkbox"
                  checked={form.hasDefaulted}
                  onChange={(e) => updateField('hasDefaulted', e.target.checked)}
                />
                <span>I have had a previous default</span>
              </label>

              <label className="field-box checkbox-box">
                <input
                  type="checkbox"
                  checked={form.hasLoanOpen}
                  onChange={(e) => updateField('hasLoanOpen', e.target.checked)}
                />
                <span>I have an active loan that is still running</span>
              </label>

              <label className="field-box checkbox-box">
                <input
                  type="checkbox"
                  checked={form.isRegularSaver}
                  onChange={(e) => updateField('isRegularSaver', e.target.checked)}
                />
                <span>I contribute regularly every month</span>
              </label>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="panel">
            <h2>Verify your identity</h2>
            <div className="question-grid single-column">
              <label className="field-box">
                <span>Member name</span>
                <input
                  type="text"
                  value={form.memberName}
                  onChange={(e) => updateField('memberName', e.target.value)}
                />
              </label>

              <label className="field-box">
                <span>ID number</span>
                <input
                  type="text"
                  value={form.idNumber}
                  onChange={(e) => updateField('idNumber', e.target.value)}
                />
              </label>

              <label className="field-box">
                <span>Phone number</span>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                />
              </label>

              <label className="field-box">
                <span>Year of birth</span>
                <input
                  type="text"
                  value={form.yearOfBirth}
                  onChange={(e) => updateField('yearOfBirth', e.target.value)}
                />
              </label>

              <label className="field-box checkbox-box">
                <input
                  type="checkbox"
                  checked={form.confirmDetails}
                  onChange={(e) => updateField('confirmDetails', e.target.checked)}
                />
                <span>I confirm these details are correct and match the country registration records.</span>
              </label>

              <div className={`verification-box ${registryStatus.verified ? 'success' : 'warning'}`}>
                <strong>{registryStatus.verified ? 'Verified' : 'Verification pending'}</strong>
                <p>{registryStatus.message}</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="panel">
            <h2>Request your loan</h2>
            <div className="question-grid single-column">
              <label className="field-box">
                <span>How much do you need?</span>
                <input
                  type="number"
                  value={form.requestedAmount}
                  min="0"
                  onChange={(e) => updateField('requestedAmount', e.target.value)}
                />
              </label>

              <label className="field-box">
                <span>Purpose of the loan</span>
                <input
                  type="text"
                  value={form.purpose}
                  onChange={(e) => updateField('purpose', e.target.value)}
                />
              </label>

              <div className="summary-boxes">
                <div className="mini-stat">
                  <span>Maximum limit</span>
                  <strong>{formatCurrency(qualification.limit)}</strong>
                </div>
                <div className="mini-stat">
                  <span>Requested</span>
                  <strong>{formatCurrency(form.requestedAmount)}</strong>
                </div>
                <div className="mini-stat">
                  <span>Member</span>
                  <strong>{form.memberName || 'Member'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="panel community-panel">
            <div className="community-header">
              <h2>Review and admin queue</h2>
              <div className={`result-pill ${qualification.qualified ? 'success' : 'warn'}`}>
                {qualification.qualified ? 'Eligible' : 'Needs review'}
              </div>
            </div>

            <div className="summary-boxes">
              <div className="mini-stat">
                <span>Registration</span>
                <strong>{registryStatus.verified ? 'Confirmed' : 'Unverified'}</strong>
              </div>
              <div className="mini-stat">
                <span>Phone</span>
                <strong>{form.phoneNumber || 'N/A'}</strong>
              </div>
              <div className="mini-stat">
                <span>Birth year</span>
                <strong>{form.yearOfBirth || 'N/A'}</strong>
              </div>
            </div>

            <div className="member-list">
              {memberProfiles.map((member) => (
                <div key={member.name} className="member-item">
                  <div>
                    <strong>{member.name}</strong>
                    <small>{member.role}</small>
                  </div>
                  <div className="member-meta">
                    <span>{member.tenure}</span>
                    <span>{member.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="comment-box">
              <h3>How is the SACCO process for you?</h3>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your view on the SACCO process..."
              />
              <button type="button" className="primary-btn" onClick={submitComment}>Post comment</button>
            </div>

            <div className="comment-list">
              {comments.map((item, index) => (
                <div key={`${item.name}-${index}`} className="comment-item">
                  <strong>{item.name}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="admin-queue">
              <h3>Admin applications</h3>
              {adminQueue.length === 0 ? (
                <p>No applications submitted yet.</p>
              ) : (
                adminQueue.map((application) => (
                  <div key={application._id || `${application.memberName}-${application.idNumber}`} className="admin-item">
                    <div>
                      <strong>{application.memberName}</strong>
                      <small>{application.idNumber}</small>
                    </div>
                    <div>
                      <span>{application.status || 'Pending'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="footer-actions">
          <button type="button" className="nav-btn secondary" onClick={prevStep} disabled={currentStep === 0}>
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button type="button" className="nav-btn primary" onClick={nextStep} disabled={!canAdvance}>
              Next
            </button>
          ) : (
            <button type="button" className="nav-btn primary" onClick={submitApplication}>
              Finish & apply
            </button>
          )}
        </div>

        <div className="result-banner">
          <strong>{qualification.qualified ? 'Qualified for the requested loan.' : 'Loan request to review.'}</strong>
          <p>{qualification.reason}</p>
          {statusMessage && <small>{statusMessage}</small>}
        </div>
      </section>
    </main>
  );
}

export default App;
