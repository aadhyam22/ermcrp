"use client";

import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import Modal from '../../components/Modal';

export default function BillingPage() {
  const { invoices, products, clients, addInvoice, updateInvoice, deleteInvoice, isLoaded } = useCRM();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    client: '',
    project: '',
    issue: '',
    due: '',
    amount: '',
    status: 'Pending',
    productsList: [], // [{ productId, name, price, qty }]
  });

  if (!isLoaded) return <div className="p-8">Loading...</div>;

  // Generate the next sequential invoice number, e.g. INV-0001, INV-0002...
  const generateInvoiceNumber = () => {
    const prefix = 'INV-';
    const numbers = invoices
      .map((inv) => inv.invoiceNumber)
      .filter(Boolean)
      .map((num) => {
        const match = String(num).match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  };

  const handleOpenModal = (invoice = null) => {
    if (invoice) {
      setEditingId(invoice.id);
      setFormData({ ...invoice, productsList: invoice.productsList || [] });
    } else {
      setEditingId(null);
      setFormData({
        invoiceNumber: generateInvoiceNumber(),
        client: '',
        project: '',
        issue: '',
        due: '',
        amount: '',
        status: 'Pending',
        productsList: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Convert amounts like "$1,000.00" or "1000" into numbers for stats
  const parseAmount = (amtStr) => {
    if (!amtStr) return 0;
    const num = parseFloat(String(amtStr).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const formatAmount = (num) => {
    return 'Rs ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Auto-fill Order Description and product selection when a client is chosen
  const handleClientSelect = (e) => {
    const selectedName = e.target.value;
    const matchedClient = clients.find((c) => c.name === selectedName);
    if (matchedClient) {
      setFormData((prev) => ({
        ...prev,
        client: selectedName,
        project: matchedClient.project || '',
        productsList: (matchedClient.productsList || []).map((p) => ({ ...p })),
      }));
    } else {
      setFormData((prev) => ({ ...prev, client: selectedName }));
    }
  };

  // Toggle a product on/off in the invoice's product list
  const handleProductToggle = (prod, checked) => {
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          productsList: [
            ...prev.productsList,
            { productId: prod.id, name: prod.name, price: parseAmount(prod.price), qty: 1 },
          ],
        };
      }
      return { ...prev, productsList: prev.productsList.filter((p) => p.productId !== prod.id) };
    });
  };

  const handleProductQtyChange = (productId, qty) => {
    const parsedQty = Math.max(1, parseInt(qty) || 1);
    setFormData((prev) => ({
      ...prev,
      productsList: prev.productsList.map((p) =>
        p.productId === productId ? { ...p, qty: parsedQty } : p
      ),
    }));
  };

  const productsTotal = formData.productsList.reduce((sum, p) => sum + p.price * p.qty, 0);
  const hasProducts = formData.productsList.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: hasProducts ? formatAmount(productsTotal) : formData.amount,
    };
    if (editingId) updateInvoice(editingId, payload);
    else addInvoice(payload);
    handleCloseModal();
  };

  const handleViewInvoice = (inv) => {
    setViewingInvoice(inv);
    setIsViewInvoiceOpen(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const pendingInvoices = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue');
  const paidInvoices = invoices.filter(i => i.status === 'Paid');

  const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  const paidTotal = paidInvoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
      (inv.client && inv.client.toLowerCase().includes(q))
    );
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return { color: 'bg-secondary-container/20 text-on-secondary-container', dot: 'bg-energetic-green' };
      case 'Overdue': return { color: 'bg-error-container/50 text-error', dot: 'bg-error animate-pulse' };
      case 'Pending':
      default: return { color: 'bg-surface-variant text-on-surface-variant', dot: 'bg-industrial-gray' };
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline font-bold text-[32px] text-void-navy">Billing &amp; Invoicing</h2>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-energetic-green text-white px-4 py-2 rounded-lg font-semibold text-[14px] hover:bg-energetic-green/90 transition-colors shadow-sm">
            Generate New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bms-card p-4 flex flex-col justify-between min-h-[160px] rounded-lg">
          <div className="flex justify-between items-start">
            <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">Pending Invoices</span>
          </div>
          <div>
            <div className="font-headline font-bold text-[44px] leading-none text-void-navy mb-1">{formatAmount(pendingTotal)}</div>
          </div>
        </div>
      </div>

      <div className="bms-card rounded-lg w-full overflow-x-auto">
        <div className="p-4 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-container-low">
          <h3 className="font-headline font-semibold text-[20px] text-void-navy">Recent Transactions</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice # or client"
            className="w-full sm:w-64 h-9 px-3 bg-white border border-outline-variant/40 rounded-lg text-[13px] text-on-surface focus:outline-none focus:border-tech-blue focus:ring-2 focus:ring-tech-blue/10 transition-all placeholder:text-outline"
          />
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-void-navy text-white">
              {['Invoice #', 'Client / Project', 'Issue Date', 'Due Date', 'Amount', 'Status', 'Actions'].map((h) => (
                <th key={h} className={`py-3 px-4 font-label text-[11px] uppercase tracking-wider font-medium ${h === 'Amount' ? 'text-right' : h === 'Status' ? 'text-center' : h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[14px] text-on-surface">
            {invoices.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-industrial-gray">No invoices found.</td></tr>
            ) : filteredInvoices.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-industrial-gray">No invoices match your search.</td></tr>
            ) : filteredInvoices.map((inv) => {
              const style = getStatusStyle(inv.status);
              return (
                <tr key={inv.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleViewInvoice(inv)}
                      className="font-mono text-[13px] text-tech-blue font-semibold hover:underline underline-offset-2"
                    >
                      {inv.invoiceNumber || '-'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-void-navy">{inv.client}</div>
                    <div className="text-[12px] text-on-surface-variant">{inv.project}</div>
                  </td>
                  <td className="py-3 px-4">{inv.issue || '-'}</td>
                  <td className={`py-3 px-4 ${inv.status === 'Overdue' ? 'text-error font-medium' : ''}`}>{inv.due || '-'}</td>
                  <td className="py-3 px-4 text-right font-medium">{inv.amount || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-label text-[11px] ${style.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleOpenModal(inv)} className="text-industrial-gray hover:text-tech-blue p-1">
                      <span className="text-[15px]">edit</span>
                    </button>
                    <button onClick={() => deleteInvoice(inv.id)} className="text-industrial-gray hover:text-error p-1 ml-1">
                      <span className="text-[15px]">delete</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Edit Invoice" : "Generate New Invoice"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">Invoice Number</label>
            <input
              readOnly
              value={formData.invoiceNumber}
              className="w-full border border-outline-variant/50 rounded p-2 text-[14px] bg-surface-container-low text-void-navy font-semibold cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">Client Name</label>
            <select
              required
              name="client"
              value={formData.client}
              onChange={handleClientSelect}
              className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px] bg-white"
            >
              <option value="" disabled>Select a client</option>
              {(!clients || clients.length === 0) && (
                <option value="" disabled>No clients found. Add one in the Client module first.</option>
              )}
              {clients && clients.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              {formData.client && clients && !clients.some((c) => c.name === formData.client) && (
                <option value={formData.client}>{formData.client} (custom)</option>
              )}
            </select>
          </div>
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">Order Description</label>
            <input name="project" value={formData.project} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" placeholder="Auto-filled when you select a client" />
          </div>

          {/* Product Selection */}
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">Select Products</label>
            <div className="border border-outline-variant/50 rounded-lg divide-y divide-outline-variant/20 max-h-56 overflow-y-auto">
              {(!products || products.length === 0) ? (
                <div className="p-3 text-[13px] text-industrial-gray">No products available. Add products in the Product module first.</div>
              ) : products.map((prod) => {
                const selected = formData.productsList.find((p) => p.productId === prod.id);
                return (
                  <div key={prod.id} className="flex items-center justify-between gap-3 p-2.5">
                    <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={(e) => handleProductToggle(prod, e.target.checked)}
                        className="w-4 h-4 accent-tech-blue rounded"
                      />
                      <div>
                        <div className="text-[14px] font-medium text-void-navy">{prod.name}</div>
                        <div className="text-[12px] text-industrial-gray">{prod.price}</div>
                      </div>
                    </label>
                    {selected && (
                      <input
                        type="number"
                        min="1"
                        value={selected.qty}
                        onChange={(e) => handleProductQtyChange(prod.id, e.target.value)}
                        className="w-16 border border-outline-variant/50 rounded p-1.5 text-[13px] text-center focus:ring-1 focus:ring-tech-blue outline-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {hasProducts && (
              <div className="mt-2 text-right text-[13px] text-industrial-gray">
                Products subtotal: <span className="font-semibold text-void-navy">{formatAmount(productsTotal)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-label text-[12px] text-industrial-gray mb-1">Issue Date</label>
              <input type="date" name="issue" value={formData.issue} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" />
            </div>
            <div className="flex-1">
              <label className="block font-label text-[12px] text-industrial-gray mb-1">Due Date</label>
              <input type="date" name="due" value={formData.due} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-label text-[12px] text-industrial-gray mb-1">Amount</label>
              {hasProducts ? (
                <input
                  readOnly
                  value={formatAmount(productsTotal)}
                  className="w-full border border-outline-variant/50 rounded p-2 text-[14px] bg-surface-container-low text-void-navy font-semibold cursor-not-allowed"
                />
              ) : (
                <input required name="amount" value={formData.amount} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" placeholder="e.g. 5000" />
              )}
            </div>
            <div className="flex-1">
              <label className="block font-label text-[12px] text-industrial-gray mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-outline-variant rounded text-[14px] hover:bg-surface-container">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-tech-blue text-white rounded text-[14px] hover:bg-tech-blue/90">{editingId ? "Save Changes" : "Save Invoice"}</button>
          </div>
        </form>
      </Modal>

      {/* View Invoice as Bill Modal */}
      <Modal isOpen={isViewInvoiceOpen} onClose={() => setIsViewInvoiceOpen(false)} title="Invoice Details">
        {viewingInvoice && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b-2 border-void-navy">
              <div>
                <div className="font-headline font-bold text-[24px] text-void-navy">INVOICE</div>
                <div className="font-mono text-[14px] text-tech-blue font-semibold mt-1">{viewingInvoice.invoiceNumber || '-'}</div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-[11px] ${getStatusStyle(viewingInvoice.status).color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(viewingInvoice.status).dot}`} />
                {viewingInvoice.status}
              </span>
            </div>

            {/* Bill To / Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-label text-[11px] text-industrial-gray uppercase tracking-wider mb-1">Billed To</div>
                <div className="font-semibold text-void-navy text-[15px]">{viewingInvoice.client || '-'}</div>
                {viewingInvoice.project && (
                  <div className="text-[13px] text-on-surface-variant mt-0.5">{viewingInvoice.project}</div>
                )}
              </div>
              <div className="text-right">
                <div className="font-label text-[11px] text-industrial-gray uppercase tracking-wider mb-1">Issue Date</div>
                <div className="text-[14px] text-void-navy mb-2">{viewingInvoice.issue || '-'}</div>
                <div className="font-label text-[11px] text-industrial-gray uppercase tracking-wider mb-1">Due Date</div>
                <div className={`text-[14px] ${viewingInvoice.status === 'Overdue' ? 'text-error font-semibold' : 'text-void-navy'}`}>{viewingInvoice.due || '-'}</div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="font-label text-[11px] text-industrial-gray uppercase tracking-wider mb-2">Items</div>
              <div className="border border-outline-variant/30 rounded-lg overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead className="bg-void-navy text-white">
                    <tr>
                      <th className="text-left p-2.5 font-label text-[11px] uppercase">Description</th>
                      <th className="text-center p-2.5 font-label text-[11px] uppercase">Qty</th>
                      <th className="text-right p-2.5 font-label text-[11px] uppercase">Unit Price</th>
                      <th className="text-right p-2.5 font-label text-[11px] uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {viewingInvoice.productsList && viewingInvoice.productsList.length > 0 ? (
                      viewingInvoice.productsList.map((p) => (
                        <tr key={p.productId}>
                          <td className="p-2.5 text-void-navy font-medium">{p.name}</td>
                          <td className="p-2.5 text-center">{p.qty}</td>
                          <td className="p-2.5 text-right">{formatAmount(p.price)}</td>
                          <td className="p-2.5 text-right font-medium">{formatAmount(p.price * p.qty)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-2.5 text-void-navy font-medium">{viewingInvoice.project || 'Service / Product'}</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right">{viewingInvoice.amount || '-'}</td>
                        <td className="p-2.5 text-right font-medium">{viewingInvoice.amount || '-'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end pt-2 border-t border-outline-variant/20">
              <div className="w-full sm:w-64 flex justify-between items-center py-2">
                <span className="font-label text-[12px] text-industrial-gray uppercase tracking-wider">Total Due</span>
                <span className="font-headline font-bold text-[24px] text-void-navy">{viewingInvoice.amount || '-'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={handlePrintInvoice} className="px-4 py-2 border border-outline-variant rounded text-[14px] hover:bg-surface-container flex items-center gap-1.5">
                Print
              </button>
              <button type="button" onClick={() => setIsViewInvoiceOpen(false)} className="px-4 py-2 bg-tech-blue text-white rounded text-[14px] hover:bg-tech-blue/90">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}