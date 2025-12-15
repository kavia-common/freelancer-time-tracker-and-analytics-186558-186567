import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ErrorBlock, Loader } from '../components/Common';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';

function formatCurrency(n) { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n || 0)); }

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true); setErr(null);
      try {
        const [d, w, m] = await Promise.all([
          api.analytics.summary('daily'),
          api.analytics.summary('weekly'),
          api.analytics.summary('monthly'),
        ]);
        if (!mounted) return;
        setDaily(d?.data || d || []);
        setWeekly(w?.data || w || []);
        setMonthly(m?.data || m || []);
      } catch (e) {
        if (mounted) setErr(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="grid">
      <div className="grid cols-3">
        <div className="card pad">
          <div className="section-title">Today</div>
          <div className="muted">Hours & Earnings</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>
            {formatCurrency(daily?.[daily.length - 1]?.earnings || 0)}
          </div>
        </div>
        <div className="card pad">
          <div className="section-title">This Week</div>
          <div className="muted">Total Earnings</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>
            {formatCurrency(weekly?.reduce((s, x) => s + (x.earnings || 0), 0))}
          </div>
        </div>
        <div className="card pad">
          <div className="section-title">This Month</div>
          <div className="muted">Total Earnings</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>
            {formatCurrency(monthly?.reduce((s, x) => s + (x.earnings || 0), 0))}
          </div>
        </div>
      </div>

      {loading && <Loader label="Loading analytics..." />}
      <ErrorBlock error={err} />

      {!loading && !err && (
        <div className="grid cols-2">
          <div className="card pad">
            <div className="section-title">Daily Earnings</div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily}>
                  <defs>
                    <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Area type="monotone" dataKey="earnings" stroke="#3b82f6" fillOpacity={1} fill="url(#c1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card pad">
            <div className="section-title">Weekly Hours</div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
