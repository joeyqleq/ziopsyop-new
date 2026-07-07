"use client";
import { createContext, useContext } from "react";

// true = already booted (default so non-home pages don't gate)
export const BootContext = createContext(true);
export const useBooted = () => useContext(BootContext);
