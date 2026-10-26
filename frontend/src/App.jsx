import { useState } from 'react';
import './App.css';

const buttons = [
  { label: 'C', type: 'clear' },
  { label: '+/-', type: 'toggle' },
  { label: '%', type: 'percent' },
  { label: '/', type: 'operator' },
  { label: '7', type: 'digit' },
  { label: '8', type: 'digit' },
  { label: '9', type: 'digit' },
  { label: '*', type: 'operator' },
  { label: '4', type: 'digit' },
  { label: '5', type: 'digit' },
  { label: '6', type: 'digit' },
  { label: '-', type: 'operator' },
  { label: '1', type: 'digit' },
  { label: '2', type: 'digit' },
  { label: '3', type: 'digit' },
  { label: '+', type: 'operator' },
  { label: '0', type: 'digit', wide: true },
  { label: '.', type: 'decimal' },
  { label: '=', type: 'equals' },
];

function calculate(firstValue, secondValue, operation) {
  switch (operation) {
    case '+':
      return firstValue + secondValue;
    case '-':
      return firstValue - secondValue;
    case '*':
      return firstValue * secondValue;
    case '/':
      return secondValue === 0 ? 'Error' : firstValue / secondValue;
    default:
      return secondValue;
  }
}

function App() {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForNext, setWaitingForNext] = useState(false);

  const resetCalculator = () => {
    setDisplay('0');
    setStoredValue(null);
    setOperator(null);
    setWaitingForNext(false);
  };

  const handleDigit = (value) => {
    if (waitingForNext) {
      setDisplay(String(value));
      setWaitingForNext(false);
      return;
    }

    setDisplay((current) => (current === '0' ? String(value) : current + value));
  };

  const handleDecimal = () => {
    if (waitingForNext) {
      setDisplay('0.');
      setWaitingForNext(false);
      return;
    }

    setDisplay((current) => (current.includes('.') ? current : `${current}.`));
  };

  const handleToggle = () => {
    const currentValue = Number(display);
    setDisplay(String(currentValue * -1));
  };

  const handlePercent = () => {
    const currentValue = Number(display) / 100;
    setDisplay(String(currentValue));
  };

  const handleOperator = (nextOperator) => {
    const value = Number(display);

    if (storedValue === null) {
      setStoredValue(value);
    } else if (operator) {
      const result = calculate(storedValue, value, operator);
      setStoredValue(result);
      setDisplay(String(result));
    }

    setOperator(nextOperator);
    setWaitingForNext(true);
  };

  const handleEquals = () => {
    if (operator === null || storedValue === null) {
      return;
    }

    const value = Number(display);
    const result = calculate(storedValue, value, operator);

    setDisplay(String(result));
    setStoredValue(null);
    setOperator(null);
    setWaitingForNext(true);
  };

  const handleButtonClick = (button) => {
    if (button.type === 'digit') {
      handleDigit(button.label);
      return;
    }

    if (button.type === 'decimal') {
      handleDecimal();
      return;
    }

    if (button.type === 'toggle') {
      handleToggle();
      return;
    }

    if (button.type === 'percent') {
      handlePercent();
      return;
    }

    if (button.type === 'clear') {
      resetCalculator();
      return;
    }

    if (button.type === 'operator') {
      handleOperator(button.label);
      return;
    }

    if (button.type === 'equals') {
      handleEquals();
    }
  };

  return (
    <main className="calculator-page">
      <div className="calculator">
        <div className="calculator-screen">
          <div className="calculator-history">
            {storedValue !== null ? `${storedValue} ${operator ?? ''}` : '0'}
          </div>
          <div className="calculator-display">{display}</div>
        </div>

        <div className="calculator-grid">
          {buttons.map((button) => (
            <button
              key={`${button.label}-${button.type}`}
              type="button"
              className={`key ${button.type} ${button.wide ? 'wide' : ''}`}
              onClick={() => handleButtonClick(button)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
