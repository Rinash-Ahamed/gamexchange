"use client";

import { createContext, useContext } from "react";
import { useFormStatus } from "react-dom";

export const AdminPendingContext = createContext(false);

export function useAdminFormPending() {
  const { pending } = useFormStatus();
  return useContext(AdminPendingContext) || pending;
}
