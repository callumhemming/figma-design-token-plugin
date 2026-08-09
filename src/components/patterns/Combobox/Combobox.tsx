import { InputHTMLAttributes, KeyboardEvent, useState } from "react";
import styles from "./Combobox.module.scss";

export type ComboboxOption = {
  value: string;
  meta?: string;
};

type ComboboxProps = {
  value: string;
  options: ComboboxOption[];
  onSelect: (value: string) => void;
  filterOption?: (option: ComboboxOption, value: string) => boolean;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
};

function defaultFilterOption(option: ComboboxOption, value: string) {
  return option.value.toLowerCase().includes(value.toLowerCase());
}

export function Combobox({
  value,
  options,
  onSelect,
  filterOption = defaultFilterOption,
  inputProps = {},
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  // -1 means "nothing highlighted" — the dropdown opens on focus alone, so
  // defaulting this to 0 made the very first Enter press silently select
  // whatever happened to be first in the list instead of doing whatever an
  // untouched Enter press is supposed to do (e.g. submitting a parent form).
  const [activeIndex, setActiveIndex] = useState(-1);

  const filteredOptions = options.filter((option) =>
    filterOption(option, value),
  );
  const clampedActiveIndex = Math.min(
    activeIndex,
    filteredOptions.length - 1,
  );

  function selectOption(optionValue: string) {
    onSelect(optionValue);
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    inputProps.onKeyDown?.(event);
    if (!isOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (event.key === "Enter") {
      const active =
        clampedActiveIndex >= 0
          ? filteredOptions[clampedActiveIndex]
          : undefined;
      if (active) {
        event.preventDefault();
        selectOption(active.value);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <input
        autoComplete="off"
        {...inputProps}
        onChange={(event) => {
          inputProps.onChange?.(event);
          setActiveIndex(-1);
          setIsOpen(true);
        }}
        onFocus={(event) => {
          inputProps.onFocus?.(event);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {isOpen && filteredOptions.length > 0 ? (
        <ul className={styles.dropdown}>
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              // preventDefault here only stops the input from blurring;
              // the actual selection happens on click, which fires after
              // this mousedown has finished bubbling to ClickAwayListener's
              // document-level handler. Selecting here instead would
              // unmount this <li> mid-bubble, so by the time that handler
              // ran, event.target would already be detached and
              // ref.current.contains() would (wrongly) report an outside
              // click, closing the whole form.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option.value)}
              className={
                index === clampedActiveIndex
                  ? `${styles.option} ${styles.optionActive}`
                  : styles.option
              }
            >
              <span>{option.value}</span>
              {option.meta ? (
                <span className={styles.optionMeta}>{option.meta}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
