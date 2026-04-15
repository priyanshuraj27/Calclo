import React from "react";
import { Icon } from "../../Icon";

const MOCK_ADMIN_ORGS = [
  { id: 1, name: "Cal.com, Inc.", slug: "acme", members: 1250, plan: "Enterprise", status: "Active" },
  { id: 2, name: "Google", slug: "google", members: 850, plan: "Enterprise", status: "Active" },
  { id: 3, name: "Meta", slug: "meta", members: 600, plan: "Enterprise", status: "Active" },
  { id: 4, name: "Amazon", slug: "amazon", members: 450, plan: "Team", status: "Active" },
  { id: 5, name: "Netflix", slug: "netflix", members: 300, plan: "Team", status: "Inactive" },
  { id: 6, name: "Apple", slug: "apple", members: 200, plan: "Team", status: "Active" },
  { id: 7, name: "Microsoft", slug: "microsoft", members: 150, plan: "Enterprise", status: "Active" },
  { id: 8, name: "Twitter", slug: "twitter", members: 100, plan: "Team", status: "Banned" },
  { id: 9, name: "Spotify", slug: "spotify", members: 80, plan: "Team", status: "Active" },
  { id: 10, name: "Stripe", slug: "stripe", members: 50, plan: "Team", status: "Active" },
];

export function AdminOrgsPage() {
  return (
    <div className="flex flex-col flex-1 max-w-7xl text-emphasis">
       <div className="border-b border-subtle pb-6 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Organizations</h2>
          <p className="text-sm text-subtle mt-1">Manage all organizations on this instance.</p>
        </div>
        <button className="btn-primary h-9 px-4 rounded-md bg-brand text-brand-contrast font-medium text-sm flex items-center hover:opacity-90 transition">
           <Icon name="plus" className="h-4 w-4 mr-2" />
           Create Organization
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
           <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
           <input type="text" placeholder="Search organizations..." className="w-full bg-default border border-subtle rounded-md h-9 pl-9 pr-3 text-sm focus:ring-1 focus:ring-brand focus:border-brand outline-none" />
        </div>

        <div className="border border-subtle rounded-lg bg-default overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="bg-muted text-emphasis font-medium border-b border-subtle">
                    <tr>
                       <th className="px-6 py-3">ID</th>
                       <th className="px-6 py-3">Organization</th>
                       <th className="px-6 py-3">Plan</th>
                       <th className="px-6 py-3">Members</th>
                       <th className="px-6 py-3">Status</th>
                       <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-subtle">
                    {MOCK_ADMIN_ORGS.map((org) => (
                       <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-subtle font-mono text-xs">{org.id}</td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="font-medium">{org.name}</span>
                                <span className="text-xs text-subtle">cal.com/{org.slug}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                org.plan === 'Enterprise' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                             }`}>
                                {org.plan}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-subtle font-medium">{org.members.toLocaleString()}</td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${org.status === 'Active' ? 'bg-green-500' : org.status === 'Banned' ? 'bg-red-500' : 'bg-gray-400'}`} />
                                <span className="text-xs">{org.status}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button className="h-8 w-8 inline-flex items-center justify-center hover:bg-subtle rounded transition text-subtle">
                                <Icon name="settings" className="h-4 w-4" />
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
