import React from "react";
import { Icon } from "../../Icon";

const MOCK_ADMIN_USERS = [
  { id: 1, name: "Priyanshu", email: "priyanshu@cal.com", role: "Admin", status: "Active", joined: "2024-01-10" },
  { id: 2, name: "John Doe", email: "john@cal.com", role: "User", status: "Active", joined: "2024-01-12" },
  { id: 3, name: "Alice Smith", email: "alice@cal.com", role: "User", status: "Banned", joined: "2024-02-05" },
  { id: 4, name: "Bob Johnson", email: "bob@cal.com", role: "User", status: "Active", joined: "2024-02-10" },
  { id: 5, name: "Charlie Brown", email: "charlie@cal.com", role: "User", status: "Active", joined: "2024-02-15" },
  { id: 6, name: "Diana Prince", email: "diana@cal.com", role: "Admin", status: "Active", joined: "2024-03-01" },
  { id: 7, name: "Ethan Hunt", email: "ethan@cal.com", role: "User", status: "Inactive", joined: "2024-03-05" },
  { id: 8, name: "Frank Castle", email: "frank@cal.com", role: "User", status: "Active", joined: "2024-03-10" },
  { id: 9, name: "Grace Hopper", email: "grace@cal.com", role: "Admin", status: "Active", joined: "2024-03-15" },
  { id: 10, name: "Hank Pym", email: "hank@cal.com", role: "User", status: "Active", joined: "2024-03-20" },
  { id: 11, name: "Iris West", email: "iris@cal.com", role: "User", status: "Active", joined: "2024-03-25" },
  { id: 12, name: "Jack Sparrow", email: "jack@cal.com", role: "User", status: "Active", joined: "2024-04-01" },
  { id: 13, name: "Kevin Flynn", email: "kevin@cal.com", role: "User", status: "Active", joined: "2024-04-05" },
  { id: 14, name: "Lara Croft", email: "lara@cal.com", role: "User", status: "Active", joined: "2024-04-10" },
  { id: 15, name: "Mose Allison", email: "mose@cal.com", role: "User", status: "Banned", joined: "2024-04-15" },
];

export function AdminUsersPage() {
  return (
    <div className="flex flex-col flex-1 max-w-7xl text-emphasis">
       <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        <p className="text-sm text-subtle mt-1">Manage all users across the entire instance.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
           <div className="relative flex-1">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
              <input type="text" placeholder="Search by name or email..." className="w-full bg-default border border-subtle rounded-md h-9 pl-9 pr-3 text-sm focus:ring-1 focus:ring-brand focus:border-brand outline-none" />
           </div>
           <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition flex items-center gap-2">
              <Icon name="filter" className="h-4 w-4" />
              Status
           </button>
        </div>

        <div className="border border-subtle rounded-lg bg-default overflow-hidden">
           <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-sm relative border-collapse">
                 <thead className="bg-muted text-emphasis font-medium border-b border-subtle sticky top-0 z-10 shadow-sm">
                    <tr>
                       <th className="px-6 py-3">ID</th>
                       <th className="px-6 py-3">User</th>
                       <th className="px-6 py-3">Role</th>
                       <th className="px-6 py-3">Status</th>
                       <th className="px-6 py-3">Joined</th>
                       <th className="px-6 py-3 text-right whitespace-nowrap">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-subtle">
                    {MOCK_ADMIN_USERS.map((user) => (
                       <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-subtle font-mono text-xs">{user.id}</td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-xs text-subtle">{user.email}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`text-xs ${user.role === 'Admin' ? 'text-brand font-semibold' : 'text-subtle'}`}>
                                {user.role}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                user.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                user.status === 'Banned' ? 'bg-red-100 text-red-700' : 
                                'bg-gray-100 text-gray-700'
                             }`}>
                                {user.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-subtle">{user.joined}</td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-1">
                                <button title="Impersonate" className="h-8 w-8 inline-flex items-center justify-center hover:bg-subtle rounded transition text-subtle">
                                   <Icon name="user-plus" className="h-4 w-4" />
                                </button>
                                <button title="Details" className="h-8 w-8 inline-flex items-center justify-center hover:bg-subtle rounded transition text-subtle">
                                   <Icon name="external-link" className="h-4 w-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
        <div className="flex items-center justify-between text-xs text-subtle px-2">
           <span>Showing 15 of 1,248 users</span>
           <div className="flex gap-2 font-medium">
              <button className="opacity-50 cursor-not-allowed">Previous</button>
              <button className="hover:text-emphasis transition">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}
