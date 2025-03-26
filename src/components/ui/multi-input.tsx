import { Input } from "./input";

export default function MultiInput({
  setInputs,
  inputs,
  maxInputs,
  currentInput,
  setCurrentInput,
  placeholder,
}: {
  setInputs: (updater: (prevInputs: Set<string>) => Set<string>) => void;
  inputs: Set<string>;
  maxInputs?: number;
  currentInput: string;
  setCurrentInput: (string: string) => void;
  placeholder: string;
}) {
  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={currentInput}
      onChange={(e) => {
        setCurrentInput(e.target.value);
      }}
      onKeyDownCapture={(e) => {
        if (e.key === "Enter") {
          if (maxInputs) {
            if (
              currentInput.length > 0 &&
              Array.from(inputs).length < maxInputs
            ) {
              setInputs((prevInputs) => new Set(prevInputs).add(currentInput));
              setCurrentInput("");
            }
          } else {
            if (currentInput.length > 0) {
              setInputs((prevInputs) => new Set(prevInputs).add(currentInput));
              setCurrentInput("");
            }
          }
        }
      }}
    />
  );
}
