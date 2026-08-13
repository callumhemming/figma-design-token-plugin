import { ZodProvider } from "@autoform/zod";
import { ComponentProps, ReactNode } from "react";
import {
  ArrayElementWrapperProps,
  ArrayWrapperProps,
  AutoFormFieldProps,
  FieldWrapperProps,
  ObjectWrapperProps,
} from "@autoform/react";
import { AutoForm, useRegister } from "@autoform/react/react-hook-form";
import styles from "./ResolverSettingsForm.module.scss";
import { resolverSchema } from "../../../tokens/resolver.schema";

// resolverSchema only produces "string", "object" and "array" field types
// today (see resolver.schema.ts), so this is the full set of renderers
// AutoForm needs — no UI kit (MUI/Mantine/shadcn) is installed in this
// project, so these are hand-rolled plain elements rather than borrowed
// from one of AutoForm's prebuilt integrations.
const schemaProvider = new ZodProvider(resolverSchema);

const StringField = ({ path, id, inputProps }: AutoFormFieldProps) => {
  const field = useRegister(path.join("."));
  return (
    <input id={id} className={styles.input} {...field} {...inputProps} />
  );
};

const Form = (props: ComponentProps<"form">) => (
  <form {...props} className={styles.form} />
);

const FieldWrapper = ({ label, error, id, children }: FieldWrapperProps) => (
  <label className={styles.field} htmlFor={id}>
    <span className={styles.label}>{label}</span>
    {children}
    {error ? <span className={styles.error}>{error}</span> : null}
  </label>
);

const ErrorMessage = ({ error }: { error: string }) => (
  <p className={styles.error}>{error}</p>
);

const SubmitButton = ({ children }: { children: ReactNode }) => (
  <button type="submit" className={styles.submit}>
    {children}
  </button>
);

const ObjectWrapper = ({ label, children }: ObjectWrapperProps) => (
  <fieldset className={styles.object}>
    <legend className={styles.legend}>{label}</legend>
    {children}
  </fieldset>
);

const ArrayWrapper = ({ label, children, onAddItem }: ArrayWrapperProps) => (
  <fieldset className={styles.array}>
    <legend className={styles.legend}>{label}</legend>
    {children}
    <button type="button" className={styles.addButton} onClick={onAddItem}>
      Add
    </button>
  </fieldset>
);

const ArrayElementWrapper = ({
  children,
  onRemove,
}: ArrayElementWrapperProps) => (
  <div className={styles.arrayItem}>
    {children}
    <button type="button" className={styles.removeButton} onClick={onRemove}>
      Remove
    </button>
  </div>
);

export function ResolverSettingsForm() {
  return (
    <AutoForm
      schema={schemaProvider}
      withSubmit
      onSubmit={(values) => {
        // Wiring this up to actually write resolver.json is still to come
        // — for now, submitting just proves the schema/form round-trips.
        console.log("[ResolverSettingsForm] submitted", values);
      }}
      uiComponents={{
        Form,
        FieldWrapper,
        ErrorMessage,
        SubmitButton,
        ObjectWrapper,
        ArrayWrapper,
        ArrayElementWrapper,
      }}
      formComponents={{
        string: StringField,
      }}
    />
  );
}
