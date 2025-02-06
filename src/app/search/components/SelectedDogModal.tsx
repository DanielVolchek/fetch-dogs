import { Modal, useDisclosure } from "@heroui/react";
import { FC } from "react";

import { Dog } from "@/lib/FetchSDK/models";
import { DogClient } from "@/lib/FetchSDK/services/DogClient";

import { DogCard, StaticDogCard } from "./DogCard";

type PropsType = {
  dog: Dog;
};

export const SelectedDogModal: FC<PropsType> = (props) => {
  const { dog } = props;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <Modal backdrop="blur" isOpen={isOpen}>
      <h2>Your dog is </h2>
      <StaticDogCard dog={dog} />
    </Modal>
  );
};
