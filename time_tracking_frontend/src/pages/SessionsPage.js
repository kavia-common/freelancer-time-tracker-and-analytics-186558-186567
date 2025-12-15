import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { EmptyState, ErrorBlock, Loader, Modal } from '../components/Common';
import { Checkbox, CurrencyInput, Select, TextInput } from '../components/Forms';

function formatDate(dt) {
  try { return new Date(dt).toLocaleString(); } catch { return dt; }
}
function durationMinutes(start, end) {
  try {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max(0, Math.round((e - s) / 60000));
  } catch { return 0; }
}
function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n || 0));
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    projectId: '',
    taskId: '',
    start_time: '',
    end_time: '',
    billable: true,
    hourly_rate: 0,
    notes: ''
  });

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const [s, t, p] = await Promise.all([
        api.sessions.list(),
        api.tasks.list(),
        api.projects.list()
      ]);
      setSessions(Array.isArray(s) ? s : (s.items || []));
      setTasks(Array.isArray(t) ? t : (t.items || []));
      setProjects(Array.isArray(p) ? p : (p.items || []));
    } catch (e) { setErr(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const projectOptions = useMemo(() => projects.map(p => ({ value: p.id, label: p.name })), [projects]);
  const taskOptions = useMemo(() => tasks.map(t => ({ value: t.id, label: t.name })), [tasks]);

  const onCreate = () => {
    setEditing(null);
    setForm({ projectId: '', taskId: '', start_time: '', end_time: '', billable: true, hourly_rate: 0, notes: '' });
    setModalOpen(true);
  };
  const onEdit = (s) => {
    setEditing(s);
    setForm({
      projectId: s.projectId || s.project_id || '',
      taskId: s.taskId || s.task_id || '',
      start_time: s.start_time || '',
      end_time: s.end_time || '',
      billable: typeof s.billable === 'boolean' ? s.billable : true,
      hourly_rate: s.hourly_rate ?? 0,
      notes: s.notes || ''
    });
    setModalOpen(true);
  };

  const onSave = async () => {
    const payload = {
      project_id: form.projectId || null,
      task_id: form.taskId || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      billable: !!form.billable,
      hourly_rate: Number(form.hourly_rate || 0),
      notes: form.notes || ''
    };
    try {
      if (editing?.id) await api.sessions.update(editing.id, payload);
      else await api.sessions.create(payload);
      setModalOpen(false);
      await load();
    } catch (e) { setErr(e); }
  };

  const onDelete = async (s) => {
    if (!window.confirm(`Delete session?`)) return;
    try { await api.sessions.remove(s.id); await load(); } catch (e) { setErr(e); }
  };

  const onStart = async () => {
    const payload = {
      project_id: form.projectId || null,
      task_id: form.taskId || null,
      billable: !!form.billable,
      hourly_rate: Number(form.hourly_rate || 0),
      notes: form.notes || ''
    };
    try { await api.sessions.start(payload); await load(); }
    catch (e) { setErr(e); }
  };
  const onStop = async (s) => {
    try { await api.sessions.stop(s.id); await load(); }
    catch (e) { setErr(e); }
  };

  return (
    <div className="grid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-title">Sessions</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn success" onClick={() => { setEditing(null); setForm(f => ({ ...f, start_time: '', end_time: '' })); onStart(); }}>▶ Start Quick</button>
          <button className="btn primary" onClick={onCreate}>+ Manual Add</button>
        </div>
      </div>

      {loading && <Loader label="Loading sessions..." />}
      <ErrorBlock error={err} />

      {!loading && !err && sessions.length === 0 && (
        <EmptyState title="No sessions" description="Start a session or add one manually."
          action={<button className="btn primary" onClick={onCreate}>Add Session</button>}
        />
      )}

      {!loading && !err && sessions.length > 0 && (
        <div className="card pad">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Task</th>
                <th>Start</th>
                <th>End</th>
                <th>Minutes</th>
                <th>Billable</th>
                <th>Rate</th>
                <th>Earnings</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => {
                const proj = projects.find(p => p.id === (s.projectId || s.project_id));
                const task = tasks.find(t => t.id === (s.taskId || s.task_id));
                const mins = s.end_time ? durationMinutes(s.start_time, s.end_time) : 0;
                const earnings = (s.billable && s.hourly_rate) ? (mins / 60) * Number(s.hourly_rate) : 0;
                const running = !s.end_time && s.start_time;
                return (
                  <tr key={s.id}>
                    <td>{proj ? proj.name : '-'}</td>
                    <td>{task ? task.name : '-'}</td>
                    <td>{s.start_time ? formatDate(s.start_time) : '-'}</td>
                    <td>{s.end_time ? formatDate(s.end_time) : (running ? <span className="badge green">Running</span> : '-')}</td>
                    <td>{mins}</td>
                    <td>{s.billable ? <span className="badge green">Billable</span> : <span className="badge gray">Non-billable</span>}</td>
                    <td>{formatMoney(s.hourly_rate || 0)}</td>
                    <td>{formatMoney(earnings)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {running ? (
                          <button className="btn success" onClick={() => onStop(s)}>■ Stop</button>
                        ) : (
                          <>
                            <button className="btn" onClick={() => onEdit(s)}>Edit</button>
                            <button className="btn danger" onClick={() => onDelete(s)}>Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal title={editing ? 'Edit Session' : 'Manual Session'} open={modalOpen} onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn primary" onClick={onSave}>{editing ? 'Save' : 'Create'}</button>
          </>
        }>
        <Select label="Project" value={form.projectId} onChange={v => setForm(f => ({ ...f, projectId: v }))} options={[{ value: '', label: 'Unassigned' }, ...projectOptions]} />
        <Select label="Task" value={form.taskId} onChange={v => setForm(f => ({ ...f, taskId: v }))} options={[{ value: '', label: 'Unassigned' }, ...taskOptions]} />
        <TextInput label="Start Time" type="datetime-local" value={form.start_time} onChange={v => setForm(f => ({ ...f, start_time: v }))} />
        <TextInput label="End Time" type="datetime-local" value={form.end_time} onChange={v => setForm(f => ({ ...f, end_time: v }))} />
        <Checkbox label="Billable" checked={form.billable} onChange={v => setForm(f => ({ ...f, billable: v }))} />
        <CurrencyInput label="Hourly Rate (USD)" value={form.hourly_rate} onChange={v => setForm(f => ({ ...f, hourly_rate: v }))} />
        <TextInput label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} />
      </Modal>
    </div>
  );
}
