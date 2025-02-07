import JSConfetti from "js-confetti";
import { FC, useEffect } from "react";

let didConfetti = false;

export const Confetti: FC = () => {
  useEffect(() => {
    if (!didConfetti) {
      const confetti = new JSConfetti();
      confetti.addConfetti();
    }
    didConfetti = true;
  }, []);

  return <></>;
};
