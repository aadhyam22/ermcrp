"use client";

import React from 'react';
import { useCRM } from '../../context/CRMContext';

export default function DashboardPage() {
  const { clients, employees, invoices, isLoaded } = useCRM();

  if (!isLoaded) return <div className="p-8">Loading...</div>;

  const totalWorkforce = employees.length;
  const activeClients = clients.length;

  // Convert amounts like "$1,000.00" or "1000" into numbers for stats
  const parseAmount = (amtStr) => {
    if (!amtStr) return 0;
    const num = parseFloat(amtStr.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const formatAmount = (num) => {
    return 'Rs ' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const pendingInvoices = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue');
  const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

  const kpiCards = [
    {
      label: 'Total Workforce',
      value: totalWorkforce.toString(),
    },
    {
      label: 'Active Clients',
      value: activeClients.toString(),
    },
    {
      label: 'Pending Invoices',
      value: pendingTotal > 0 ? formatAmount(pendingTotal) : 'Rs 0',
    },
  ];

  const statusStyles = {
    Paid: 'bg-green-100 text-green-700',
    Pending: 'bg-amber-100 text-amber-700',
    Overdue: 'bg-red-100 text-red-600',
  };

  const getInitials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 5);

  // Rank "Top Clients" by their existing account value field
  const topClients = [...clients]
    .sort((a, b) => parseAmount(b.value) - parseAmount(a.value))
    .slice(0, 5);

  const monthlyBars = [
    { label: 'Jan', height: '30%', color: 'bg-surface-container-highest', hover: 'hover:bg-industrial-gray', tooltip: 'Jan: $45k' },
    { label: 'Feb', height: '45%', color: 'bg-surface-container-highest', hover: 'hover:bg-industrial-gray', tooltip: 'Feb: $68k' },
    { label: 'Mar', height: '40%', color: 'bg-surface-container-highest', hover: 'hover:bg-industrial-gray', tooltip: 'Mar: $60k' },
    { label: 'Apr', height: '60%', color: 'bg-tech-blue/40', hover: 'hover:bg-tech-blue/60', tooltip: 'Apr: $90k' },
    { label: 'May', height: '75%', color: 'bg-tech-blue/60', hover: 'hover:bg-tech-blue/80', tooltip: 'May: $112k' },
    { label: 'Jun', height: '90%', color: 'bg-tech-blue', hover: '', tooltip: 'Jun: $135k', isActive: true },
  ];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 pb-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline font-bold text-void-navy text-[28px] md:text-[48px] leading-tight tracking-tight">
            Enterprise Dashboard
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bms-card p-4 rounded-lg flex flex-col relative overflow-hidden cursor-default"
            style={card.accentColor ? { borderTopColor: card.accentColor } : {}}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-[64px]">{card.icon}</span>
            </div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="font-label text-[11px] text-industrial-gray uppercase tracking-wider">{card.label}</span>
              <span className={`material-symbols-outlined ${card.accentColor ? 'text-error' : 'text-tech-blue'}`}>{card.icon}</span>
            </div>
            <div className="mt-auto relative z-10">
              <div className={`font-headline font-semibold text-[32px] leading-tight ${card.accentColor ? 'text-error' : 'text-void-navy'}`}>
                {card.value}
              </div>
              <div className={`flex items-center gap-1 ${card.trendColor} mt-1`}>
                <span className="material-symbols-outlined text-[14px]">{card.trendIcon}</span>
                <span className="font-label text-[11px]">{card.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">



      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bms-card rounded-lg flex flex-col p-5">
          <h3 className="font-headline font-semibold text-[20px] text-void-navy">Invoices Overview</h3>
          <p className="font-label text-[13px] text-industrial-gray mb-4">Billing activity</p>
          <div className="flex flex-col gap-3">
            {recentInvoices.map((inv, idx) => (
              <div
                key={inv.id || idx}
                className="flex items-center justify-between border border-outline-variant/20 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-headline font-semibold text-[14px] text-void-navy leading-tight">
                      {inv.clientName}
                    </div>
                    <div className="font-label text-[11px] text-industrial-gray">
                      {inv.invoiceNumber}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-headline font-semibold text-[14px] text-void-navy">
                    {inv.amount}
                  </span>
                  <span
                    className={`font-label text-[11px] px-2 py-1 rounded-full ${statusStyles[inv.status] || 'bg-surface-container-highest text-industrial-gray'}`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bms-card rounded-lg flex flex-col p-5">
          <h3 className="font-headline font-semibold text-[20px] text-void-navy">Top Clients</h3>
          <p className="font-label text-[13px] text-industrial-gray mb-4">By account value</p>
          <div className="flex flex-col gap-3">
            {topClients.map((client, idx) => (
              <div
                key={client.id || idx}
                className="flex items-center justify-between border border-outline-variant/20 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-label text-[13px] text-industrial-gray w-4 text-center">{idx + 1}</span>
                  <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className="font-label text-[12px] font-semibold text-void-navy">
                      {getInitials(client.name)}
                    </span>
                  </div>
                  <div>
                    <div className="font-headline font-semibold text-[14px] text-void-navy leading-tight">
                      {client.name}
                    </div>
                    <div className="font-label text-[11px] text-industrial-gray">
                      {client.location || client.city}
                    </div>
                  </div>
                </div>
                <span className="font-headline font-semibold text-[14px] text-void-navy">
                  {formatAmount(parseAmount(client.value))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}