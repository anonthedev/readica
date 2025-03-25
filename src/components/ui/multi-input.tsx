import { Input } from "./input";

export default function MultiInput({
  setInputs,
  currentInput,
  setCurrentInput,
  placeholder
}: {
  setInputs: (updater: (prevInputs: Set<string>) => Set<string>) => void;
  currentInput: string;
  setCurrentInput: (string: string) => void;
  placeholder: string
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
          if (currentInput.length > 0) {
            setInputs((prevInputs) => new Set(prevInputs).add(currentInput));
            setCurrentInput("");
          }
        }
      }}
    />
  );
}