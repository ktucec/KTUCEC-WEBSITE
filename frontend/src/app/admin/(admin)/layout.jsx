import React from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { AdminProvider } from '@/components/layout/AdminProvider'; 
import '@/styles/globals.css';

export const metadata = {
    title: 'KTUCEC Admin',
    description: 'Admin Panel Management System',
};

export default function AdminRootLayout({ children }) {
    return (
        <html lang="tr">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@700;800&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </head>

            <body className="font-body-md bg-surface text-on-surface min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-white">

                <AdminProvider>
                    <AdminSidebar />

                    <div className="flex flex-1 overflow-hidden w-auto md:ml-64 md:mt-0 mt-20">
                        <div className="mx-auto w-full lg:w-[70%] p-6 md:p-8">
                            {children}
                        </div>
                    </div>
                </AdminProvider>

            </body>
        </html>
    );
}