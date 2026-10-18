import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";

import { Button } from "../../button";
import { Checkbox } from "../checkbox";
import { ColorInput } from "../color-input";
import { NumberInput } from "../number-input";
import { Select } from "../select";
import { Textarea } from "../textarea";
import { TextInput } from "../text-input";
import { FormInput } from "./form-input";

const meta = {
  component: FormInput,
  args: {
    label: "Token name",
    children: (control) => <TextInput {...control} />,
  },
  argTypes: {
    children: { control: false },
    error: { control: false },
  },
} satisfies Meta<typeof FormInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: "Used as the CSS custom property name." },
};

export const Required: Story = {
  args: { required: true },
};

export const WithError: Story = {
  args: {
    required: true,
    description: "Used as the CSS custom property name.",
    error: { type: "required", message: "Token name is required" },
  },
};

export const Inline: Story = {
  args: {
    inline: true,
    label: "Include in export",
    description: "Adds this token to the generated CSS.",
    children: (control) => <Checkbox {...control} />,
  },
};

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

// Every control wired to a real react-hook-form instance: submit empty to
// see the errors.
export const WithReactHookForm: Story = {
  render: () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<DemoValues>({ defaultValues: { color: "#3e63dd" } });

    return (
      <form
        onSubmit={handleSubmit(() => {})}
        style={{ display: "grid", gap: 16, maxWidth: 320 }}
        noValidate
      >
        <FormInput label="Token name" required error={errors.name}>
          {(control) => (
            <TextInput
              {...control}
              placeholder="e.g. primary-solid"
              {...register("name", { required: "Token name is required" })}
            />
          )}
        </FormInput>
        <FormInput label="Type" required error={errors.type}>
          {(control) => (
            <Select
              {...control}
              options={typeOptions}
              placeholder="Pick a type"
              defaultValue=""
              {...register("type", { required: "Pick a type" })}
            />
          )}
        </FormInput>
        <FormInput
          label="Size"
          description="In pixels, 0 to 64."
          error={errors.size}
        >
          {(control) => (
            <NumberInput
              {...control}
              {...register("size", {
                valueAsNumber: true,
                min: { value: 0, message: "Must be at least 0" },
                max: { value: 64, message: "Must be 64 or less" },
              })}
            />
          )}
        </FormInput>
        <FormInput label="Colour" error={errors.color}>
          {(control) => <ColorInput {...control} {...register("color")} />}
        </FormInput>
        <FormInput
          label="Notes"
          description="Shown as the token's $description."
        >
          {(control) => <Textarea {...control} {...register("notes")} />}
        </FormInput>
        <FormInput inline label="Deprecated">
          {(control) => <Checkbox {...control} {...register("deprecated")} />}
        </FormInput>
        <Button type="submit">Submit</Button>
      </form>
    );
  },
};
