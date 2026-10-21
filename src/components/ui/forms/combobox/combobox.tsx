import clsx from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithRef,
  KeyboardEvent,
  useId,
  useRef,
  useState,
} from "react";
import { assignRef, setNativeValue } from "../native-value";
import styles from "./combobox.module.scss";

export type ComboboxOption = {
  value: string;
  // Shown dimmed beside the value, e.g. what a reference resolves to.
  meta?: string;
};

// A text input with a list of suggestions. Props go to the native input, so
// `register` works as with any other control; picking an option writes it
// into the input as if it had been typed. The value is free text, so
// validate it if it has to be one of the options.
type ComboboxProps = {
  options: ComboboxOption[];
  filterOption?: (option: ComboboxOption, query: string) => boolean;
} & Omit<ComponentPropsWithRef<"input">, "type" | "role">;

const defaultFilterOption = (option: ComboboxOption, query: string) =>
  option.value.toLowerCase().includes(query.toLowerCase());

export const Combobox = ({
  options,
  filterOption = defaultFilterOption,
  className,
  ref,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: ComboboxProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  // null until the user types, so focusing a filled input lists every
  // option rather than only the one it already holds.
  const [query, setQuery] = useState<string | null>(null);
  // -1 means "nothing highlighted" -- the list opens on focus alone, so
  // defaulting to 0 would make an untouched Enter press select the first
  // option instead of doing what Enter normally does (submitting the form).
  const [activeIndex, setActiveIndex] = useState(-1);

  const filteredOptions =
    query === null
      ? options
      : options.filter((option) => filterOption(option, query));
  const clampedActiveIndex = Math.min(activeIndex, filteredOptions.length - 1);
  const showList = isOpen && filteredOptions.length > 0;
  const optionId = (index: number) => `${listboxId}-${index}`;

  const attachRef = (el: HTMLInputElement | null) => {
    assignRef(ref, el);
    inputRef.current = el;
  };

  const open = () => {
    setQuery(null);
    setActiveIndex(-1);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setQuery(null);
  };

  const selectOption = (value: string) => {
    if (inputRef.current) setNativeValue(inputRef.current, value);
    close();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    setQuery(event.target.value);
    setActiveIndex(-1);
    setIsOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === "ArrowDown" && !isOpen) {
      event.preventDefault();
      open();
      return;
    }
    if (!showList) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (event.key === "Enter") {
      const active = filteredOptions[clampedActiveIndex];
      if (active) {
        event.preventDefault();
        selectOption(active.value);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  return (
    <div className={clsx(styles.comboboxRoot, className)}>
      <input
        ref={attachRef}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-activedescendant={
          showList && clampedActiveIndex >= 0
            ? optionId(clampedActiveIndex)
            : undefined
        }
        className={styles.input}
        onChange={handleChange}
        onFocus={(event) => {
          onFocus?.(event);
          open();
        }}
        onBlur={(event) => {
          onBlur?.(event);
          close();
        }}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {showList ? (
        <ul id={listboxId} role="listbox" className={styles.listbox}>
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={index === clampedActiveIndex}
              className={clsx(
                styles.option,
                index === clampedActiveIndex && styles.active,
              )}
              // Keeps focus in the input, so its blur doesn't close the list
              // before the click lands. Selecting on click rather than here
              // also matters inside ClickAwayListener: unmounting the option
              // mid-mousedown would detach event.target before its
              // document-level handler runs, which reads as an outside click.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option.value)}
            >
              <span>{option.value}</span>
              {option.meta ? (
                <span className={styles.meta}>{option.meta}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
