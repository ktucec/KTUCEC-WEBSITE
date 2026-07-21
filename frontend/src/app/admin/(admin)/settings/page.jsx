'use client';

import { useState, useEffect, useRef } from 'react';
import AdminVerificationModal from '@/components/ui/AdminVerificationModal';

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

    const [originalData, setOriginalData] = useState({
        fullName: '',
        email: '',
        imageUrl: ''
    });

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        imageUrl: ''
    });

    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                // TODO: Implement actual API fetch here
                // const response = await GetAdminProfile();

                await new Promise(res => setTimeout(res, 800)); // Simulate API delay

                // Mock API Response (Bu, kullanıcının MEVCUT/ESKİ mailidir)
                const data = {
                    fullName: 'Barış',
                    email: 'admin@ktucec.com',
                    imageUrl: '' // Empty means no profile pic yet
                };

                setOriginalData(data);
                setFormData({ ...data, password: '' });
                setImagePreview(data.imageUrl || null);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                alert('Profil bilgileri yüklenemedi.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const getChangedFields = () => {
        const changes = {};
        if (formData.fullName !== originalData.fullName) changes.fullName = formData.fullName;
        if (formData.email !== originalData.email) changes.email = formData.email;
        if (formData.imageUrl !== originalData.imageUrl) changes.imageUrl = formData.imageUrl;
        if (formData.password && formData.password.trim() !== '') changes.password = formData.password;
        return changes;
    };

    const hasChanges = Object.keys(getChangedFields()).length > 0;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setFormData(prev => ({ ...prev, imageUrl: previewUrl }));
        }
    };

    const handleInitiateSave = async (e) => {
        e.preventDefault();
        if (!hasChanges) return;

        // TODO: Sunucuya "Bana doğrulama kodu gönder" isteği atılmalı (örneğin sendOtpCode servisi)
        // Çünkü login sayfasında "loginAdmin" fonksiyonu kodu otomatik gönderiyordu. 
        // Ayarlar sayfasında isek, kaydetmeden hemen önce sunucudan bir OTP talep etmeliyiz.
        // await sendOtpCode(originalData.email);

        setIsVerificationModalOpen(true);
    };

    const handleFinalSave = async () => {
        const changedData = getChangedFields();
        if (Object.keys(changedData).length === 0) return;

        setIsSaving(true);
        try {
            // TODO: Implement actual API update call here passing `changedData`
            // await UpdateAdminProfile(changedData);

            await new Promise(res => setTimeout(res, 1000)); // Simulate API delay

            console.log('Sending to Backend:', changedData);

            // Update original data with new changes
            setOriginalData(prev => ({
                ...prev,
                fullName: formData.fullName,
                email: formData.email,
                imageUrl: formData.imageUrl
            }));

            // Clear password field after successful update
            setFormData(prev => ({ ...prev, password: '' }));

            alert('Profil bilgileriniz başarıyla güncellendi!');
        } catch (error) {
            alert('Güncellenirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto bg-surface md:p-4">
            <div className="max-w-3xl mx-auto">

                <div className="mb-8">
                    <h1 className="font-headline-md text-3xl text-on-surface">Profil Ayarları</h1>
                    <p className="font-body-md text-on-surface-variant mt-2">
                        Yönetici hesabınıza ait profil, iletişim ve güvenlik bilgilerini buradan yönetebilirsiniz.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 min-h-[400px] bg-surface-container-lowest border border-outline-variant/30 rounded-2xl">
                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                        <p className="mt-4 font-body-md text-secondary">Profil yükleniyor...</p>
                    </div>
                ) : (
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden relative">

                        {isSaving && (
                            <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                                <p className="mt-2 font-label-md text-primary">Güncelleniyor...</p>
                            </div>
                        )}

                        <form onSubmit={handleInitiateSave}>

                            <div className="p-8 border-b border-outline-variant/20 flex flex-col sm:flex-row items-center gap-8">
                                <div
                                    className="relative w-28 h-28 rounded-full bg-surface-container border-4 border-surface shadow-md flex items-center justify-center cursor-pointer overflow-hidden group shrink-0"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profil Önizleme" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-5xl text-secondary">person</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                                    </div>
                                </div>

                                <div className="text-center sm:text-left">
                                    <h2 className="font-headline-sm text-2xl text-on-surface">{originalData.fullName}</h2>
                                    <p className="font-label-md text-primary mt-1 uppercase tracking-wider">Sistem Yöneticisi</p>
                                    <p className="font-body-md text-secondary text-sm mt-2">Profil fotoğrafınızı değiştirmek için görsele tıklayın.</p>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-md text-secondary ml-1" htmlFor="fullName">İsim Soyisim</label>
                                        <input
                                            className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-md text-secondary ml-1" htmlFor="email">E-posta Adresi</label>
                                        <input
                                            type="email"
                                            className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
                                    <label className="font-label-md text-secondary ml-1" htmlFor="password">Yeni Şifre Belirle</label>
                                    <input
                                        type="password"
                                        className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:opacity-50"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                    />
                                    <p className="text-xs text-secondary ml-1 mt-1">Sadece şifrenizi güncellemek istiyorsanız bu alanı doldurun.</p>
                                </div>
                            </div>

                            <div className="p-6 bg-surface-container-low border-t border-outline-variant/20 flex justify-end">
                                <button
                                    disabled={!hasChanges}
                                    type="submit"
                                    className={`font-label-md py-3 px-8 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${hasChanges ? 'bg-primary hover:bg-primary-container text-white cursor-pointer' : 'bg-surface-container-high text-secondary cursor-not-allowed'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    <span>{hasChanges ? 'Değişiklikleri Kaydet' : 'Değişiklik Yok'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <AdminVerificationModal
                isOpen={isVerificationModalOpen}
                onClose={() => setIsVerificationModalOpen(false)}
                onSuccess={handleFinalSave}
                // DİKKAT: Burada formData.email DEĞİL, originalData.email gönderiliyor.
                // Böylece kullanıcı input'a ne yazarsa yazsın, doğrulama kodu 
                // her zaman sisteme önceden kayıtlı olan (eski) mail adresine gidecektir.
                email={originalData.email}
            />

        </main>
    );
}