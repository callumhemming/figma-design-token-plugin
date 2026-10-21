import { Ref } from "react";

// React tracks an input's last value, so assigning `.value` directly and
// firing "input" wouldn't reach onChange. Going through the prototype's
// setter does, which is how a value picked outside the keyboard (an
// eyedropper, a combobox option) reaches react-hook-form.
export const setNativeValue = (input: HTMLInputElement, value: string) => {
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

export const assignRef = <T>(ref: Ref<T> | undefined, value: T | null) => {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
};
