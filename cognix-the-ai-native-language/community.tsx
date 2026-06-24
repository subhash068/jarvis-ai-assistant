import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/community')({
  component: CommunityPlatform,
});

function CommunityPlatform() {
  const topics = [
    { title: 'RFC: Standard Library HTTP Client', author: 'network_guru', replies: 34, views: 1205, status: 'Active' },
    { title: 'How to deploy an Agent to Cognix Cloud?', author: 'newbie_dev', replies: 8, views: 340, status: 'Resolved' },
    { title: 'Feature Request: Async/Await syntax', author: 'async_fan', replies: 156, views: 8900, status: 'Under Review' },
    { title: 'Bug: Memory leak in String concatenation', author: 'perf_hunter', replies: 12, views: 450, status: 'Open' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8 bg-muted rounded-xl">
        <h1 className="text-4xl font-bold tracking-tight">Cognix Community Platform</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join the conversation. Discuss language features, report bugs, propose RFCs, and help build the future of AI-native programming.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90">
            Join Discord
          </button>
          <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90">
            View GitHub Discussions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Spaces</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer font-bold text-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> General Discussion
              </li>
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Announcements
              </li>
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> RFCs & Proposals
              </li>
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Bug Reports
              </li>
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Show & Tell
              </li>
            </ul>
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Latest Topics</h2>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
              New Topic
            </button>
          </div>

          <div className="border rounded-lg bg-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold">Topic</th>
                  <th className="px-6 py-3 text-sm font-semibold">Replies</th>
                  <th className="px-6 py-3 text-sm font-semibold">Views</th>
                  <th className="px-6 py-3 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topics.map((topic, i) => (
                  <tr key={i} className="hover:bg-muted/50 cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{topic.title}</p>
                      <p className="text-sm text-muted-foreground">Started by {topic.author}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{topic.replies}</td>
                    <td className="px-6 py-4 text-muted-foreground">{topic.views}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                        {topic.status}
                      </span>
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
