import { Input } from "./input";

export default function MultiInput({
  setInputs,
  currentInput,
  setCurrentInput,
}: {
  setInputs: (updater: (prevInputs: Set<string>) => Set<string>) => void;
  currentInput: string;
  setCurrentInput: (string: string) => void;
}) {
  return (
    <Input
      type="text"
      placeholder="Press Enter after typing a tag"
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
