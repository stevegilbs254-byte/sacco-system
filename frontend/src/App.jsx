import { useMemo, useState } from 'react';
import './App.css';

const memberProfiles = [
  { name: 'Jane Wanjiku', role: 'Retailer', savings: 62000, tenure: '2 years', status: 'Eligible' },
  { name: 'Paul Otieno', role: 'Teacher', savings: 48000, tenure: '18 months', status: 'Eligible' },
  { name: 'Mary Njeri', role: 'Farmer', savings: 26000, tenure: '7 months', status: 'In review' },
  { name: 'Peter Kimani', role: 'Driver', savings: 74000, tenure: '3 years', status: 'Eligible' },
];

const starterComments = [
  { name: 'Lucy', text: 'The SACCO process is transparent and fair. I liked the quick checks.' },
  { name: 'James', text: 'The team explains each step clearly, which makes it easier to plan a loan.' },
];

const steps = [
  'Membership',
  'Profile',
  'Loan amount',
  'Community',
];

const defaultState = {
  yearsInSacco: '12',
  savings: '45000',
  hasDefaulted: false,
  hasLoanOpen: false,
  isRegularSaver: true,
  memberName: 'Steve Gilbs',
  requestedAmount: '120000',
  purpose: 'School fees',
};

function toMonths(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getQualification(form) {
  const months = toMonths(form.yearsInSacco);
  const savings = Number(form.savings || 0);
  const requestedAmount = Number(form.requestedAmount || 0);
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
      reason: `The requested amount exceeds your current maximum of ${formatCurrency(limit)}.`,
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

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const qualification = useMemo(() => getQualification(form), [form]);

  const submitComment = () => {
    const cleanComment = commentText.trim();
    if (!cleanComment) return;

    setComments((current) => [{ name: 'You', text: cleanComment }, ...current]);
    setCommentText('');
  };

  const isLastStep = currentStep === steps.length - 1;

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
            <h2>Tell us who you are</h2>
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
                <span>Member ID</span>
                <input type="text" value="SAC-2048" readOnly />
              </label>
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
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="panel community-panel">
            <div className="community-header">
              <h2>Community & feedback</h2>
              <div className={`result-pill ${qualification.qualified ? 'success' : 'warn'}`}>
                {qualification.qualified ? 'Eligible' : 'Needs review'}
              </div>
            </div>

            <div className="summary-boxes">
              <div className="mini-stat">
                <span>Current limit</span>
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
          </div>
        )}

        <div className="footer-actions">
          <button type="button" className="nav-btn secondary" onClick={prevStep} disabled={currentStep === 0}>
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button type="button" className="nav-btn primary" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="button" className="nav-btn primary" onClick={() => setCurrentStep(3)}>
              Finish
            </button>
          )}
        </div>

        <div className="result-banner">
          <strong>{qualification.qualified ? 'Qualified for the requested loan.' : 'Loan request to review.'}</strong>
          <p>{qualification.reason}</p>
        </div>
      </section>
    </main>
  );
}

export default App;
