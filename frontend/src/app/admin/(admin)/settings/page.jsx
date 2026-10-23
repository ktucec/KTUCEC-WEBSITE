'use client';

import { useState, useEffect, useRef } from 'react';
import AdminVerificationModal from '@/components/ui/AdminVerificationModal';
import { useAdmin } from '@/components/layout/AdminProvider';
import { updateManager, verifyManagerUpdate } from '@/services/auth';
import { Avatar, Icon, PageHeader, Segmented, useToast } from '@/components/admin/ui';
import { useAdminTheme } from '@/components/admin/theme';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AdminSettingsPage() {
    const adminCtx = useAdmin();
    const toast = useToast();
    const [theme, , setTheme] = useAdminTheme();
    const [showPw, setShowPw] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [initiateError, setInitiateError] = useState(null);

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

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!adminCtx.isRoleLoading) {
            setIsLoading(true);
            try {
                const data = {
                    fullName: adminCtx.adminName || '',
                    email: adminCtx.email || '',
                    imageUrl: adminCtx.profileUrl || ''
                };

                setOriginalData(data);
                setFormData({ ...data, password: '' });

                if (data.imageUrl) {
                    setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${data.imageUrl}`);
                } else {
                    setImagePreview(null);
                }
            } catch (error) {
                console.error('Failed to set profile data:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [adminCtx.isRoleLoading, adminCtx.adminName, adminCtx.email, adminCtx.profileUrl]);

    const getChangedFields = () => {
        const changes = {};
        if (formData.fullName !== originalData.fullName) changes.nameSurname = formData.fullName;
        if (formData.email !== originalData.email) changes.email = formData.email;
        if (formData.password && formData.password.trim() !== '') changes.password = formData.password;
        return changes;
    };

    const hasChanges = Object.keys(getChangedFields()).length > 0 || imageFile !== null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                toast.error('Sadece PNG, JPG veya JPEG formatında görsel yükleyebilirsiniz.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setImageFile(file);
        }
    };

    const handleInitiateSave = async (e) => {
        e.preventDefault();
        if (!hasChanges) return;

        setInitiateError(null);

        try {
            await verifyManagerUpdate();
            setIsVerificationModalOpen(true);
        } catch (err) {
            setInitiateError(err.message || 'Doğrulama kodu gönderilirken bir hata oluştu.');
        }
    };

    const handleUpdateSubmit = async (code) => {
        const changedData = getChangedFields();

        setIsSaving(true);
        try {
            const submitData = new FormData();

            if (changedData.nameSurname) submitData.append('NameSurname', changedData.nameSurname);
            if (changedData.email) submitData.append('Email', changedData.email);
            if (changedData.password) submitData.append('Password', changedData.password);
            if (imageFile) submitData.append('Image', imageFile);

            submitData.append('OtpCode', code);

            await updateManager(submitData);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateSuccess = () => {
        setOriginalData(prev => ({
            ...prev,
            fullName: formData.fullName,
            email: formData.email,
        }));

        setFormData(prev => ({ ...prev, password: '' }));
        setImageFile(null);
        toast.success('Profil bilgileriniz güncellendi.');
    };

    const roleLabel = adminCtx.adminRole === 1 ? 'President' : adminCtx.adminRole === 2 ? 'Vice President' : 'Board Member';

    return (
        <>
            <PageHeader title="Hesap Ayarları" description="Profil bilgilerinizi, şifrenizi ve panel görünümünüzü buradan yönetin." />

            <div style={{ display: 'grid', gap: 18, maxWidth: 860 }}>
                {isLoading ? (
                    <div className="ad-card ad-card-pad" aria-busy="true" style={{ display: 'grid', gap: 14 }}>
                        <div className="ad-row" style={{ gap: 16 }}>
                            <span className="ad-skel" style={{ width: 84, height: 84, borderRadius: '50%' }} />
                            <div style={{ flex: 1, display: 'grid', gap: 10 }}>
                                <span className="ad-skel" style={{ height: 18, width: '40%' }} />
                                <span className="ad-skel" style={{ height: 14, width: '25%' }} />
                            </div>
                        </div>
                        <span className="ad-skel" style={{ height: 44 }} />
                        <span className="ad-skel" style={{ height: 44 }} />
                    </div>
                ) : (
                    <form onSubmit={handleInitiateSave} className="ad-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        {isSaving && (
                            <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'grid', placeItems: 'center', background: 'color-mix(in srgb, var(--ad-card) 70%, transparent)', backdropFilter: 'blur(3px)' }}>
                                <span className="ad-row" style={{ gap: 8, fontWeight: 700, color: 'var(--ad-brand)' }}>
                                    <Icon name="progress_activity" className="ad-spin" /> Güncelleniyor…
                                </span>
                            </div>
                        )}

                        {initiateError && (
                            <div className="ad-err" style={{ margin: 18 }} role="alert">
                                <Icon name="error" className="ad-ico-sm" fill />
                                <span>{initiateError}</span>
                            </div>
                        )}

                        <div className="ad-card-pad" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, borderBottom: '1px solid var(--ad-line)' }}>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                aria-label="Profil fotoğrafını değiştir"
                                style={{ position: 'relative', width: 92, height: 92, borderRadius: '50%', border: 0, padding: 0, cursor: 'pointer', overflow: 'hidden', background: 'none', flexShrink: 0 }}
                                className="ad-avatar-btn"
                            >
                                <input
                                    type="file"
                                    accept=".png, .jpg, .jpeg, image/png, image/jpeg"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                />
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profil önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ display: 'block', width: '100%', height: '100%' }}>
                                        <Avatar name={originalData.fullName} size="lg" />
                                    </span>
                                )}
                                <span className="ad-avatar-over"><Icon name="photo_camera" /></span>
                            </button>
                            <div style={{ minWidth: 0, flex: '1 1 220px' }}>
                                <h2 style={{ margin: 0, fontFamily: 'var(--font-montserrat)', fontSize: 22, letterSpacing: '-0.02em' }}>{originalData.fullName}</h2>
                                <div className="ad-row ad-wrap" style={{ gap: 8, marginTop: 8 }}>
                                    <span className="ad-badge brand"><Icon name="shield_person" className="ad-ico-xs" />{roleLabel}</span>
                                    <span className="ad-muted" style={{ fontSize: 13 }}>{originalData.email}</span>
                                </div>
                                <p className="ad-muted" style={{ margin: '10px 0 0', fontSize: 13 }}>Fotoğrafı değiştirmek için görsele dokunun (PNG veya JPG).</p>
                            </div>
                        </div>

                        <div className="ad-card-pad" style={{ display: 'grid', gap: 18 }}>
                            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
                                <div>
                                    <label className="ad-label" htmlFor="fullName">İsim soyisim</label>
                                    <input className="ad-input" style={{ minHeight: 46 }} id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} autoComplete="name" required />
                                </div>
                                <div>
                                    <label className="ad-label" htmlFor="email">E-posta adresi</label>
                                    <input className="ad-input" style={{ minHeight: 46 }} type="email" id="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" required />
                                </div>
                            </div>

                            <div>
                                <label className="ad-label" htmlFor="password">Yeni şifre</label>
                                <div className="ad-search">
                                    <Icon name="lock" />
                                    <input
                                        className="ad-input"
                                        style={{ minHeight: 46, paddingRight: 48 }}
                                        type={showPw ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                    />
                                    <button type="button" className="ad-ib clear" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}>
                                        <Icon name={showPw ? 'visibility_off' : 'visibility'} className="ad-ico-sm" />
                                    </button>
                                </div>
                                <p className="ad-muted" style={{ margin: '8px 2px 0', fontSize: 12.5 }}>Sadece şifrenizi güncellemek istiyorsanız doldurun. Kaydederken e-postanıza doğrulama kodu gönderilir.</p>
                            </div>
                        </div>

                        <div className="ad-tfoot" style={{ justifyContent: 'flex-end', padding: 14 }}>
                            {hasChanges && (
                                <span style={{ marginRight: 'auto', fontWeight: 600 }} className="ad-row">
                                    <span className="ad-badge warn"><span className="dot" />Kaydedilmemiş değişiklikler</span>
                                </span>
                            )}
                            <button disabled={!hasChanges} type="submit" className="ad-btn ad-btn-primary">
                                <Icon name="save" className="ad-ico-sm" />
                                {hasChanges ? 'Değişiklikleri kaydet' : 'Değişiklik yok'}
                            </button>
                        </div>
                    </form>
                )}

                <section className="ad-card ad-card-pad" aria-labelledby="appearance">
                    <div className="ad-row ad-wrap" style={{ justifyContent: 'space-between', gap: 14 }}>
                        <div>
                            <h2 id="appearance" style={{ margin: 0, fontFamily: 'var(--font-montserrat)', fontSize: 17, letterSpacing: '-0.01em' }}>Görünüm</h2>
                            <p className="ad-muted" style={{ margin: '4px 0 0', fontSize: 13.5 }}>Panel temasını bu cihaz için seçin.</p>
                        </div>
                        <Segmented
                            label="Tema"
                            value={theme}
                            onChange={setTheme}
                            options={[
                                { value: 'light', icon: 'light_mode', label: 'Açık' },
                                { value: 'dark', icon: 'dark_mode', label: 'Koyu' },
                            ]}
                        />
                    </div>
                </section>
            </div>

            <AdminVerificationModal
                isOpen={isVerificationModalOpen}
                onClose={() => setIsVerificationModalOpen(false)}
                onSuccess={handleUpdateSuccess}
                onSubmit={handleUpdateSubmit}
                email={originalData.email}
            />
        </>
    );
}
