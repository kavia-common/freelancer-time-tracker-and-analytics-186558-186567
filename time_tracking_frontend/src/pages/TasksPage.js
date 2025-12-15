import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { EmptyState, ErrorBlock, Loader, Modal } from '../components/Common';
import { Select, TextInput } from '../components/Forms';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', projectId: '' });

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const [t, p] = await Promise.all([api.tasks.list(), api.projects.list()]);
      setTasks(Array.isArray(t) ? t : (t.items || []));
      setProjects(Array.isArray(p) ? p : (p.items || []));
    } catch (e) { setErr(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const optionsProjects = useMemo(() => (projects || []).map(pr => ({ value: pr.id, label: pr.name })), [projects]);

  const onEdit = (task) => { setEditing(task); setForm({ name: task.name || '', description: task.description || '', projectId: task.projectId || '' }); setModalOpen(true); };
  const onCreate = () => { setEditing(null); setForm({ name: '', description: '', projectId: '' }); setModalOpen(true); };

  const onSave = async () => {
    const payload = { name: form.name, description: form.description, project_id: form.projectId || null };
    try {
      if (editing?.id) await api.tasks.update(editing.id, payload);
      else await api.tasks.create(payload);
      setModalOpen(false);
      await load();
    } catch (e) { setErr(e); }
  };

  const onDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.name}"?`)) return;
    try { await api.tasks.remove(task.id); await load(); } catch (e) { setErr(e); }
  };

  return (
    <div className="grid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-title">Tasks</div>
        <button className="btn primary" onClick={onCreate}>+ New Task</button>
      </div>

      {loading && <Loader label="Loading tasks..." />}
      <ErrorBlock error={err} />

      {!loading && !err && tasks.length === 0 && (
        <EmptyState title="No tasks" description="Create a task and assign to a project.">
          <button className="btn primary" onClick={onCreate}>Create Task</button>
        </EmptyState>
      )}

      {!loading && !err && tasks.length > 0 && (
        <div className="card pad">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Project</th>
                <th>Description</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => {
                const proj = projects.find(p => p.id === t.projectId || p.id === t.project_id);
                return (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{proj ? proj.name : <span className="badge gray">Unassigned</span>}</td>
                    <td className="muted">{t.description}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" onClick={() => onEdit(t)}>Edit</button>
                        <button className="btn danger" onClick={() => onDelete(t)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal title={editing ? 'Edit Task' : 'New Task'} open={modalOpen} onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn primary" onClick={onSave}>{editing ? 'Save' : 'Create'}</button>
          </>
        }>
        <TextInput label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
        <TextInput label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
        <Select label="Project" value={form.projectId} onChange={v => setForm(f => ({ ...f, projectId: v }))} options={[{ value: '', label: 'Unassigned' }, ...optionsProjects]} />
      </Modal>
    </div>
  );
}
