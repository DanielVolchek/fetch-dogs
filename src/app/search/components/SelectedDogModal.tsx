import { Modal, ModalBody, ModalContent, Spinner } from "@heroui/react";
import { FC } from "react";

import { Confetti } from "@/components/Confetti";
import { Dog } from "@/lib/FetchSDK/models";

import { DogCard } from "./DogCard";

type PropsType = {
  match: Dog | undefined | null;
  isPending: boolean;
  onClose: () => void;
};

export const SelectedDogModal: FC<PropsType> = (props) => {
  const { match, onClose, isPending } = props;

  return (
    <Modal
      backdrop="blur"
      isOpen={true}
      onClose={onClose}
      isDismissable={false}
      className="w-full"
    >
      <ModalContent>
        <ModalBody className="w-full p-8">
          {isPending || !match ? (
            <Spinner />
          ) : (
            <>
              <Confetti />
              <h2>Your dog is </h2>
              <DogCard dog={match} staticCard={true} />
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
