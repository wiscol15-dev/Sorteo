"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  BellRing,
  Receipt,
} from "lucide-react";
import UserActions from "./UserActions";
import DocumentModal from "./DocumentModal";
import ApprovePurchaseModal from "./ApprovePurchaseModal";

export default function UserListClient({
  users,
  officerRole,
}: {
  users: any[];
  officerRole: string;
}) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [purchaseToApprove, setPurchaseToApprove] = useState<any | null>(null);

  if (!users || users.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 relative">
      {users.map((user) => (
        <div
          key={user.id}
          className={`bg-white rounded-[2.5rem] p-6 lg:p-8 border transition-all duration-500 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 relative overflow-hidden ${
            !user.isVerified
              ? "border-red-200 shadow-[0_20px_50px_rgba(239,68,68,0.1)] bg-gradient-to-br from-white to-red-50/20"
              : user.hasPendingPurchase
                ? "border-indigo-300 shadow-[0_20px_50px_rgba(99,102,241,0.15)] bg-gradient-to-br from-white to-indigo-50/30"
                : "border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-dynamic/20"
          } ${user.isVerified && user.verifiedBy ? "pb-14 lg:pb-12" : ""}`}
        >
          {user.hasPendingPurchase && (
            <div className="absolute top-0 left-0 right-0 lg:left-auto lg:right-10 bg-indigo-500 text-white px-4 py-1.5 lg:rounded-b-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md z-10">
              <BellRing size={12} className="animate-pulse" /> Validar Pago de
              Tickets
            </div>
          )}

          <div className="flex items-center gap-6 w-full lg:w-[35%] relative z-20 pt-4 lg:pt-0">
            <button
              onClick={() => user.idCardUrl && setSelectedUser(user)}
              className={`relative w-20 h-20 lg:w-24 lg:h-24 rounded-[2rem] overflow-hidden bg-slate-900 border-4 border-white shadow-xl flex-shrink-0 group ${
                user.idCardUrl ? "cursor-pointer" : "cursor-default"
              }`}
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
                    <Search className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white font-black text-2xl italic uppercase">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </div>
              )}
            </button>

            <div className="space-y-2 overflow-hidden">
              <div className="flex items-center gap-3">
                <h3 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none truncate">
                  {user.firstName} {user.lastName}
                </h3>
                {user.isVerified ? (
                  <div className="bg-emerald-500 p-1 rounded-full shadow-md flex-shrink-0">
                    <ShieldCheck className="text-white" size={12} />
                  </div>
                ) : (
                  <div className="bg-red-500 p-1 rounded-full shadow-md animate-bounce flex-shrink-0">
                    <ShieldAlert className="text-white" size={12} />
                  </div>
                )}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest space-y-0.5 truncate">
                <p className="truncate">✉ {user.email}</p>
                <p className="truncate">📞 {user.phone}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-center gap-4 lg:gap-10 w-full lg:w-[35%] relative z-20 bg-slate-50 lg:bg-transparent p-4 lg:p-0 rounded-2xl">
            <div className="text-left lg:text-center group">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Cédula
              </p>
              <div className="flex items-center gap-2 bg-white lg:bg-slate-50 px-3 py-2 lg:px-5 lg:py-2.5 rounded-xl border border-slate-100 shadow-sm transition-colors">
                <CreditCard size={14} className="text-primary-dynamic" />
                <span className="text-xs lg:text-sm font-black text-slate-800 tracking-tighter">
                  {user.idNumber}
                </span>
              </div>
            </div>
            <div className="text-right lg:text-center border-l border-slate-200 lg:border-none pl-4 lg:pl-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Balance
              </p>
              <h4 className="text-xl lg:text-3xl font-black text-slate-900 italic tracking-tighter leading-none">
                $
                {Number(user.walletBalance).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </h4>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full lg:w-[30%] relative z-20">
            {user.hasPendingPurchase && user.pendingTransactionData && (
              <button
                onClick={() => setPurchaseToApprove(user)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-colors animate-pulse"
              >
                <Receipt size={14} /> Validar Pago
              </button>
            )}
            <div className="w-full sm:w-auto flex justify-end">
              <UserActions
                userId={user.id}
                isVerified={user.isVerified}
                officerRole={officerRole}
              />
            </div>
          </div>

          {user.isVerified && user.verifiedBy && (
            <div className="absolute bottom-0 left-0 right-0 bg-emerald-50 border-t border-emerald-100 py-2 px-6 flex items-center justify-between text-[8px] lg:text-[9px] font-black uppercase tracking-widest z-10">
              <span className="text-emerald-600 flex items-center gap-2">
                <ShieldCheck size={12} /> Verificado por:{" "}
                {user.verifiedBy.firstName} {user.verifiedBy.lastName}
              </span>
              <span className="text-emerald-500/70">
                {user.verifiedAt
                  ? new Date(user.verifiedAt).toLocaleDateString()
                  : ""}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* MODALES FLOTANTES EN LA RAÍZ */}
      {selectedUser && (
        <DocumentModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          imageUrl={selectedUser.idCardUrl}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
        />
      )}

      {purchaseToApprove && (
        <ApprovePurchaseModal
          user={purchaseToApprove}
          transaction={purchaseToApprove.pendingTransactionData}
          onClose={() => setPurchaseToApprove(null)}
        />
      )}
    </div>
  );
}
