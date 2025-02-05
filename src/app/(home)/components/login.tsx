"use client";

import { ChangeEventHandler, useState } from "react";

import { FetchSDKClient } from "@/lib/FetchSDK/client";

export const Login = () => {
  const fetchSDK = FetchSDKClient;

  const [username, setUsername] = useState("");
  const [password, setPasword] = useState("");

  const onSubmit = () => {
    fetchSDK.login(username, password);
  };

  return (
    <form>
      <input />
      <input />
    </form>
  );
};
