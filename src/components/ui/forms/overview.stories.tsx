import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { fn } from "storybook/test";

import { Button } from "../button";
import { Checkbox } from "./checkbox";
import { ColorInput } from "./color-input";
import { FormInput } from "./form-input";
import { NumberInput } from "./number-input";
import { Select } from "./select";
import { Textarea } from "./textarea";
import { TextInput } from "./text-input";

// Docs for the forms layer as a whole: one complete react-hook-form form,
// shown in each state it can be in. FormInput is the shell and the controls
// render inside its render prop; each control's own stories cover its
// states in isolation.

type DemoValues = {
  name: string;
  type: string;
  size: number;
  color: string;
  notes: string;
  deprecated: boolean;
};

const typeOptions = [
  { value: "color", label: "Color" },
  { value: "dimension", label: "Dimension" },
  { value: "typography", label: "Typography" },
];

const emptyValues: Partial<DemoValues> = { type: "", color: "#3e63dd" };

const filledValues: DemoValues = {
  name: "primary-solid",
  type: "color",
  size: 16,
  color: "#3e63dd",
  notes: "Fill for primary buttons and selected states.",
  deprecated: false,
};

type DemoFormProps = {
  defaultValues?: Partial<DemoValues>;
  // Run validation on mount, so the errors show without submitting.
  validateOnMount?: boolean;
  disabled?: boolean;
  onSubmit: (values: DemoValues) => void;
};

const DemoForm = ({
  defaultValues = emptyValues,
  validateOnMount,
  disabled,
  onSubmit,
}: DemoFormProps) => {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<DemoValues>({ defaultValues, disabled });

  useEffect(() => {
    if (validateOnMount) void trigger();
  }, [validateOnMount, trigger]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "grid", gap: 16, maxWidth: 320 }}
      noValidate
    >
      <FormInput
        label="Token name"
        description="Used as the CSS custom property name."
        required
        error={errors.name}
      >
        {(control) => (
          <TextInput
            {...control}
            placeholder="e.g. primary-solid"
            {...register("name", {
              required: "Token name is required",
              pattern: { value: /^[a-z0-9-]+$/, message: "Use a-z, 0-9 and -" },
            })}
          />
        )}
      </FormInput>
      <FormInput label="Type" required error={errors.type}>
        {(control) => (
          <Select
            {...control}
            options={typeOptions}
            placeholder="Pick a type"
            {...register("type", { required: "Pick a type" })}
          />
        )}
      </FormInput>
      <FormInput
        label="Size"
        description="In pixels, 0 to 64."
        required
        error={errors.size}
      >
        {(control) => (
          <NumberInput
            {...control}
            {...register("size", {
              valueAsNumber: true,
              validate: (value) => !Number.isNaN(value) || "Enter a size",
              min: { value: 0, message: "Must be at least 0" },
              max: { value: 64, message: "Must be 64 or less" },
            })}
          />
        )}
      </FormInput>
      <FormInput label="Colour" error={errors.color}>
        {(control) => <ColorInput {...control} {...register("color")} />}
      </FormInput>
      <FormInput label="Notes" description="Shown as the token's $description.">
        {(control) => <Textarea {...control} {...register("notes")} />}
      </FormInput>
      <FormInput
        inline
        label="Deprecated"
        description="Flags the token in the editor."
      >
        {(control) => <Checkbox {...control} {...register("deprecated")} />}
      </FormInput>
      <Button type="submit" disabled={disabled}>
        Save token
      </Button>
    </form>
  );
};

const meta = {
  component: DemoForm,
  args: { onSubmit: fn() },
  argTypes: {
    defaultValues: { control: false },
    onSubmit: { control: false },
  },
} satisfies Meta<typeof DemoForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// Empty and untouched: submit to see the validation errors.
export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValues: filledValues },
};

export const WithErrors: Story = {
  args: {
    defaultValues: { ...emptyValues, name: "Primary Solid", size: 100 },
    validateOnMount: true,
  },
};

export const Disabled: Story = {
  args: { defaultValues: filledValues, disabled: true },
};
