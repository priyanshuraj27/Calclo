import React from "react";
import { Icon } from "../../Icon";

export function OrgSecurityPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Security & Authentication</h2>
        <p className="text-sm text-subtle mt-1">Manage single sign-on and directory synchronization.</p>
      </div>

      <div className="flex flex-col gap-10">
        {/* SSO Section */}
        <div className="border border-subtle rounded-lg flex flex-col bg-default overflow-hidden">
           <div className="border-b border-subtle p-6 bg-muted/40 flex justify-between items-center">
              <div>
                 <h3 className="text-base font-semibold text-emphasis">Single Sign-On (SSO)</h3>
                 <p className="text-sm text-subtle mt-1">Configure SAML or OIDC for your organization.</p>
              </div>
              <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis">
                 Configure
              </button>
           </div>
           
           <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-muted border border-subtle rounded flex items-center justify-center">
                    <Icon name="shield" className="h-5 w-5 text-emphasis" />
                 </div>
                 <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-emphasis">No SSO Configuration</h4>
                    <p className="text-sm text-subtle">Set up SAML to allow members to sign in using your identity provider.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Directory Sync Section */}
        <div className="border border-subtle rounded-lg flex flex-col bg-default overflow-hidden">
           <div className="border-b border-subtle p-6 bg-muted/40 flex justify-between items-center">
              <div>
                 <h3 className="text-base font-semibold text-emphasis">Directory Sync (SCIM)</h3>
                 <p className="text-sm text-subtle mt-1">Automatically provision and deprovision users.</p>
              </div>
              <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis">
                 Enable SCIM
              </button>
           </div>
           
           <div className="p-12 flex flex-col items-center justify-center text-center">
              <Icon name="users" className="h-12 w-12 text-subtle opacity-30 mb-4" />
              <h4 className="text-sm font-medium text-emphasis">Automate your user management</h4>
              <p className="text-sm text-subtle max-w-sm mt-1">Connect your directory to automatically sync users from Okta, Azure AD, or Google Workspace.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
