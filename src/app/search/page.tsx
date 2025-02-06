import { Spinner } from "@heroui/react";
import { Suspense } from "react";

import { Search } from "./components/Search";

export default async function SearchPage() {
  return (
    <main>
      <TopContent />
      <Suspense fallback={<Spinner />}>
        <Search />
      </Suspense>
    </main>
  );
}

const TopContent = () => {
  return (
    <div className="flex h-32 items-center justify-center">
      <h1 className="inline-block text-4xl capitalize">
        Help one of these dogs find a new home
      </h1>
    </div>
  );
};
