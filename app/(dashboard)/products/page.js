"use client";

import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import Modal from '../../components/Modal';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, isLoaded } = useCRM();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    qty: '',
    status: 'In Stock'
  });

  if (!isLoaded) return <div className="p-8">Loading...</div>;

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData({ id: '', name: '', price: '', qty: '', status: 'In Stock' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateProduct(editingId, formData);
    else addProduct(formData);
    handleCloseModal();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'In Stock': return { color: 'bg-energetic-green/10 text-on-secondary-container', dot: 'w-1.5 h-1.5 rounded-full bg-energetic-green animate-pulse', icon: null };
      case 'Low Stock': return { color: 'bg-error-container text-on-error-container border border-error/20', dot: null };
      case 'Out of Stock': return { color: 'bg-surface-container-highest text-on-surface-variant', dot: null };
      default: return { color: 'bg-surface-container-highest text-on-surface-variant', dot: null };
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline font-bold text-[28px] md:text-[32px] text-on-surface">Product Management</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button onClick={() => handleOpenModal()} className="bg-energetic-green hover:bg-energetic-green/90 text-white font-semibold text-[14px] py-2 px-6 rounded-lg whitespace-nowrap flex items-center justify-center gap-2 transition-colors shadow-sm w-full sm:w-auto">
            Add New Product
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden border-t-4 border-t-tech-blue shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-void-navy text-white">
              <tr>
                {['Product ID', 'Product Name', 'Price (in rupees)', 'Quantity Remaining', 'Status', 'Actions'].map((h) => (
                  <th key={h} className={`font-label text-[11px] uppercase py-4 px-6 border-b border-void-navy/10 whitespace-nowrap ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[14px] text-on-surface divide-y divide-outline-variant/20">
              {products.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-industrial-gray">No products found. Click "Add New Product" to add one.</td></tr>
              ) : products.map((prod) => {
                const style = getStatusStyle(prod.status);
                const outOfStock = prod.status === 'Out of Stock';
                const lowStock = prod.status === 'Low Stock';
                return (
                  <tr key={prod.id} className="hover:bg-surface-container-low transition-colors group cursor-default">
                    <td className="py-4 px-6 font-label text-[11px] text-industrial-gray">{prod.id || '-'}</td>
                    <td className={`py-4 px-6 font-semibold ${outOfStock ? 'text-industrial-gray' : ''}`}>{prod.name}</td>
                    <td className={`py-4 px-6 ${outOfStock ? 'text-industrial-gray' : ''}`}>{prod.price}</td>
                    <td className={`py-4 px-6 ${outOfStock ? 'text-industrial-gray' : lowStock ? 'text-error font-semibold' : ''}`}>{prod.qty}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 font-label text-[11px] px-2.5 py-1 rounded-full ${style.color}`}>
                        {style.icon ? <span className="material-symbols-outlined text-[14px]">{style.icon}</span> : (style.dot && <span className={style.dot} />)}
                        {prod.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleOpenModal(prod)} className="text-industrial-gray hover:text-tech-blue transition-colors p-1">
                        <span className="text-[15px]">edit</span>
                      </button>
                      <button onClick={() => deleteProduct(prod.id)} className="text-industrial-gray hover:text-error transition-colors p-1 ml-1">
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">Product ID / SKU</label>
            <input required name="id" value={formData.id} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" />
          </div>
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">Product Name</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-label text-[12px] text-industrial-gray mb-1">Price</label>
              <input required name="price" value={formData.price} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" placeholder="e.g. Rs 1,250.00" />
            </div>
            <div className="flex-1">
              <label className="block font-label text-[12px] text-industrial-gray mb-1">Quantity</label>
              <input type="number" required name="qty" value={formData.qty} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" />
            </div>
          </div>
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]">
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-outline-variant rounded text-[14px] hover:bg-surface-container">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-tech-blue text-white rounded text-[14px] hover:bg-tech-blue/90">{editingId ? "Save Changes" : "Save Product"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
