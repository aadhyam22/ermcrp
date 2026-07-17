"use client";

import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import Modal from '../../components/Modal';

export default function ClientsPage() {
  const { clients, products, addClient, updateClient, deleteClient, isLoaded } = useCRM();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    status: 'Active',
    value: '',
    productsList: [], // [{ productId, name, price, qty }]
  });

  if (!isLoaded) return <div className="p-8">Loading...</div>;

  // Convert amounts like "Rs 1,250.00" or "1000" into numbers
  const parseAmount = (amtStr) => {
    if (!amtStr) return 0;
    const num = parseFloat(String(amtStr).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingId(client.id);
      setFormData({
        name: client.name || '',
        project: client.project || '',
        status: client.status || 'Active',
        value: client.value || '',
        productsList: client.productsList || [],
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', project: '', status: 'Active', value: '', productsList: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle a product on/off in the client's product list
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
      project: hasProducts
        ? formData.productsList.map((p) => `${p.name} (x${p.qty})`).join(', ')
        : formData.project,
      value: hasProducts ? productsTotal.toLocaleString('en-US') : formData.value,
    };
    if (editingId) {
      updateClient(editingId, payload);
    } else {
      addClient(payload);
    }
    handleCloseModal();
  };

  const handleViewClient = (client) => {
    setViewingClient(client);
    setIsViewModalOpen(true);
  };

  // Derive KPIs from dynamic data
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const totalRevenue = clients
    .filter(client => client.status === "Active")
    .reduce((sum, client) => {
      const value = Number(
        String(client.value || 0).replace(/,/g, "")
      );
      return sum + value;
    }, 0);

  const totalValue = `Rs. ${totalRevenue.toLocaleString()}`;


  const kpiCards = [
    { label: 'Total Portfolio', value: totalClients.toString(), trendIcon: null, trendColor: 'text-industrial-gray' },
    { label: 'Total Active Clients', value: activeClients.toString(), trendIcon: null, trendColor: 'text-industrial-gray' },
    { label: 'Total Contract Value', value: totalValue, trendIcon: null, trendColor: 'text-industrial-gray' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return { color: 'bg-secondary-container/30 text-secondary border-secondary-container', dot: 'bg-energetic-green' };
      case 'Completed': return { color: 'bg-error-container/30 text-error border-error-container', dot: 'bg-error animate-pulse' };
      default: return { color: 'bg-surface-variant/50 text-industrial-gray border-outline-variant/30', dot: 'bg-industrial-gray' };
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 pb-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline font-bold text-[32px] text-void-navy">Client Management</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-energetic-green text-white rounded-lg hover:bg-energetic-green/90 transition-colors text-[14px] font-semibold shadow-sm">
            Add New Client
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div key={card.label} className="bms-card p-4 rounded-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="font-label text-[11px] text-industrial-gray uppercase tracking-wider">{card.label}</span>
              <span className="material-symbols-outlined text-tech-blue/50 group-hover:text-tech-blue transition-colors">{card.icon}</span>
            </div>
            <div className="font-headline font-bold text-[44px] leading-none text-void-navy">{card.value}</div>
            <div className={`flex items-center gap-1 mt-2 font-label text-[11px] Rs {card.trendColor}`}>
              {card.pulse && <div className="w-2 h-2 rounded-full bg-energetic-green animate-pulse mr-1" />}
              {card.trendIcon && <span className="material-symbols-outlined text-[14px]">{card.trendIcon}</span>}
              <span>{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Client Portfolio Table */}
        <div className="lg:col-span-12  bms-card rounded-lg flex flex-col">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
            <h3 className="font-headline font-semibold text-[20px] text-void-navy">Client Portfolio</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-void-navy">
                  <th className="p-3 font-label text-[11px] text-white font-medium uppercase tracking-wider">Client </th>
                  <th className="p-3 font-label text-[11px] text-white font-medium uppercase tracking-wider">Status</th>
                  <th className="p-3 font-label text-[11px] text-white font-medium uppercase tracking-wider">Contract Value</th>
                  <th className="p-3 font-label text-[11px] text-white font-medium uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-industrial-gray">
                      No clients found. Click "Add New Client" to add one.
                    </td>
                  </tr>
                ) : clients.map((client) => {
                  const style = getStatusStyle(client.status);
                  return (
                    <tr key={client.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleViewClient(client)}
                          className="font-semibold text-void-navy text-[14px] hover:text-tech-blue hover:underline transition-colors text-left"
                        >
                          {client.name}
                        </button>
                        <div className="text-industrial-gray font-label text-[11px]">{client.project}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label text-[11px] border ${style.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {client.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[14px]">{client.value || '-'}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleOpenModal(client)} className="text-industrial-gray hover:text-tech-blue transition-colors p-1">
                          <span className="text-[15px]">edit</span>
                        </button>
                        <button onClick={() => deleteClient(client.id)} className="text-industrial-gray hover:text-error transition-colors p-1 ml-1">
                          <span className="text-[15px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Edit Client" : "New Client Intake"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">Client Name</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" />
          </div>
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]">
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
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
          </div>

          {/* Products Ordered - auto-filled when products are selected, editable otherwise */}
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">Products Ordered</label>
            {hasProducts ? (
              <div className="w-full border border-outline-variant/50 rounded p-2 text-[14px] bg-surface-container-low text-on-surface-variant">
                {formData.productsList.map((p) => `${p.name} (x${p.qty})`).join(', ')}
              </div>
            ) : (
              <input name="project" value={formData.project} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" placeholder="Manual description (optional if selecting products above)" />
            )}
          </div>

          {/* Contract Value - auto-calculated when products are selected, editable otherwise */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-label text-[12px] text-industrial-gray mb-1">Contract Value</label>
              {hasProducts ? (
                <input
                  readOnly
                  value={`Rs. ${productsTotal.toLocaleString('en-US')}`}
                  className="w-full border border-outline-variant/50 rounded p-2 text-[14px] bg-surface-container-low text-void-navy font-semibold cursor-not-allowed"
                />
              ) : (
                <input name="value" value={formData.value} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" placeholder='eg: 99,999' />
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-outline-variant rounded text-[14px] hover:bg-surface-container">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-tech-blue text-white rounded text-[14px] hover:bg-tech-blue/90">{editingId ? "Save Changes" : "Create Client"}</button>
          </div>
        </form>
      </Modal>

      {/* View Client Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Client Details">
        {viewingClient && (
          <div className="space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-outline-variant/20">
              <div>
                <div className="font-headline font-bold text-[20px] text-void-navy">{viewingClient.name}</div>
                <div className="text-[12px] text-industrial-gray mt-1">{viewingClient.project || 'No description provided'}</div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label text-[11px] border ${getStatusStyle(viewingClient.status).color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(viewingClient.status).dot}`} />
                {viewingClient.status}
              </span>
            </div>

            {viewingClient.productsList && viewingClient.productsList.length > 0 && (
              <div>
                <div className="font-label text-[11px] text-industrial-gray uppercase tracking-wider mb-2">Products Ordered</div>
                <div className="border border-outline-variant/30 rounded-lg overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="text-left p-2 font-label text-[11px] text-industrial-gray uppercase">Product</th>
                        <th className="text-center p-2 font-label text-[11px] text-industrial-gray uppercase">Qty</th>
                        <th className="text-right p-2 font-label text-[11px] text-industrial-gray uppercase">Unit Price</th>
                        <th className="text-right p-2 font-label text-[11px] text-industrial-gray uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {viewingClient.productsList.map((p) => (
                        <tr key={p.productId}>
                          <td className="p-2 text-void-navy font-medium">{p.name}</td>
                          <td className="p-2 text-center">{p.qty}</td>
                          <td className="p-2 text-right">Rs. {p.price.toLocaleString('en-US')}</td>
                          <td className="p-2 text-right font-medium">Rs. {(p.price * p.qty).toLocaleString('en-US')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
              <span className="font-label text-[12px] text-industrial-gray uppercase tracking-wider">Total Contract Value</span>
              <span className="font-headline font-bold text-[22px] text-void-navy">{viewingClient.value ? `Rs. ${viewingClient.value}` : '-'}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 border border-outline-variant rounded text-[14px] hover:bg-surface-container">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}