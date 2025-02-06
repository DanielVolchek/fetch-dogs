import JSConfetti from "js-confetti";
import { FC, useEffect } from "react";

export const Confetti: FC = () => {
  useEffect(() => {
    const confetti = new JSConfetti();
    confetti.addConfetti();
  }, []);

  return <></>;
};
