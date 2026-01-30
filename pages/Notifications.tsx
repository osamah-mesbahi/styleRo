import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

const Notifications: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [adminKey, setAdminKey] = useState<string>(() => { try { return localStorage.getItem('stylero_admin_key') || ''; } catch (e) { return ''; } });

  useEffect(() => { fetchList(); }, [page, adminKey]);

  async function fetchList() {
    setLoading(true);
    try {
      const token = localStorage.getItem('stylero_token');
      const url = `/notifications?limit=${limit}&page=${page}${token ? '&admin=1' : ''}`;
      const opts: any = {};
      if (token) opts.headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setList(data.items || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function markRead(id: number) {
    try {
      const token = localStorage.getItem('stylero_token');
        const opts: any = { method: 'POST' };
        if (token) opts.headers = { 'Authorization': `Bearer ${token}` };
        await fetch(`/notifications/${id}/read`, opts);
      setList(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error(e); }
  }

  async function markAll() {
    try {
      const token = localStorage.getItem('stylero_token');
      const opts: any = { method: 'POST' };
      if (token) opts.headers = { 'Authorization': `Bearer ${token}` };
      await fetch('/notifications/mark-all-read', opts);
      setList(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  }

  function saveAdminKey() {
    try { localStorage.setItem('stylero_admin_key', adminKey || ''); } catch (e) {}
    fetchList();
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/" className="text-primary"><ArrowLeft /></Link>
        <h2 className="font-extrabold text-lg">سجل الإشعارات</h2>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <input value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="API Key (admin)" className="px-3 py-2 border rounded-lg text-sm outline-none" />
          <button onClick={saveAdminKey} className="btn-primary px-3 py-2">حفظ</button>
        </div>
        <button onClick={markAll} className="btn-primary px-3 py-2 rounded-full text-sm font-extrabold">وسم الكل كمقروء</button>
      </div>

        <div className="nice-card bg-white border rounded-lg shadow-sm">
        {loading && <div className="p-4 text-center text-sm">جارٍ التحميل...</div>}
        {!loading && list.length === 0 && <div className="p-4 text-sm text-gray-400">لا توجد إشعارات بعد.</div>}
        <div className="divide-y">
          {list.map(n => (
            <div key={n.id} className={`p-4 flex justify-between items-start ${n.isRead ? 'bg-white' : 'bg-gray-50'}`}>
              <div>
                <div className="font-bold text-sm">{n.title}</div>
                <div className="text-xs text-gray-600 mt-1">{n.message}</div>
                <div className="text-[11px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!n.isRead && <button onClick={() => markRead(n.id)} className="text-primary text-sm font-extrabold flex items-center gap-2"><Check size={14}/>وضع كمقروء</button>}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 flex items-center justify-between text-sm">
          <div className="text-gray-500">إجمالي: {total}</div>
          <div className="flex items-center gap-2">
            <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-2 py-1 btn-secondary rounded">السابق</button>
            <div className="px-2">{page}</div>
            <button disabled={page*limit>=total} onClick={() => setPage(p => p+1)} className="px-2 py-1 btn-secondary rounded">التالي</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;

