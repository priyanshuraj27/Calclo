import React from "react";
import { Icon } from "../../Icon";

const MOCK_MEMBERS = [
  { id: 1, name: "Priyanshu", email: "priyanshu@cal.com", role: "Owner", avatar: "P" },
  { id: 2, name: "John Doe", email: "john@cal.com", role: "Admin", avatar: "JD" },
  { id: 3, name: "Alice Smith", email: "alice@cal.com", role: "Member", avatar: "AS" },
  { id: 4, name: "Bob Johnson", email: "bob@cal.com", role: "Member", avatar: "BJ" },
  { id: 5, name: "Charlie Brown", email: "charlie@cal.com", role: "Member", avatar: "CB" },
  { id: 6, name: "Diana Prince", email: "diana@cal.com", role: "Admin", avatar: "DP" },
  { id: 7, name: "Ethan Hunt", email: "ethan@cal.com", role: "Member", avatar: "EH" },
];

export function OrgMembersPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl text-emphasis">
      <div className="border-b border-subtle pb-6 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Members</h2>
          <p className="text-sm text-subtle mt-1">Manage people in your organization.</p>
        </div>
        <div className="flex gap-2">
           <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition">
              Invite
           </button>
           <button className="btn-primary h-9 px-4 rounded-md bg-brand text-brand-contrast font-medium text-sm flex items-center hover:opacity-90 transition">
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Add Membership
           </button>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex gap-4 mb-4">
           <div className="relative flex-1">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
              <input type="text" placeholder="Search members..." className="w-full bg-default border border-subtle rounded-md h-9 pl-9 pr-3 text-sm focus:ring-1 focus:ring-brand focus:border-brand outline-none" />
           </div>
           <button className="h-9 px-3 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition flex items-center gap-2 text-subtle">
              <Icon name="filter" className="h-4 w-4" />
              Filter
           </button>
        </div>

        <div className="border border-subtle rounded-lg bg-default overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="bg-muted text-emphasis font-medium border-b border-subtle">
                    <tr>
                       <th className="px-6 py-3 w-auto">User</th>
                       <th className="px-6 py-3">Role</th>
                       <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-subtle">
                    {MOCK_MEMBERS.map((member) => (
                       <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-[10px] font-bold text-brand">
                                   {member.avatar}
                                </div>
                                <div className="flex flex-col">
                                   <span className="font-medium text-emphasis">{member.name}</span>
                                   <span className="text-xs text-subtle">{member.email}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                member.role === 'Owner' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                member.role === 'Admin' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                'bg-gray-100 text-gray-700 border-gray-200'
                             }`}>
                                {member.role}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button className="h-8 w-8 inline-flex items-center justify-center hover:bg-subtle rounded transition text-subtle">
                                <Icon name="more-horizontal" className="h-4 w-4" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
