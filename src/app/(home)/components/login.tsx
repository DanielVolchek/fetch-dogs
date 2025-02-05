"use client";

import { ChangeEventHandler, FormEventHandler, useState } from "react";

import { FetchSDKClient } from "@/lib/FetchSDK/client";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPasword] = useState("");

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    FetchSDKClient.AuthClient.login(username, password).then(() =>
      console.log("login"),
    );
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input placeholder="username" className="w-[100px]" />
      <input placeholder="password" className="w-[100px]" />
    </form>
  );
};
