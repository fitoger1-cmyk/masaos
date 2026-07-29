import { useContext } from "react";

import {
  WebContext,
} from "../context/WebContext";

export function useWeb() {
  const contexto =
    useContext(WebContext);

  if (!contexto) {
    throw new Error(
      "useWeb debe utilizarse dentro de WebProvider."
    );
  }

  return contexto;
}