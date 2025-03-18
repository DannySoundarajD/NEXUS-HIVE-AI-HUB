// Make sure this is a server component (no 'use client' directive)
import React from 'react';
import ClientSideLayout from '../../components/ClientSideLayout';
import { Inter } from 'next/font/google';
import './globals.css'; // Make sure this is imported
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const title = 'Nexus Hive AI | Intelligent Coding Assistant';
  const description = 'Your AI-powered coding companion for development tasks';

  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </head>
      <body className={inter.className}>
        <ClientSideLayout>
          {children}
        </ClientSideLayout>
      </body>
    </html>
  );
}