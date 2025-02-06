import { FC } from "react";

import { Dog } from "@/lib/FetchSDK/models";

type PropsType = {
  dog: Dog;
};

export const DogCard: FC<PropsType> = (props) => {
  const { dog } = props;

  return (
    <div>
      <h3>{dog.name}</h3>
      <img src={dog.img} alt="Dog image" />
    </div>
  );
};
