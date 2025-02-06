import { Input } from "@heroui/react";
import { FC } from "react";

type PropsType = {
  minAge: number | null;
  maxAge: number | null;
  setMinAge: (age: number | null) => void;
  setMaxAge: (age: number | null) => void;
};

export const AgeFilters: FC<PropsType> = (props) => {
  const { maxAge, minAge, setMaxAge, setMinAge } = props;

  const onValueChange = (val: string) => {
    let numVal;
    try {
      numVal = parseInt(val);
      return Math.max(numVal, 0);
    } catch {
      return null;
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        label="Min Age"
        placeholder="Set Min Age"
        labelPlacement="outside"
        value={minAge?.toString()}
        onValueChange={(val) => setMinAge(onValueChange(val))}
      />
      <Input
        type="number"
        label="Max Age"
        placeholder="Set Max Age"
        labelPlacement="outside"
        value={maxAge?.toString()}
        onValueChange={(val) => setMaxAge(onValueChange(val))}
      />
    </div>
  );
};
