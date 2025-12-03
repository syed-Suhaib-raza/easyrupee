"use client";

import { useEffect, useState } from "react";

export default function BillsPage() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/bills");
      const data = await res.json();
      setBills(data);
    }
    load();
  }, []);

  return (
    <section>
      <h1 className="text-2xl font-bold">Bills</h1>
      <p className="mt-2 text-gray-500">Pay and manage bills</p>

      <div className="mt-6 space-y-3">
        {bills.length === 0 && (
          <div className="text-gray-400">No bills found.</div>
        )}

        {bills.map((bill: any) => (
          <div
            key={bill.bill_id}
            className="border p-3 rounded-md flex justify-between"
          >
            <div>
              <p className="font-semibold">
                {bill.merchant_name || "Unknown Merchant"}
              </p>
              <p className="text-gray-500 text-sm">
                Due: {bill.due_date?.slice(0, 10)}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold">Rs {bill.amount}</p>
              <p
                className={
                  bill.status_id === 1
                    ? "text-green-600"
                    : bill.status_id === 2
                    ? "text-red-600"
                    : "text-orange-500"
                }
              >
                {bill.status_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}