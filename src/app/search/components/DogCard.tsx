import { Card, CardBody, CardHeader, Image } from "@heroui/react";
import NextImage from "next/image";
import { FC } from "react";

import { Dog } from "@/lib/FetchSDK/models";

type PropsType = {
  dog: Dog;
};

export const DogCard: FC<PropsType> = (props) => {
  const { dog } = props;

  const onPress = () => {};

  return (
    <Card isPressable onPress={onPress} className="hover:-translate-y-4">
      <CardBody>
        <div className="flex w-[400px] gap-4 pl-0 pt-4">
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
      </CardBody>
    </Card>
  );
};
