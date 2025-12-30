import React from 'react';
import { NumericFormat } from 'react-number-format';
import { Control, Controller } from 'react-hook-form';

interface CurrencyInputProps {
    name: string;
    control: Control<any>;
    label: string;
    showLabel?: boolean; // Optional prop to hide label
    placeholder?: string;
    readOnly?: boolean;
    error?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
    name,
    control,
    label,
    showLabel = true, // Default to true
    placeholder,
    readOnly,
    error
}) => {
    return (
        <div>
            {showLabel && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <Controller
                    name={name}
                    control={control}
                    render={({ field: { onChange, value, ref, onBlur } }) => (
                        <NumericFormat
                            getInputRef={ref}
                            value={value}
                            onValueChange={(values) => {
                                onChange(values.floatValue ?? 0);
                            }}
                            onBlur={onBlur} // Important for touched state
                            thousandSeparator=","
                            decimalSeparator="."
                            decimalScale={2}
                            fixedDecimalScale
                            placeholder={placeholder}
                            readOnly={readOnly}
                            className={`block w-full rounded-md border border-gray-300 pl-7 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm ${readOnly ? 'bg-gray-50 dark:bg-zinc-900 text-gray-500' : ''
                                }`}
                        />
                    )}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
