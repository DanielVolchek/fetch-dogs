import { Card, CardBody, CardHeader, Image } from "@heroui/react";
import NextImage from "next/image";
import { FC, useState } from "react";

import { HeartIcon } from "@/components/HeartIcon";
import { Dog } from "@/lib/FetchSDK/models";

type PropsType = {
  dog: Dog;
  favorite: boolean;
  toggleFavoriteState: () => void;
};

export const DogCard: FC<PropsType> = (props) => {
  const { dog, favorite, toggleFavoriteState } = props;

  const [mousedOver, setMousedOver] = useState(false);

  const onMouseOver = () => {
    setMousedOver(true);
  };
  const onMouseOut = () => {
    setMousedOver(false);
  };

  const onClick = () => {
    toggleFavoriteState();
  };

  return (
    <Card
      className="hover:-translate-y-4"
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <CardBody>
        <div className="relative flex w-[400px] gap-4 pl-0 pt-4">
          <Image
            src={dog.img}
            as={NextImage}
            width={250}
            height={250}
            className="rounded-full object-cover object-center"
            alt={`Dog: ${dog.name}; Age: ${dog.age}; Breed: ${dog.breed}`}
          />
          <div className="flex flex-col justify-center">
            <h3 className="inline-block text-3xl">{dog.name}</h3>
            <p>{dog.age} years old</p>
            <p>{dog.breed}</p>
            <p>{dog.zip_code}</p>
          </div>
        </div>

        {(mousedOver || favorite) && (
          <button className="absolute right-5 top-5" onClick={onClick}>
            <HeartIcon
              stroke="red"
              fill={favorite ? "red" : "none"}
              className="cursor-pointer hover:fill-[red]"
            />
          </button>
        )}
      </CardBody>
    </Card>
  );
};
