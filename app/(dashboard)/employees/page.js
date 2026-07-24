"use client";

import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import Modal from '../../components/Modal';

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, isLoaded } = useCRM();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    id: '',
    department: '',
    role: '',
    status: 'Active',
  });

  if (!isLoaded) return <div className="p-8">Loading...</div>;

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingId(employee.id);
      setFormData(employee);
    } else {
      setEditingId(null);
      setFormData({
        name: '', email: '', id: '', department: '', role: '', status: 'Active',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateEmployee(editingId, formData);
    else addEmployee(formData);
    handleCloseModal();
  };

  const totalWorkforce = employees.length;
  const active = employees.filter(e => e.status === 'Active').length;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return { statusColor: 'bg-energetic-green/10 border-energetic-green/20', dotColor: 'bg-energetic-green', textColor: 'text-secondary' };
      case 'On Leave': return { statusColor: 'bg-error-container border-error/20', dotColor: 'bg-error', textColor: 'text-error' };
      default: return { statusColor: 'bg-energetic-green/10 border-energetic-green/20', dotColor: 'bg-energetic-green', textColor: 'text-secondary' };
    }
  };



  return (
    <div className="max-w-[1280px] mx-auto space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline font-bold text-[28px] md:text-[32px] text-void-navy">Employee Management</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-energetic-green text-white rounded-lg font-semibold text-[14px] hover:bg-energetic-green/90 transition-colors shadow-sm">
            Add New Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bms-card p-4 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-industrial-gray opacity-50 group-hover:text-tech-blue group-hover:opacity-100 transition-all">
          </div>
          <p className="font-label text-[11px] text-industrial-gray uppercase tracking-wider">Total Employees</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline font-bold text-[44px] text-void-navy leading-none">{totalWorkforce}</h3>
          </div>
        </div>
        <div className="bms-card p-4 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-industrial-gray opacity-50 group-hover:text-tech-blue group-hover:opacity-100 transition-all">
          </div>
          <p className="font-label text-[11px] text-industrial-gray uppercase tracking-wider">Active Employees</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline font-bold text-[44px] text-void-navy leading-none">{active}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/20 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left industrial-table border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-void-navy text-white">
                <th className="p-4 font-label text-[11px] font-medium tracking-wider w-1/4">EMPLOYEE</th>
                <th className="p-4 font-label text-[11px] font-medium tracking-wider w-1/6">ID </th>
                <th className="p-4 font-label text-[11px] font-medium tracking-wider w-1/4">DEPARTMENT &amp; ROLE</th>
                <th className="p-4 font-label text-[11px] font-medium tracking-wider w-1/6">STATUS</th>
                <th className="p-4 w-16 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white text-[14px] text-on-surface">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-industrial-gray">No Employee found. Click "Add New Employee" to add one.</td>
                </tr>
              ) : employees.map((emp, i) => {
                const style = getStatusStyle(emp.status);
                const initials = emp.name ? emp.name.substring(0, 2).toUpperCase() : 'NA';
                return (
                  <tr key={emp.id} className={`group transition-colors ${i % 2 === 0 ? '' : 'bg-surface-container-lowest'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-tech-blue text-white font-bold flex items-center justify-center shrink-0`}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-void-navy">{emp.name}</p>
                          <p className="font-label text-[11px] text-industrial-gray">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-label text-[11px] bg-surface-container-high px-2 py-1 rounded-lg text-industrial-gray border border-outline-variant/20">
                        {emp.id || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-void-navy">{emp.department}</p>
                      <p className="font-label text-[11px] text-industrial-gray">{emp.role}</p>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${style.statusColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />
                        <span className={`font-label text-[11px] font-semibold ${style.textColor}`}>{emp.status}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenModal(emp)} className="text-industrial-gray hover:text-tech-blue p-1">
                        <span className=" text-[15px]">edit</span>
                      </button>
                      <button onClick={() => deleteEmployee(emp.id)} className="text-industrial-gray hover:text-error p-1">
                        <span className=" text-[15px]">delete</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Edit Employee" : "Add Employee"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-label text-[12px] text-industrial-gray mb-1">Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" placeholder="e.g. John Doe" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-label text-[12px] text-industrial-gray mb-1">Email</label>
                <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" placeholder="e.g. john@example.com" />
              </div>
              <div className="flex-1">
                <label className="block font-label text-[12px] text-industrial-gray mb-1">Employee ID</label>
                <input name="id" value={formData.id} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-label text-[12px] text-industrial-gray mb-1">Department</label>
                <input required name="department" value={formData.department} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" placeholder="e.g. Engineering" />
              </div>
              <div className="flex-1">
                <label className="block font-label text-[12px] text-industrial-gray mb-1">Role</label>
                <input required name="role" value={formData.role} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]" placeholder="e.g. Developer" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-label text-[12px] text-industrial-gray mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-outline-variant/50 rounded p-2 focus:ring-1 focus:ring-tech-blue outline-none text-[14px]">
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-outline-variant rounded text-[14px] hover:bg-surface-container">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-tech-blue text-white rounded text-[14px] hover:bg-tech-blue/90">{editingId ? "Save Changes" : "Add Employee"}</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
