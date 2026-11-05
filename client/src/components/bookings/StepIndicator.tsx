const STEPS = ['Dates & rooms', 'Guest details', 'Payment', 'Confirmation'];

export default function StepIndicator({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="steps" aria-label="Booking progress">
      {STEPS.map((label, index) => {
        const number = index + 1;
        const state = number < current ? 'done' : number === current ? 'current' : 'todo';
        return (
          <li
            key={label}
            className={`step step-${state}`}
            aria-current={number === current ? 'step' : undefined}
          >
            <span className="step-dot">{state === 'done' ? '✓' : number}</span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}