import { useMemo, useState } from 'react';
import './App.css';

const defaultForm = {
  memberName: 'Steve Gilbs',
  savings: 45500,
  monthsJoined: 30,
  hasDefaulted: false,
  requestedAmount: 120000,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value || 0);

function checkQualification(member, requestedAmount) {
  const savings = Number(member.savings || 0);
  const months = Number(member.monthsJoined || 0);
  const limit = months >= 24 ? savings * 4 : savings * 3;

  if (member.hasDefaulted) {
    return { qualified: false, reason: 'Has previous default', limit };
  }

  if (months < 6) {
    return { qualified: false, reason: 'Member must be 6+ months old', limit };
  }

  if (requestedAmount > limit) {
    return { qualified: false, reason: `Exceeds limit of ${formatCurrency(limit)}`, limit };
  }

  return { qualified: true, reason: 'Eligible for the requested loan amount.', limit };
}

function App() {
  const [formData, setFormData] = useState(defaultForm);
  const [result, setResult] = useState(() => checkQualification(defaultForm, defaultForm.requestedAmount));

  const changeHandler = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const calculateLimit = useMemo(() => {
    const savings = Number(formData.savings || 0);
    const months = Number(formData.monthsJoined || 0);
    return months >= 24 ? savings * 4 : savings * 3;
  }, [formData.savings, formData.monthsJoined]);

  const submitQualification = (event) => {
    event.preventDefault();
    const checked = checkQualification(formData, Number(formData.requestedAmount || 0));
    setResult(checked);
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setResult(checkQualification(defaultForm, defaultForm.requestedAmount));
  };

  return (
    <main className="page-shell">
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <section className="loan-card">
        <div className="header-band">
          <div>
            <p className="eyebrow">SACCO member portal</p>
            <h1>Loan Qualification Check</h1>
          </div>
          <div className="status-pill status-pill--neutral">Live eligibility</div>
        </div>

        <div className="summary-grid">
          <div className="summary-box summary-box--primary">
            <span>Available limit</span>
            <strong>{formatCurrency(calculateLimit)}</strong>
          </div>
          <div className="summary-box">
            <span>Member savings</span>
            <strong>{formatCurrency(Number(formData.savings || 0))}</strong>
          </div>
          <div className="summary-box">
            <span>Membership</span>
            <strong>{formData.monthsJoined || 0} months</strong>
          </div>
        </div>

        <form className="qualification-form" onSubmit={submitQualification}>
          <div className="field-group">
            <label htmlFor="memberName">Member name</label>
            <input
              id="memberName"
              name="memberName"
              type="text"
              value={formData.memberName}
              onChange={changeHandler}
              placeholder="Enter member name"
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="savings">Savings balance</label>
              <input
                id="savings"
                name="savings"
                type="number"
                min="0"
                value={formData.savings}
                onChange={changeHandler}
              />
            </div>

            <div className="field-group">
              <label htmlFor="monthsJoined">Membership duration</label>
              <input
                id="monthsJoined"
                name="monthsJoined"
                type="number"
                min="0"
                value={formData.monthsJoined}
                onChange={changeHandler}
              />
            </div>
          </div>

          <div className="field-row field-row--inline">
            <div className="field-group">
              <label htmlFor="requestedAmount">Requested loan amount</label>
              <input
                id="requestedAmount"
                name="requestedAmount"
                type="number"
                min="0"
                value={formData.requestedAmount}
                onChange={changeHandler}
              />
            </div>

            <label className="checkbox-box" htmlFor="hasDefaulted">
              <input
                id="hasDefaulted"
                name="hasDefaulted"
                type="checkbox"
                checked={formData.hasDefaulted}
                onChange={changeHandler}
              />
              <span>Previous default</span>
            </label>
          </div>

          <div className="button-row">
            <button type="submit" className="primary-btn">Check qualification</button>
            <button type="button" className="secondary-btn" onClick={resetForm}>Reset</button>
          </div>
        </form>

        <div className={`result-panel ${result.qualified ? 'result-panel--success' : 'result-panel--warning'}`}>
          <div className="result-badge">{result.qualified ? 'Qualified' : 'Not qualified'}</div>
          <h2>{result.qualified ? 'You are eligible to apply.' : 'Review before applying.'}</h2>
          <p>{result.reason}</p>
          <div className="result-meta">
            <span>Loan limit: {formatCurrency(result.limit)}</span>
            <span>Requested: {formatCurrency(Number(formData.requestedAmount || 0))}</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
