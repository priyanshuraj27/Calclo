import React from "react";
import { Icon } from "../../Icon";

const TEAM_MEMBERS = [
  { id: 1, name: "Priyanshu", email: "priyanshu@cal.com", role: "Owner", avatar: "P" },
  { id: 2, name: "Charlie Brown", email: "charlie@cal.com", role: "Member", avatar: "CB" },
  { id: 3, name: "Diana Prince", email: "diana@cal.com", role: "Admin", avatar: "DP" },
];

export function TeamMembersPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl text-emphasis">
      <div className="border-b border-subtle pb-6 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Team Members</h2>
          <p className="text-sm text-subtle mt-1">Manage who's contributing to this team.</p>
        </div>
        <button className="btn-primary h-9 px-4 rounded-md bg-brand text-brand-contrast font-medium text-sm flex items-center hover:opacity-90 transition">
           <Icon name="plus" className="h-4 w-4 mr-2" />
           Add Member
        </button>
      </div>

      <div className="border border-subtle rounded-lg bg-default overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-muted text-emphasis font-medium border-b border-subtle">
               <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
               {TEAM_MEMBERS.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-[10px] font-bold text-brand uppercase">
                              {member.avatar}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-medium">{member.name}</span>
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
  );
}
