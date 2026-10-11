import {
  ArrayElementWrapperProps,
  ArrayWrapperProps,
  AutoFormFieldProps,
  FieldWrapperProps,
  ObjectWrapperProps,
} from "@autoform/react";
import { AutoForm, useRegister } from "@autoform/react/react-hook-form";
import { ZodProvider } from "@autoform/zod";
import { ComponentProps, ReactNode } from "react";
import { Button } from "../../ui/Button";
import { Typography } from "../../ui/Typography";
import { resolverSchema } from "../../../tokens/resolver.schema";
import styles from "./ResolverSettingsForm.module.scss";

// resolverSchema only produces "string", "object" and "array" field types
// today (see resolver.schema.ts), so this is the full set of renderers
// AutoForm needs — no UI kit (MUI/Mantine/shadcn) is installed in this
// project, so these are hand-rolled plain elements rather than borrowed
// from one of AutoForm's prebuilt integrations.
const schemaProvider = new ZodProvider(resolverSchema);

const StringField = ({ path, id, inputProps }: AutoFormFieldProps) => {
  const field = useRegister(path.join("."));
  return <input id={id} className={styles.input} {...field} {...inputProps} />;
};

const Form = (props: ComponentProps<"form">) => (
  <form {...props} className={styles.form} />
);

const FieldWrapper = ({ label, error, id, children }: FieldWrapperProps) => (
  <label className={styles.field} htmlFor={id}>
    {typeof label === "string" ? (
      <Typography variant="subtitle2" as="span" className={styles.label}>
        {label}
      </Typography>
    ) : (
      label
    )}
    {children}
    {typeof error === "string" && error ? (
      <Typography variant="caption" className={styles.error}>
        {error}
      </Typography>
    ) : (
      error || null
    )}
  </label>
);

const ErrorMessage = ({ error }: { error: string }) => (
  <Typography variant="caption" as="p" className={styles.error}>
    {error}
  </Typography>
);

const SubmitButton = ({ children }: { children: ReactNode }) => (
  <Button type="submit" className={styles.submit}>
    {children}
  </Button>
);

const ObjectWrapper = ({ label, children }: ObjectWrapperProps) => (
  <fieldset className={styles.object}>
    {typeof label === "string" ? (
      <Typography variant="subtitle2" as="legend" className={styles.legend}>
        {label}
      </Typography>
    ) : (
      <legend className={styles.legend}>{label}</legend>
    )}
    {children}
  </fieldset>
);

const ArrayWrapper = ({ label, children, onAddItem }: ArrayWrapperProps) => (
  <fieldset className={styles.array}>
    {typeof label === "string" ? (
      <Typography variant="subtitle2" as="legend" className={styles.legend}>
        {label}
      </Typography>
    ) : (
      <legend className={styles.legend}>{label}</legend>
    )}
    {children}
    <Button type="button" className={styles.addButton} onClick={onAddItem}>
      Add
    </Button>
  </fieldset>
);

const ArrayElementWrapper = ({
  children,
  onRemove,
}: ArrayElementWrapperProps) => (
  <div className={styles.arrayItem}>
    {children}
    <Button type="button" className={styles.removeButton} onClick={onRemove}>
      Remove
    </Button>
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
        // console.log("[ResolverSettingsForm] submitted", values);
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
