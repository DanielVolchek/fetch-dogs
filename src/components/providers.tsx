"use client";

import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, ReactNode } from "react";

const client = new QueryClient();

export const Providers: FC<{ children: ReactNode }> = (props) => {
  const { children } = props;

  return (
    <QueryClientProvider client={client}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </QueryClientProvider>
  );
};
