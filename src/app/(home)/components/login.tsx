"use client";

import { Button, Form, Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";

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
    <Form onSubmit={onSubmit} className="ml-4 mt-2 flex flex-col gap-4">
      <p className="text-4xl text-white">Log In</p>
      <Input
        isRequired
        errorMessage="Please enter your name"
        label={<span className="text-xl font-bold text-black">Name</span>}
        labelPlacement="outside"
        name="name"
        placeholder="Enter your name"
        value={name}
        onValueChange={setName}
      />
      <Input
        isRequired
        errorMessage="Please enter a valid email"
        label={<span className="text-xl font-bold text-black">Email</span>}
        labelPlacement="outside"
        name="email"
        placeholder="Enter your email"
        type="email"
        value={email}
        onValueChange={setEmail}
      />
      <Button type="submit" color="success" className="w-full border-2">
        Log In
      </Button>
    </Form>
  );
};
