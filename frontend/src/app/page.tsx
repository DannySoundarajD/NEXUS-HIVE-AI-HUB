"use client";

import React, { useState } from 'react';
import { 
  BarChart, 
  ChevronRight, 
  Code2, 
  Code, 
  Terminal, 
  FileCode, 
  GitBranch, 
  GitPullRequest, 
  Zap, 
  Layers, 
  Activity, 
  Settings 
} from 'lucide-react';

// Dashboard layout component
const NexusHiveDashboard: React.FC = () => {
  const [activeToolIndex, setActiveToolIndex] = useState(0);

  // Sample tool usage data
  const toolUsageData = [
    { name: 'Code Generator', usage: 78 },
    { name: 'Code Analyzer', usage: 65 },
    { name: 'Test Generator', usage: 42 },
    { name: 'Bug Fixer', usage: 53 },
    { name: 'Documentation', usage: 37 }
  ];

  // AI tools available in Nexus Hive
  const aiTools = [
    {
      id: 'code-generator',
      name: 'Code Generator',
      description: 'Generate production-ready code from natural language descriptions',
      icon: <Code2 className="h-6 w-6 text-indigo-500" />,
      stats: { usageCount: 1243, successRate: '92%', avgTime: '3.2s' }
    },
    {
      id: 'code-analyzer',
      name: 'Code Analyzer',
      description: 'Analyze code for bugs, vulnerabilities, and optimization opportunities',
      icon: <Code className="h-6 w-6 text-emerald-500" />,
      stats: { usageCount: 987, successRate: '89%', avgTime: '4.5s' }
    },
    {
      id: 'test-generator',
      name: 'Test Generator',
      description: 'Automatically generate comprehensive unit and integration tests',
      icon: <Terminal className="h-6 w-6 text-amber-500" />,
      stats: { usageCount: 765, successRate: '85%', avgTime: '5.7s' }
    },
    {
      id: 'bug-fixer',
      name: 'Bug Fixer',
      description: 'Identify and fix bugs in your codebase with AI assistance',
      icon: <Zap className="h-6 w-6 text-rose-500" />,
      stats: { usageCount: 892, successRate: '78%', avgTime: '6.3s' }
    },
    {
      id: 'documentation',
      name: 'Documentation Generator',
      description: 'Generate comprehensive documentation for your code and APIs',
      icon: <FileCode className="h-6 w-6 text-blue-500" />,
      stats: { usageCount: 654, successRate: '94%', avgTime: '2.8s' }
    },
    {
      id: 'code-review',
      name: 'AI Code Review',
      description: 'Get detailed code reviews with best practice recommendations',
      icon: <GitPullRequest className="h-6 w-6 text-purple-500" />,
      stats: { usageCount: 543, successRate: '91%', avgTime: '8.2s' }
    },
    {
      id: 'architecture',
      name: 'Architecture Assistant',
      description: 'Design system architecture with AI suggestions and optimizations',
      icon: <Layers className="h-6 w-6 text-teal-500" />,
      stats: { usageCount: 432, successRate: '87%', avgTime: '12.5s' }
    },
    {
      id: 'git-assistant',
      name: 'Git Assistant',
      description: 'Smart commit messages, branch management, and merge conflict resolution',
      icon: <GitBranch className="h-6 w-6 text-orange-500" />,
      stats: { usageCount: 621, successRate: '90%', avgTime: '3.9s' }
    }
  ];

  // Recent activity data
  const recentActivity = [
    { id: 1, tool: 'Code Generator', action: 'Generated React component', time: '2 minutes ago' },
    { id: 2, tool: 'Bug Fixer', action: 'Fixed memory leak in authentication service', time: '15 minutes ago' },
    { id: 3, tool: 'Test Generator', action: 'Created 24 unit tests for payment module', time: '35 minutes ago' },
    { id: 4, tool: 'Documentation', action: 'Generated API docs for user service', time: '1 hour ago' },
    { id: 5, tool: 'Architecture Assistant', action: 'Optimized database schema', time: '3 hours ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 hidden md:block h-screen">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">NEXUS HIVE AI</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Intelligent Coding Assistant</p>
          </div>
          
          <nav className="space-y-1">
            <button className="flex items-center w-full px-3 py-2 text-left rounded-md bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
              <BarChart className="h-5 w-5 mr-3" />
              Dashboard
            </button>
            
            <button className="flex items-center w-full px-3 py-2 text-left rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Activity className="h-5 w-5 mr-3" />
              Analytics
            </button>
            
            <button className="flex items-center w-full px-3 py-2 text-left rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </button>
          </nav>
          
          <div className="mt-8">
            <h2 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">AI TOOLS</h2>
            <div className="space-y-1">
              {aiTools.map((tool, index) => (
                <button 
                  key={tool.id}
                  className={`flex items-center w-full px-3 py-2 text-left rounded-md ${index === activeToolIndex 
                    ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveToolIndex(index)}
                >
                  {tool.icon}
                  <span className="ml-2 text-sm">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Code Generated</h2>
                <Code2 className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">45,823 lines</p>
              <p className="text-sm text-green-500 mt-1">↑ 12% from last week</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bugs Fixed</h2>
                <Zap className="h-5 w-5 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">723</p>
              <p className="text-sm text-green-500 mt-1">↑ 8% from last week</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Generated</h2>
                <Terminal className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">3,541</p>
              <p className="text-sm text-green-500 mt-1">↑ 15% from last week</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Code Quality Score</h2>
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">92/100</p>
              <p className="text-sm text-green-500 mt-1">↑ 4 points from last week</p>
            </div>
          </div>
          
          {/* Current Tool */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                {aiTools[activeToolIndex].icon}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-3">{aiTools[activeToolIndex].name}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{aiTools[activeToolIndex].description}</p>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Usage Count</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{aiTools[activeToolIndex].stats.usageCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                  <p className="text-xl font-bold text-green-500 mt-1">{aiTools[activeToolIndex].stats.successRate}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Process Time</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{aiTools[activeToolIndex].stats.avgTime}</p>
                </div>
              </div>
              
              <button className="flex items-center text-indigo-600 dark:text-indigo-400 mt-6 text-sm font-medium">
                Open tool
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Tool Usage</h3>
                <div className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</div>
              </div>
              <div className="mt-3 h-16 flex items-end space-x-2">
                {toolUsageData.map((item, index) => (
                  <div 
                    key={item.name} 
                    className="flex-1 flex flex-col items-center"
                  >
                    <div 
                      className={`w-full ${
                        index === activeToolIndex ? 'bg-indigo-500' : 'bg-indigo-200 dark:bg-indigo-800'
                      } rounded-t`} 
                      style={{ height: `${item.usage}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivity.map(activity => (
                <div key={activity.id} className="px-6 py-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Using {activity.tool}</p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
              <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">View all activity</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexusHiveDashboard;