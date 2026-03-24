import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Kbd, TextField } from "@radix-ui/themes";
import { useEffect, useRef } from "react";

type InputProps = {
  id: string;
  type: "email" | "text";
  name: string;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  className?: string;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
};

const Input: React.FunctionComponent<InputProps> = ({ onChange, ...props }) => {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <TextField.Root
      ref={searchRef}
      {...props}
      onChange={(event) => {
        if (onChange) {
          onChange(event.target.value);
        }
      }}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon height="16" width="16" />
      </TextField.Slot>
      <TextField.Slot>
        <Kbd>/</Kbd>
      </TextField.Slot>
    </TextField.Root>
  );
};

export default Input;
