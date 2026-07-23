"use client";

import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import Modal from '../../components/Modal';
import { uploadBOQFile, getBOQFileLink } from '@/utils/boqStorageClient';

// Keep this in sync with utils/boqParser.js if you're also using the
// full-sheet BOQ upload tool — both should apply the same GST rate.
const GST_RATE = 0.18;

function formatINR(value) {
  const num = Number(value) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProductsPage() {
  // Aliased to read as BOQ operations below. These still call the same
  // CRMContext functions as before (addProduct/deleteProduct), so nothing
  // needs to change in CRMContext.js for this to work.
  const { products: boqs, addProduct: addBOQ, deleteProduct: deleteBOQ, isLoaded } = useCRM();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    priceExclGst: '',
  });

  if (!isLoaded) return <div className="p-8">Loading...</div>;

  const priceInclPreview = +(((parseFloat(formData.priceExclGst) || 0)) * (1 + GST_RATE)).toFixed(2);

  const handleOpenModal = () => {
    setFormData({ id: '', name: '', priceExclGst: '' });
    setSelectedFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      let boqFilePath = null;
      let boqFileName = null;

      if (selectedFile) {
        const uploadResult = await uploadBOQFile(selectedFile);
        boqFilePath = uploadResult.path;
        boqFileName = selectedFile.name;
      }

      const priceExclGst = parseFloat(formData.priceExclGst) || 0;
      const priceInclGst = +(priceExclGst * (1 + GST_RATE)).toFixed(2);

      await addBOQ({
        id: formData.id,
        name: formData.name,
        priceExclGst,
        priceInclGst,
        boqFilePath,
        boqFileName,
      });

      handleCloseModal();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to save this BOQ. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open a blank tab synchronously (so it isn't blocked as a popup), then
  // point it at the signed URL once it's ready.
  const handleViewFile = async (path) => {
    setPageError('');
    const previewWindow = window.open('', '_blank');
    try {
      const url = await getBOQFileLink(path);
      if (previewWindow) previewWindow.location.href = url;
    } catch (err) {
      console.error(err);
      if (previewWindow) previewWindow.close();
      setPageError(err.message || 'Could not open the BOQ file.');
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline font-bold text-[28px] md:text-[32px] text-on-surface">BOQ Management</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button onClick={handleOpenModal} className="bg-energetic-green hover:bg-energetic-green/90 text-white font-semibold text-[14px] py-2 px-6 rounded-lg whitespace-nowrap flex items-center justify-center gap-2 transition-colors shadow-sm w-full sm:w-auto">
            Add New BOQ
          </button>
        </div>
      </div>

      {pageError && (
        <div className="text-[13px] text-error bg-error-container border border-error/20 rounded-md px-3 py-2">
          {pageError}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden border-t-4 border-t-tech-blue shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-void-navy text-white">
              <tr>
                {['BOQ ID', 'BOQ Name', 'Price (excl. GST)', 'Price (incl. GST)', 'Actions'].map((h) => (
                  <th key={h} className={`font-label text-[11px] uppercase py-4 px-6 border-b border-void-navy/10 whitespace-nowrap ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[14px] text-on-surface divide-y divide-outline-variant/20">
              {boqs.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-industrial-gray">No BOQs found. Click "Add New BOQ" to add one.</td></tr>
              ) : boqs.map((boq) => {
                const priceIncl = boq.priceInclGst ?? +(((parseFloat(boq.priceExclGst) || 0)) * (1 + GST_RATE)).toFixed(2);
                return (
                  <tr key={boq.id} className="hover:bg-surface-container-low transition-colors group cursor-default">
                    <td className="py-4 px-6 font-label text-[11px] text-industrial-gray">{boq.id || '-'}</td>
                    <td className="py-4 px-6 font-semibold">{boq.name}</td>
                    <td className="py-4 px-6">{formatINR(boq.priceExclGst)}</td>
                    <td className="py-4 px-6">{formatINR(priceIncl)}</td>
                    <td className="py-4 px-6 text-right">
                      {boq.boqFilePath ? (
                        <button onClick={() => handleViewFile(boq.boqFilePath)} title="View BOQ file" className="text-industrial-gray hover:text-tech-blue transition-colors p-1">
                          <span className="text-[15px]">view file</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-industrial-gray/60 mr-1">No file</span>
                      )}
                      <button onClick={() => deleteBOQ(boq.id)} title="Delete BOQ" className="text-industrial-gray hover:text-error transition-colors p-1 ml-1">
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New BOQ">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">BOQ ID</label>
            <input required name="id" value={formData.id} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" />
          </div>
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">BOQ Name</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-label text-[12px] text-industrial-gray mb-1">Price (excl. GST)</label>
              <input required type="number" step="0.01" min="0" name="priceExclGst" value={formData.priceExclGst} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" placeholder="e.g. 1250.00" />
            </div>
            <div className="flex-1">
              <label className="block font-label text-[12px] text-industrial-gray mb-1">Price (incl. 18% GST)</label>
              <input readOnly disabled value={formatINR(priceInclPreview)} className="w-full border border-outline-variant/50 rounded p-2 outline-none text-[14px] bg-surface-container-highest text-industrial-gray cursor-not-allowed" />
            </div>
          </div>
          <div>
            <label className="block font-label text-[12px] text-industrial-gray mb-1">BOQ File (Excel)</label>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="w-full text-[14px]" />
            {selectedFile && <p className="text-[12px] text-industrial-gray mt-1">Selected: {selectedFile.name}</p>}
          </div>

          {formError && <p className="text-[13px] text-error">{formError}</p>}

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-outline-variant rounded text-[14px] hover:bg-surface-container">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-tech-blue text-white rounded text-[14px] hover:bg-tech-blue/90 disabled:opacity-50">
              {submitting ? "Saving…" : "Save BOQ"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}