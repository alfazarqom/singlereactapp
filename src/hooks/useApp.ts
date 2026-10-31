import { useContext } from "react";
import { AppContext } from "../app/context/AppContext";

export const useApp = () => useContext(AppContext);
