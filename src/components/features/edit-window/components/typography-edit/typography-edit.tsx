import { useForm } from "react-hook-form";
import { Combobox, ComboboxOption, FormInput } from "../../../../ui/forms";
import styles from "./typography-edit.module.scss";

type TypographyEditValues = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
};

// Each property aliases a primitive, so the options are reference strings
// with the primitive's literal value beside them. Placeholder until the
// window reads from the tokens context.
const aliases = (
  group: string,
  primitives: Record<string, string>,
): ComboboxOption[] =>
  Object.entries(primitives).map(([name, meta]) => ({
    value: `{p.${group}.${name}}`,
    meta,
  }));

const fields: {
  name: keyof TypographyEditValues;
  label: string;
  options: ComboboxOption[];
}[] = [
  {
    name: "fontFamily",
    label: "Font family",
    options: aliases("font-family", { sans: "Inter" }),
  },
  {
    name: "fontSize",
    label: "Font size",
    options: aliases("font-size", {
      "step-n2": "0.6944rem",
      "step-n1": "0.8333rem",
      "step-0": "1rem",
      "step-1": "1.2rem",
      "step-2": "1.44rem",
      "step-3": "1.728rem",
      "step-4": "2.0736rem",
      "step-5": "2.4883rem",
    }),
  },
  {
    name: "fontWeight",
    label: "Font weight",
    options: aliases("font-weight", {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    }),
  },
  {
    name: "lineHeight",
    label: "Line height",
    options: aliases("line-height", {
      tight: "1.2",
      snug: "1.35",
      normal: "1.5",
    }),
  },
  {
    name: "letterSpacing",
    label: "Letter spacing",
    options: aliases("letter-spacing", {
      tight: "-0.02rem",
      normal: "0rem",
      wide: "0.05rem",
      wider: "0.1rem",
    }),
  },
];

// s.typography.heading1, from global/semantic/typography.json.
const defaultValues: TypographyEditValues = {
  fontFamily: "{p.font-family.sans}",
  fontSize: "{p.font-size.step-5}",
  fontWeight: "{p.font-weight.bold}",
  lineHeight: "{p.line-height.tight}",
  letterSpacing: "{p.letter-spacing.tight}",
};

export const TypographyEdit = () => {
  const {
    register,
    formState: { errors },
  } = useForm<TypographyEditValues>({ defaultValues, mode: "onBlur" });

  return (
    <form className={styles.fields}>
      {fields.map(({ name, label, options }) => (
        <FormInput key={name} label={label} required error={errors[name]}>
          {(control) => (
            <Combobox
              {...control}
              options={options}
              {...register(name, {
                required: `Pick a ${label.toLowerCase()}`,
                // The combobox takes free text, so check it's a real alias.
                validate: (value) =>
                  options.some((option) => option.value === value) ||
                  `Pick a ${label.toLowerCase()} from the list`,
              })}
            />
          )}
        </FormInput>
      ))}
    </form>
  );
};
