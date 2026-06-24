import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/hub')({
  component: CognixHub,
});

function CognixHub() {
  const packages = [
    { name: 'ai-agent', version: '1.2.0', downloads: 12000, author: 'Devendra', category: 'Agents' },
    { name: 'vision-tools', version: '0.9.4', downloads: 8500, author: 'CognixCore', category: 'Vision' },
    { name: 'db-connect', version: '2.1.0', downloads: 4200, author: 'DataSmith', category: 'Database' },
    { name: 'web-scraper', version: '1.0.5', downloads: 3100, author: 'WebNinja', category: 'Web' },
    { name: 'security-scan', version: '0.5.0', downloads: 900, author: 'SecOps', category: 'Security' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Cognix Hub</h1>
          <p className="text-xl text-muted-foreground">The public registry for Cognix packages.</p>
        </div>
        <div>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:opacity-90">
            Publish Package
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Categories</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li className="hover:text-primary cursor-pointer">AI (120)</li>
              <li className="hover:text-primary cursor-pointer font-bold text-foreground">Agents (85)</li>
              <li className="hover:text-primary cursor-pointer">Database (45)</li>
              <li className="hover:text-primary cursor-pointer">Web (60)</li>
              <li className="hover:text-primary cursor-pointer">Cloud (30)</li>
              <li className="hover:text-primary cursor-pointer">Vision (15)</li>
              <li className="hover:text-primary cursor-pointer">Voice (10)</li>
              <li className="hover:text-primary cursor-pointer">ML (50)</li>
              <li className="hover:text-primary cursor-pointer">Security (22)</li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-3 space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search packages (e.g. 'ai-agent')" 
              className="w-full px-4 py-2 border rounded-md bg-background"
            />
            <button className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md">Search</button>
          </div>

          <h2 className="text-2xl font-semibold mt-6 mb-4">Trending Packages</h2>
          
          <div className="space-y-4">
            {packages.map(pkg => (
              <div key={pkg.name} className="border rounded-lg p-6 bg-card hover:border-primary transition-colors cursor-pointer flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-1">{pkg.name} <span className="text-sm font-normal text-muted-foreground ml-2">v{pkg.version}</span></h3>
                  <p className="text-sm text-muted-foreground mb-3">Published by <span className="font-medium text-foreground">{pkg.author}</span></p>
                  <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">{pkg.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{pkg.downloads.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Downloads</p>
                  <div className="mt-3 text-sm font-mono bg-muted px-3 py-1 rounded">
                    cpm install {pkg.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
