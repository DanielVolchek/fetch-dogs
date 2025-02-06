"use client";
import { useState } from "react";

import { SearchForm } from "./SearchForm";
import { SearchResults } from "./SearchResults";

export const Search = () => {
  const [dogs, setDogs] = useState();

  return (
    <div>
      <SearchResults dogs={[]} />
      <SearchForm />
    </div>
  );
};
