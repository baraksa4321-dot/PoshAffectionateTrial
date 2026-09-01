import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";

type FreeTextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "type" | "value"
> & {
  defaultValue?: InputHTMLAttributes<HTMLInputElement>["defaultValue"];
  value?: InputHTMLAttributes<HTMLInputElement>["value"];
};

function inputValue(value: FreeTextInputProps["value"] | FreeTextInputProps["defaultValue"]) {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join("");
  if (typeof value === "number" && !Number.isFinite(value)) return "";
  return String(value);
}

/**
 * Keeps the browser input editable while a form state normalizes its value.
 * In particular, a user can clear a numeric value before entering a new one.
 */
export function FreeTextInput({
  defaultValue,
  value,
  inputMode,
  onChange,
  onFocus,
  onBlur,
  ...props
}: FreeTextInputProps) {
  const isControlled = value !== undefined;
  const [draft, setDraft] = useState(() => inputValue(value ?? defaultValue));
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (isControlled && !isFocusedRef.current) {
      setDraft(inputValue(value));
    }
  }, [isControlled, value]);

  return (
    <input
      {...props}
      type="text"
      inputMode={inputMode ?? "decimal"}
      value={isControlled && !isFocusedRef.current ? inputValue(value) : draft}
      onFocus={(event) => {
        isFocusedRef.current = true;
        onFocus?.(event);
      }}
      onChange={(event) => {
        setDraft(event.currentTarget.value);
        onChange?.(event);
      }}
      onBlur={(event) => {
        isFocusedRef.current = false;
        onBlur?.(event);
      }}
    />
  );
}
