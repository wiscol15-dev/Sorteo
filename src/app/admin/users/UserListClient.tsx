"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ShieldCheck, ShieldAlert, CreditCard } from "lucide-react";
import UserActions from "./UserActions";
import DocumentModal from "./DocumentModal";

export default function UserListClient({
  users,
  officerRole,
}: {
  users: any[];
  officerRole: string;
}) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  if (!users) return null;

  return (
    <div className="grid grid-cols-1 gap-8">
      {users.map((user) => (
        <div
          key={user.id}
          className={`bg-white rounded-[3rem] p-8 border transition-all duration-500 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden ${
            !user.isVerified
              ? "border-red-200 shadow-[0_20px_50px_rgba(239,68,68,0.1)] bg-gradient-to-br from-white to-red-50/20"
              : "border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary-dynamic/20 pb-14 lg:pb-8"
          }`}
        >
          {/* FOTO E IDENTIDAD */}
          <div className="flex items-center gap-8 w-full lg:w-1/3">
            <button
              onClick={() => user.idCardUrl && setSelectedUser(user)}
              className={`relative w-28 h-28 rounded-[2.5rem] overflow-hidden bg-slate-900 border-4 border-white shadow-xl flex-shrink-0 group ${user.idCardUrl ? "cursor-pointer" : "cursor-default"}`}
            >
              {user.idCardUrl ? (
                <>
                  <Image
                    src={user.idCardUrl}
                    alt="KYC"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-125"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Search className="text-white" size={28} />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white font-black text-3xl italic uppercase">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </div>
              )}
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                  {user.firstName} {user.lastName}
                </h3>
                {user.isVerified ? (
                  <div className="bg-emerald-500 p-1.5 rounded-full shadow-lg">
                    <ShieldCheck className="text-white" size={14} />
                  </div>
                ) : (
                  <div className="bg-red-500 p-1.5 rounded-full shadow-lg animate-bounce">
                    <ShieldAlert className="text-white" size={14} />
                  </div>
                )}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest space-y-1">
                <p>✉ {user.email}</p>
                <p>📞 {user.phone}</p>
              </div>
            </div>
          </div>

          {/* DATOS OPERATIVOS */}
          <div className="flex flex-wrap items-center justify-center gap-14 w-full lg:w-1/3">
            <div className="text-center group">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3">
                Cédula ID
              </p>
              <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                <CreditCard size={14} className="text-primary-dynamic" />
                <span className="text-sm font-black text-slate-800 tracking-tighter">
                  {user.idNumber}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3">
                Balance
              </p>
              <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none">
                $
                {Number(user.walletBalance).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </h4>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="flex items-center justify-end gap-4 w-full lg:w-1/3">
            <UserActions
              userId={user.id}
              isVerified={user.isVerified}
              officerRole={officerRole}
            />
          </div>

          {/* AUDIT TRAIL */}
          {user.isVerified && user.verifiedBy && (
            <div className="absolute bottom-0 left-0 right-0 bg-emerald-50 border-t border-emerald-100 py-2.5 px-8 flex flex-col sm:flex-row sm:justify-between items-center text-[9px] font-black uppercase tracking-widest">
              <span className="text-emerald-600 flex items-center gap-2">
                <ShieldCheck size={12} /> Verificado por:{" "}
                {user.verifiedBy.firstName} {user.verifiedBy.lastName}
              </span>
              <span className="text-emerald-500/70">
                {new Date(user.verifiedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      ))}

      {selectedUser && (
        <DocumentModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          imageUrl={selectedUser.idCardUrl}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
        />
      )}
    </div>
  );
}
