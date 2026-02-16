"use client";

import { useState } from "react";

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-[10px]">
      <div className="text-[11px] uppercase tracking-[0.02em] text-black/45">
        {label}
      </div>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={[
          "h-[44px] w-full px-[14px] text-[14px] outline-none",
          "border border-black/10 bg-white",
          "placeholder:text-black/30",
          "focus:border-black/40 transition",
          disabled ? "text-black/50 bg-black/[0.03]" : "text-black",
        ].join(" ")}
      />
    </div>
  );
}

function SoftButton({
  children,
  onClick,
  variant = "solid",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  type?: "button" | "submit";
}) {
  const cls =
    variant === "solid"
      ? "bg-black text-white hover:bg-[#111] border border-black"
      : "bg-transparent text-black hover:bg-black hover:text-white border border-black";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${cls} h-[44px] px-[22px] text-[11px] font-bold uppercase tracking-[0.02em] transition`}
    >
      {children}
    </button>
  );
}

export default function ProfileClient({
  initial,
}: {
  initial: { name: string; email: string; phone: string };
}) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);

  const [openSecurity, setOpenSecurity] = useState(false);

  // UI для смены пароля (пока без API)
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");

  return (
    <div className="mx-auto max-w-[720px]">
      {/* Заголовок слева, свободно */}
      <div className="italic font-bold text-[16px] text-black/90">
        Личные данные
      </div>

      {/* Воздух + простая структура без таблиц */}
      <div className="mt-[34px] space-y-[28px]">
        <Field
          label="ФИО"
          value={name}
          onChange={setName}
          placeholder="Иванов Иван Иванович"
        />

        <Field
          label="Телефон"
          value={phone}
          onChange={setPhone}
          placeholder="+7 (999) 000-00-00"
        />

        <Field label="Почта" value={initial.email} disabled />

        <div className="pt-[6px] flex justify-end">
          <SoftButton
            onClick={() => {
              // тут позже будет fetch('/api/account/profile', ...)
              alert("Сохранение подключим следующим шагом ✅");
            }}
            variant="solid"
          >
            сохранить
          </SoftButton>
        </div>
      </div>

      {/* Блоки ниже — воздушно, без рамок-таблиц */}
      <div className="mt-[60px] space-y-[34px]">
        {/* Безопасность */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="italic font-bold text-[16px] text-black/90">
              Безопасность
            </div>

            <button
              type="button"
              onClick={() => setOpenSecurity((v) => !v)}
              className="text-[11px] font-bold uppercase tracking-[0.02em] text-black/60 hover:text-black transition"
            >
              {openSecurity ? "скрыть" : "сменить пароль"}
            </button>
          </div>

          <div className="mt-[10px] text-[13px] text-black/60">
            Рекомендуем обновлять пароль и не передавать его третьим лицам.
          </div>

          {/* раскрывающаяся смена пароля */}
          {openSecurity ? (
            <div className="mt-[22px] space-y-[18px]">
              <Field
                label="Текущий пароль"
                type="password"
                value={currentPass}
                onChange={setCurrentPass}
                placeholder="••••••••"
              />
              <Field
                label="Новый пароль"
                type="password"
                value={newPass}
                onChange={setNewPass}
                placeholder="••••••••"
              />
              <Field
                label="Повторите новый пароль"
                type="password"
                value={repeatPass}
                onChange={setRepeatPass}
                placeholder="••••••••"
              />

              <div className="pt-[6px] flex justify-end gap-[10px]">
                <SoftButton
                  variant="ghost"
                  onClick={() => {
                    setOpenSecurity(false);
                    setCurrentPass("");
                    setNewPass("");
                    setRepeatPass("");
                  }}
                >
                  отмена
                </SoftButton>

                <SoftButton
                  variant="solid"
                  onClick={() => {
                    if (!newPass || newPass.length < 8) {
                      alert("Пароль должен быть минимум 8 символов");
                      return;
                    }
                    if (newPass !== repeatPass) {
                      alert("Новый пароль и повтор не совпадают");
                      return;
                    }
                    alert("API смены пароля подключим следующим шагом ✅");
                  }}
                >
                  обновить пароль
                </SoftButton>
              </div>
            </div>
          ) : null}
        </div>

        {/* Поддержка / сервис — можно оставить, выглядит воздушно */}
        <div>
          <div className="italic font-bold text-[16px] text-black/90">
            Поддержка
          </div>
          <div className="mt-[10px] text-[13px] text-black/60">
            Если нужно изменить почту — напишите в поддержку.
          </div>
          <div className="mt-[18px]">
            <a
              href="#"
              className="text-[11px] font-bold uppercase tracking-[0.02em] text-black/60 hover:text-black transition"
            >
              связаться
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
