"use client";

import { Form, Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ChangeEventHandler, FormEventHandler, useState } from "react";

import { FetchSDKClient } from "@/lib/FetchSDK/client";

export const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    const result = await FetchSDKClient.AuthClient.login(name, email);
    if (result.result) {
      router.push("/search");
    }
  };

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <Form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        isRequired
        errorMessage="Please enter your name"
        label="Name"
        labelPlacement="outside"
        name="name"
        placeholder="Enter your name"
        value={name}
        onValueChange={setName}
      />
      <Input
        isRequired
        errorMessage="Please enter a valid email"
        label="Email"
        labelPlacement="outside"
        name="email"
        placeholder="Enter your email"
        type="email"
        value={email}
        onValueChange={setEmail}
      />
      <button type="submit" className="border-2">
        Submit
      </button>
    </Form>
  );
};
