import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getAllUsers } from '../../services/firestoreService';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'email' | 'phone'>('all');
  const [userSort, setUserSort] = useState<'newest' | 'name'>('newest');
  const exportCsv = (filename: string, rows: Record<string, any>[]) => {
    if (!rows.length) { alert('لا توجد بيانات للتصدير'); return; }
    const headers = Object.keys(rows[0]);
    const sanitize = (v: any) => {
      const val = v === undefined || v === null ? '' : String(v);
      const escaped = val.replace(/"/g, '""');
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
    };
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => sanitize(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  useEffect(() => {
    getAllUsers().then(j => { if (Array.isArray(j)) setUsers(j); }).catch(() => {});
  }, []);

  const normalized = search.trim().toLowerCase();
  const filteredUsers = users.filter(u => {
    const matchesSearch = normalized ? `${u.name || ''} ${u.email || ''} ${u.phone || ''}`.toLowerCase().includes(normalized) : true;
    const matchesRole = roleFilter === 'all' ? true : roleFilter === 'admin' ? !!u.isAdmin : !u.isAdmin;
    const matchesSource = sourceFilter === 'all' ? true : sourceFilter === 'email' ? !!u.email : !!u.phone;
    const created = u.createdAt ? new Date(u.createdAt) : null;
    const fromOk = dateFrom && created ? created >= new Date(dateFrom) : true;
    const toOk = dateTo && created ? created <= new Date(dateTo + 'T23:59:59') : true;
    return matchesSearch && matchesRole && matchesSource && fromOk && toOk;
  }).sort((a, b) => {
    if (userSort === 'name') return (a.name || '').localeCompare(b.name || '');
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد أو الهاتف" className="w-full pl-9 pr-3 py-3 rounded-2xl bg-gray-50 border outline-none focus:border-primary/40 text-sm" />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')} className="px-4 py-3 rounded-2xl bg-gray-50 border text-sm outline-none">
            <option value="all">كل الأدوار</option>
            <option value="admin">المشرفون</option>
            <option value="user">المستخدمون</option>
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)} className="px-4 py-3 rounded-2xl bg-white border text-sm outline-none">
            <option value="all">كل المصادر</option>
            <option value="email">مسجل بالبريد</option>
            <option value="phone">مسجل بالهاتف</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-2xl bg-white border text-sm outline-none" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-2xl bg-white border text-sm outline-none" />
          <select value={userSort} onChange={(e) => setUserSort(e.target.value as any)} className="px-4 py-3 rounded-2xl bg-white border text-sm outline-none">
            <option value="newest">الأحدث أولاً</option>
            <option value="name">ترتيب بالأسماء</option>
          </select>
          <span className="bg-gray-100 px-3 py-1 rounded-full">الكل: {users.length}</span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">المعروضة: {filteredUsers.length}</span>
          {(search || roleFilter !== 'all' || sourceFilter !== 'all' || dateFrom || dateTo || userSort !== 'newest') && (
            <button onClick={() => { setSearch(''); setRoleFilter('all'); setSourceFilter('all'); setDateFrom(''); setDateTo(''); setUserSort('newest'); }} className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded-full border border-blue-100 bg-blue-50">إعادة الضبط</button>
          )}
          <button onClick={() => exportCsv('users', filteredUsers.map(u => ({
            id: u.id,
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            role: u.isAdmin ? 'admin' : 'user',
            createdAt: u.createdAt || '',
            lastLoginAt: (u as any).lastLoginAt || '',
            isActive: (u as any).isActive ?? (u as any).isVerified ?? ''
          })))} className="text-green-700 px-3 py-1 rounded-full border border-green-100 bg-green-50">تصدير CSV</button>
        </div>
      </div>

      {filteredUsers.length === 0 && <div className="text-gray-400">لا توجد حسابات مطابقة</div>}
      <div className="space-y-3">
        {filteredUsers.map(u => (
          <div key={u.id} className="p-3 rounded-2xl border bg-white flex items-center justify-between">
            <div>
              <div className="font-extrabold">{u.name || u.phone || u.email}</div>
              <div className="text-[11px] text-gray-500">{u.email || 'بدون بريد'} • {u.phone || 'بدون رقم'}</div>
            </div>
            <div className="text-right text-[12px] font-extrabold">{u.isAdmin ? 'مشرف' : 'مستخدم'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
