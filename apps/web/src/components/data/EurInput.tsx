import * as React from 'react';
import { Input } from '@/components/ui/input';

/**
 * Input that displays a EUR amount in decimal form (e.g. 1234.56)
 * and emits an integer cents value via onChangeCents.
 */
type Props = {
  valueCents: number;
  onChangeCents: (cents: number) => void;
  disabled?: boolean;
};

export const EurInput = React.forwardRef<HTMLInputElement, Props>(
  ({ valueCents, onChangeCents, disabled }, ref) => {
    const [text, setText] = React.useState<string>(() => (valueCents / 100).toFixed(2));

    React.useEffect(() => {
      setText((valueCents / 100).toFixed(2));
    }, [valueCents]);

    return (
      <Input
        ref={ref}
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        value={text}
        disabled={disabled}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          const parsed = Number.parseFloat(raw);
          if (!Number.isNaN(parsed)) {
            onChangeCents(Math.round(parsed * 100));
          }
        }}
        className="font-mono tabular-nums"
      />
    );
  },
);
EurInput.displayName = 'EurInput';
