import { Button, Tooltip } from "@heroui/react";
import { FC, useState } from "react";

type PropsType = {
  onPress: () => void;
  isDisabled: boolean;
  color: "success" | "danger";
  label: string;
};

export const MatchDogButton: FC<PropsType> = (props) => {
  const { onPress, isDisabled, label, color } = props;
  const [mousedOver, setMousedOver] = useState(false);

  const onMouseOver = () => {
    setMousedOver(true);
  };

  const onMouseOut = () => {
    setMousedOver(false);
  };

  return (
    <Tooltip
      content="Add a dog to your favorites to get started"
      color="foreground"
      isOpen={isDisabled && mousedOver}
      showArrow
    >
      <span
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        className="w-full"
      >
        <Button
          onPress={onPress}
          isDisabled={isDisabled}
          color={color}
          className="w-full"
        >
          {label}
        </Button>
      </span>
    </Tooltip>
  );
};
