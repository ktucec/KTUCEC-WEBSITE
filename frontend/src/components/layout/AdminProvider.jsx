'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '@/services/auth';

const AdminContext = createContext({
    adminName: "Yönetici",
    adminRole: 3,
    role: 1,
    profileUrl: null,
    isRoleLoading: true
});

export function AdminProvider({ children }) {
    const [adminData, setAdminData] = useState({
        adminName: "Yönetici",
        adminRole: 3,
        role: 1,
        profileUrl: null,
        isRoleLoading: true
    });

    useEffect(() => {
        let isCancelled = false;

        const fetchRoleData = async () => {
            try {
                const res = await getMe();

                if (!isCancelled) {
                    const data = res?.data || res || {};
                    setAdminData({
                        adminName: data.nameSurname || "Yönetici",
                        adminRole: data.adminRole || 3,
                        role: data.role || 1, 
                        profileUrl: data.profileUrl || null,
                        isRoleLoading: false
                    });
                }
            } catch (err) {
                console.error('Kullanıcı bilgileri alınamadı:', err);
                if (!isCancelled) {
                    setAdminData(prev => ({ ...prev, isRoleLoading: false }));
                }
            }
        };

        fetchRoleData();

        return () => { isCancelled = true; };
    }, []);

    return (
        <AdminContext.Provider value={adminData}>
            {children}
        </AdminContext.Provider>
    );
}

export const useAdmin = () => useContext(AdminContext);