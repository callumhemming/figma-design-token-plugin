import clsx from "clsx";
import { ReactNode, useId } from "react";
import { FieldError } from "react-hook-form";
import styles from "./form-input.module.scss";

// Spread onto the control so it's tied to the label, description and error.
export type FormInputControlProps = {
  id: string;
  required?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

type FormInputProps = {
  label: string;
  // Renders the control. The parent applies `register` itself; FormInput
  // only supplies the id and aria props.
  children: (control: FormInputControlProps) => ReactNode;
  description?: string;
  required?: boolean;
  // `formState.errors.<field>` from react-hook-form.
  error?: FieldError;
  // Control first with the label beside it, for checkboxes.
  inline?: boolean;
  id?: string;
  className?: string;
};

export const FormInput = ({
  label,
  children,
  description,
  required,
  error,
  inline,
  id,
  className,
}: FormInputProps) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const errorMessage = error?.message;

  const describedBy = clsx(
    description && descriptionId,
    errorMessage && errorId,
  );

  return (
    <div
      className={clsx(styles.formInputRoot, inline && styles.inline, className)}
    >
      <label className={styles.label} htmlFor={controlId}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {description ? (
        <span id={descriptionId} className={styles.description}>
          {description}
        </span>
      ) : null}
      <div className={styles.control}>
        {children({
          id: controlId,
          required,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy || undefined,
        })}
      </div>
      {errorMessage ? (
        <span id={errorId} className={styles.error} role="alert">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
};
