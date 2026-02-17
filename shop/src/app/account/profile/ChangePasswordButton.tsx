"use client";

import { useState } from "react";
import ChangePasswordModal from "../ui/ChangePasswordModal";

export default function ChangePasswordButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-[30px] w-[180px] bg-black text-white flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-black/85 transition"
      >
        Сменить пароль
      </button>

      <ChangePasswordModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
