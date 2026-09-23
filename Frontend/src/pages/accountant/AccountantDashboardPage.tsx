import React, { useEffect, useState } from "react";
import {
  IndianRupee,
  CheckCircle2,
  Clock3,
  Receipt,
} from "lucide-react";
import api from "../../services/api";

interface FeeSummary {
  totalFee: number;
  discount: number;
  payable: number;
  paid: number;
  pending: number;
}

export const AccountantDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<FeeSummary>({
    totalFee: 0,
    discount: 0,
    payable: 0,
    paid: 0,
    pending: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await api.get("/student-fees/summary");
        const data = res.data?.data || res.data || {};

        setSummary({
          totalFee: Number(data.totalOriginal ?? data.totalFee ?? 0),
          discount: Number(data.totalDiscount ?? data.discount ?? 0),
          payable: Number(data.totalPayable ?? data.payable ?? 0),
          paid: Number(data.totalPaid ?? data.paid ?? 0),
          pending: Number(data.totalPending ?? data.pending ?? 0),
        });
      } catch (error) {
        console.error("Failed to load accountant dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatAmount = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  const cards = [
    {
      title: "Total Fees",
      value: summary.totalFee,
      icon: IndianRupee,
      description: "Total assigned fees",
    },
    {
      title: "Total Payable",
      value: summary.payable,
      icon: Receipt,
      description: "After discounts",
    },
    {
      title: "Total Paid",
      value: summary.paid,
      icon: CheckCircle2,
      description: "Amount collected",
    },
    {
      title: "Total Pending",
      value: summary.pending,
      icon: Clock3,
      description: "Amount remaining",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Accountant Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of school fee collection
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-100">
                      <Icon className="w-5 h-5 text-slate-700" />
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 mt-4">
                    {card.title}
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    {formatAmount(card.value)}
                  </h2>

                  <p className="text-xs text-slate-400 mt-2">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Fee Collection Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <p className="text-sm text-slate-500">Payable</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {formatAmount(summary.payable)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Collected</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">
                  {formatAmount(summary.paid)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-xl font-bold text-amber-600 mt-1">
                  {formatAmount(summary.pending)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};