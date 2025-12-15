import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { EmptyState, ErrorBlock, Loader, Modal } from '../components/Common';
import { TextInput } from '../components/Forms';

export default function ProjectsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const resetForm = () => setForm({ name: '', description: '' });

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await api.projects.list();
      setData(Array.isArray(res) ? res : (res.items || []));
    } catch (e) { setErr(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onEdit = (p) => { setEditing(p); setForm({ name: p.name || '', description: p.description || '' }); setModalOpen(true); };
  const onCreate = () => { setEditing(null); resetForm(); setModalOpen(true); };

  const onSave = async () => {
    try {
      if (editing?.id) await api.projects.update(editing.id, form);
      else await api.projects.create(form);
      setModalOpen(false);
      await load();
    } catch (e) { setErr(e); }
  };

  const onDelete = async (p) => {
    if (!window.confirm(`Delete project "${p.name}"?`)) return;
    try { await api.projects.remove(p.id); await load(); } catch (e) { setErr(e); }
  };

  const rows = useMemo(() => data, [data]);

  return (
    <div className="grid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-title">Projects</div>
        <button className="btn primary" onClick={onCreate}>+ New Project</button>
      </div>

      {loading && <Loader label="Loading projects..." />}
      <ErrorBlock error={err} />

      {!loading && !err && rows.length === 0 && (
        <EmptyState title="No projects" description="Create your first project to get started."
          action={<button className="btn primary" onClick={onCreate}>Create Project</button>}
        />
      )}

      {!loading && !err && rows.length > 0 && (
        <div className="card pad">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="muted">{p.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={() => onEdit(p)}>Edit</button>
                      <button className="btn danger" onClick={() => onDelete(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal title={editing ? 'Edit Project' : 'New Project'} open={modalOpen} onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn primary" onClick={onSave}>{editing ? 'Save' : 'Create'}</button>
          </>
        }>
        <TextInput label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
        <TextInput label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
      </Modal>
    </div>
  );
}
