import { useForm } from "react-hook-form";
import { ColorInput, FormInput } from "../../../../ui/forms";

type ColorEditValues = {
  value: string;
};

export const ColorEdit = () => {
  const {
    register,
    formState: { errors },
  } = useForm<ColorEditValues>({ defaultValues: { value: "#1c2024" } });

  return (
    <form>
      <FormInput
        label="Value"
        description="Primitives hold literal values."
        required
        error={errors.value}
      >
        {(control) => (
          <ColorInput
            {...control}
            {...register("value", { required: "Pick a colour" })}
          />
        )}
      </FormInput>
    </form>
  );
};
