"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const MONTHS_TR = [
    'OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN',
    'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'
];

// "dd.mm.yyyy" -> Date
function parseDate(str) {
    const [d, m, y] = str.split('.').map(Number);
    return new Date(y, m - 1, d);
}

function buildCircuitPath(count, height) {
    if (count === 0 || height === 0) return '';
    const segH = height / count;
    let d = `M50,0 `;
    for (let i = 0; i < count; i++) {
        const sideX = i % 2 === 0 ? 78 : 22;
        const yMid = segH * i + segH * 0.5;
        const yEnd = segH * (i + 1);
        d += `C50,${yMid - segH * 0.28} ${sideX},${yMid - segH * 0.12} ${sideX},${yMid} `;
        d += `C${sideX},${yMid + segH * 0.12} 50,${yEnd - segH * 0.28} 50,${yEnd} `;
    }
    return d;
}

export default function EventsPage() {
    const pathRef = useRef(null);
    const containerRef = useRef(null);
    const nodesRef = useRef([]);

    const [containerHeight, setContainerHeight] = useState(0);
    const [pathLength, setPathLength] = useState(0);

    const eventsData = [
        {
            id: 1,
            date: "15.08.2026",
            tag: "Gelecek",
            title: "Yapay Zeka ve Gelecek Zirvesi",
            details: "Osman Turan Kongre Merkezi • 13:00",
            buttonText: "Detayları Keşfet",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVSF6J4QZR71CEcAh_Spl3O05HeUOdiSwa_YxlSwuz8PJXmZXSY_5ICuMlpV5QmkjK35FQqgoPzBj-AEAqeb0SuJi-s_W3cQEXBGH9DqlEEGOv1ox8dFbm7Zwhdii4XX4ThY3BDWJenr-YEhdrktdCFx4RpjyLNjBfmLRni8yS7BMrcI9F0ZaWzvH_vdqUTnf0x7W8EeFu5-vB89siihKaOHXWNwlcSjJ4rf6Bom5adXKkVruheCqlGFxtHAXByAzqLTR69A3BK4_F"
        },
        {
            id: 2,
            date: "22.08.2026",
            tag: "Atölye",
            title: "Gömülü Sistemler 101 Atölyesi",
            details: "Bilgisayar Müh. Donanım Lab • 15:30",
            buttonText: "Hemen Kaydol",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD80wZ_6Iwy7e24q_-FQub4djhNVyR5DIFY20FRFl3lirqMdaWoa1NAzsnqqZaeALi60hAnQ5hNrnezJ-wWuGuJzch2RcW-qewGm-x-cqODYE_BtCOfz4V4SyENb7CzyMF3_ZkPB-2hGn1EyTpqYyZpKxyPeAcZFJ3oM7KZeUVZ5yg2D4qBfPZFvznv-1p738mbY6cskGVCKu57xLg-2mX7lULXh17HRoqOOClqlR6CNUZtE3pAOpthdJIx50SgV4QJGMNxxz8Hbb3v"
        },
        {
            id: 3,
            date: "10.09.2026",
            tag: "Etkinlik",
            title: "Robotik Kulübü Tanışma Günü",
            details: "Mühendislik Fakültesi Fuaye • 14:00",
            buttonText: "Detayları Keşfet",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVSF6J4QZR71CEcAh_Spl3O05HeUOdiSwa_YxlSwuz8PJXmZXSY_5ICuMlpV5QmkjK35FQqgoPzBj-AEAqeb0SuJi-s_W3cQEXBGH9DqlEEGOv1ox8dFbm7Zwhdii4XX4ThY3BDWJenr-YEhdrktdCFx4RpjyLNjBfmLRni8yS7BMrcI9F0ZaWzvH_vdqUTnf0x7W8EeFu5-vB89siihKaOHXWNwlcSjJ4rf6Bom5adXKkVruheCqlGFxtHAXByAzqLTR69A3BK4_F"
        },
        {
            id: 4,
            date: "05.10.2026",
            tag: "Workshop",
            title: "Devre Tasarımı ve PCB Atölyesi",
            details: "Elektronik Lab • 16:00",
            buttonText: "Hemen Kaydol",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD80wZ_6Iwy7e24q_-FQub4djhNVyR5DIFY20FRFl3lirqMdaWoa1NAzsnqqZaeALi60hAnQ5hNrnezJ-wWuGuJzch2RcW-qewGm-x-cqODYE_BtCOfz4V4SyENb7CzyMF3_ZkPB-2hGn1EyTpqYyZpKxyPeAcZFJ3oM7KZeUVZ5yg2D4qBfPZFvznv-1p738mbY6cskGVCKu57xLg-2mX7lULXh17HRoqOOClqlR6CNUZtE3pAOpthdJIx50SgV4QJGMNxxz8Hbb3v"
        },
        {
            id: 5,
            date: "18.10.2026",
            tag: "Gelecek",
            title: "Modern Web Mimarileri: Next.js ve Mikroservisler",
            details: "Çevrimçi (Online) • 20:00",
            buttonText: "Yerini Ayirt",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVSF6J4QZR71CEcAh_Spl3O05HeUOdiSwa_YxlSwuz8PJXmZXSY_5ICuMlpV5QmkjK35FQqgoPzBj-AEAqeb0SuJi-s_W3cQEXBGH9DqlEEGOv1ox8dFbm7Zwhdii4XX4ThY3BDWJenr-YEhdrktdCFx4RpjyLNjBfmLRni8yS7BMrcI9F0ZaWzvH_vdqUTnf0x7W8EeFu5-vB89siihKaOHXWNwlcSjJ4rf6Bom5adXKkVruheCqlGFxtHAXByAzqLTR69A3BK4_F"
        },
        {
            id: 6,
            date: "02.11.2026",
            tag: "Atölye",
            title: "Siber Güvenliğe Giriş ve CTF Kampı",
            details: "Bilgisayar Müh. Lab 2 • 14:00",
            buttonText: "Hemen Kaydol",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD80wZ_6Iwy7e24q_-FQub4djhNVyR5DIFY20FRFl3lirqMdaWoa1NAzsnqqZaeALi60hAnQ5hNrnezJ-wWuGuJzch2RcW-qewGm-x-cqODYE_BtCOfz4V4SyENb7CzyMF3_ZkPB-2hGn1EyTpqYyZpKxyPeAcZFJ3oM7KZeUVZ5yg2D4qBfPZFvznv-1p738mbY6cskGVCKu57xLg-2mX7lULXh17HRoqOOClqlR6CNUZtE3pAOpthdJIx50SgV4QJGMNxxz8Hbb3v"
        },
        {
            id: 7,
            date: "20.11.2026",
            tag: "Etkinlik",
            title: "Mezun Sektör Buluşmaları: Full-Stack Kariyeri",
            details: "Prof. Dr. Osman Turan KM • 15:00",
            buttonText: "Detayları Keşfet",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVSF6J4QZR71CEcAh_Spl3O05HeUOdiSwa_YxlSwuz8PJXmZXSY_5ICuMlpV5QmkjK35FQqgoPzBj-AEAqeb0SuJi-s_W3cQEXBGH9DqlEEGOv1ox8dFbm7Zwhdii4XX4ThY3BDWJenr-YEhdrktdCFx4RpjyLNjBfmLRni8yS7BMrcI9F0ZaWzvH_vdqUTnf0x7W8EeFu5-vB89siihKaOHXWNwlcSjJ4rf6Bom5adXKkVruheCqlGFxtHAXByAzqLTR69A3BK4_F"
        },
        {
            id: 8,
            date: "05.12.2026",
            tag: "Workshop",
            title: "Veri Bilimi ve Python ile Analiz Atölyesi",
            details: "Mühendislik Fakültesi Bilgisayar Lab • 13:00",
            buttonText: "Hemen Kaydol",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD80wZ_6Iwy7e24q_-FQub4djhNVyR5DIFY20FRFl3lirqMdaWoa1NAzsnqqZaeALi60hAnQ5hNrnezJ-wWuGuJzch2RcW-qewGm-x-cqODYE_BtCOfz4V4SyENb7CzyMF3_ZkPB-2hGn1EyTpqYyZpKxyPeAcZFJ3oM7KZeUVZ5yg2D4qBfPZFvznv-1p738mbY6cskGVCKu57xLg-2mX7lULXh17HRoqOOClqlR6CNUZtE3pAOpthdJIx50SgV4QJGMNxxz8Hbb3v"
        },
        {
            id: 9,
            date: "18.12.2026",
            tag: "Gelecek",
            title: "Oyun Geliştirme Dünyası ve Unreal Engine",
            details: "Kültür Merkezi Salon B • 16:00",
            buttonText: "Detayları Keşfet",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVSF6J4QZR71CEcAh_Spl3O05HeUOdiSwa_YxlSwuz8PJXmZXSY_5ICuMlpV5QmkjK35FQqgoPzBj-AEAqeb0SuJi-s_W3cQEXBGH9DqlEEGOv1ox8dFbm7Zwhdii4XX4ThY3BDWJenr-YEhdrktdCFx4RpjyLNjBfmLRni8yS7BMrcI9F0ZaWzvH_vdqUTnf0x7W8EeFu5-vB89siihKaOHXWNwlcSjJ4rf6Bom5adXKkVruheCqlGFxtHAXByAzqLTR69A3BK4_F"
        },
        {
            id: 10,
            date: "10.01.2027",
            tag: "Atölye",
            title: "Mobil Uygulama Geliştirme: React Native",
            details: "Yazılım Mühendisliği Lab • 14:00",
            buttonText: "Hemen Kaydol",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD80wZ_6Iwy7e24q_-FQub4djhNVyR5DIFY20FRFl3lirqMdaWoa1NAzsnqqZaeALi60hAnQ5hNrnezJ-wWuGuJzch2RcW-qewGm-x-cqODYE_BtCOfz4V4SyENb7CzyMF3_ZkPB-2hGn1EyTpqYyZpKxyPeAcZFJ3oM7KZeUVZ5yg2D4qBfPZFvznv-1p738mbY6cskGVCKu57xLg-2mX7lULXh17HRoqOOClqlR6CNUZtE3pAOpthdJIx50SgV4QJGMNxxz8Hbb3v"
        },
        {
            id: 11,
            date: "25.01.2027",
            tag: "Etkinlik",
            title: "Yazılım Test Mühendisliği ve QA Buluşması",
            details: "Çevrimçi (Online) • 19:30",
            buttonText: "Detayları Keşfet",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVSF6J4QZR71CEcAh_Spl3O05HeUOdiSwa_YxlSwuz8PJXmZXSY_5ICuMlpV5QmkjK35FQqgoPzBj-AEAqeb0SuJi-s_W3cQEXBGH9DqlEEGOv1ox8dFbm7Zwhdii4XX4ThY3BDWJenr-YEhdrktdCFx4RpjyLNjBfmLRni8yS7BMrcI9F0ZaWzvH_vdqUTnf0x7W8EeFu5-vB89siihKaOHXWNwlcSjJ4rf6Bom5adXKkVruheCqlGFxtHAXByAzqLTR69A3BK4_F"
        },
        {
            id: 12,
            date: "14.02.2027",
            tag: "Workshop",
            title: "Git ve GitHub ile Versiyon Kontrol Sistemi",
            details: "Bilgisayar Müh. Lab 1 • 13:30",
            buttonText: "Hemen Kaydol",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD80wZ_6Iwy7e24q_-FQub4djhNVyR5DIFY20FRFl3lirqMdaWoa1NAzsnqqZaeALi60hAnQ5hNrnezJ-wWuGuJzch2RcW-qewGm-x-cqODYE_BtCOfz4V4SyENb7CzyMF3_ZkPB-2hGn1EyTpqYyZpKxyPeAcZFJ3oM7KZeUVZ5yg2D4qBfPZFvznv-1p738mbY6cskGVCKu57xLg-2mX7lULXh17HRoqOOClqlR6CNUZtE3pAOpthdJIx50SgV4QJGMNxxz8Hbb3v"
        },
        {
            id: 13,
            date: "01.03.2027",
            tag: "Gelecek",
            title: "Bulut Bilişim ve DevOps Dünyasına Giriş",
            details: "Mühendislik Fakültesi Konferans Salonu • 15:00",
            buttonText: "Detayları Keşfet",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVSF6J4QZR71CEcAh_Spl3O05HeUOdiSwa_YxlSwuz8PJXmZXSY_5ICuMlpV5QmkjK35FQqgoPzBj-AEAqeb0SuJi-s_W3cQEXBGH9DqlEEGOv1ox8dFbm7Zwhdii4XX4ThY3BDWJenr-YEhdrktdCFx4RpjyLNjBfmLRni8yS7BMrcI9F0ZaWzvH_vdqUTnf0x7W8EeFu5-vB89siihKaOHXWNwlcSjJ4rf6Bom5adXKkVruheCqlGFxtHAXByAzqLTR69A3BK4_F"
        },
        {
            id: 14,
            date: "15.03.2027",
            tag: "Atölye",
            title: "Blokzincir ve Akıllı Sözleşmeler Atölyesi",
            details: "Yazılım Lab 2 • 14:00",
            buttonText: "Hemen Kaydol",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD80wZ_6Iwy7e24q_-FQub4djhNVyR5DIFY20FRFl3lirqMdaWoa1NAzsnqqZaeALi60hAnQ5hNrnezJ-wWuGuJzch2RcW-qewGm-x-cqODYE_BtCOfz4V4SyENb7CzyMF3_ZkPB-2hGn1EyTpqYyZpKxyPeAcZFJ3oM7KZeUVZ5yg2D4qBfPZFvznv-1p738mbY6cskGVCKu57xLg-2mX7lULXh17HRoqOOClqlR6CNUZtE3pAOpthdJIx50SgV4QJGMNxxz8Hbb3v"
        },
        {
            id: 15,
            date: "30.03.2027",
            tag: "Etkinlik",
            title: "Bahar Hackathonu 2027 Başlangıcı",
            details: "Kampüs Fuaye Alanı • 09:00",
            buttonText: "Detayları Keşfet",
            buttonIcon: "arrow_forward",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVSF6J4QZR71CEcAh_Spl3O05HeUOdiSwa_YxlSwuz8PJXmZXSY_5ICuMlpV5QmkjK35FQqgoPzBj-AEAqeb0SuJi-s_W3cQEXBGH9DqlEEGOv1ox8dFbm7Zwhdii4XX4ThY3BDWJenr-YEhdrktdCFx4RpjyLNjBfmLRni8yS7BMrcI9F0ZaWzvH_vdqUTnf0x7W8EeFu5-vB89siihKaOHXWNwlcSjJ4rf6Bom5adXKkVruheCqlGFxtHAXByAzqLTR69A3BK4_F"
        },
        {
            id: 16,
            date: "15.04.2026",
            tag: "Arşiv",
            title: "Bahar Dönemi Açılış ve Tanışma Kokteyli",
            details: "Sosyal Tesisler • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 17,
            date: "28.02.2026",
            tag: "Arşiv",
            title: ".NET Core ile Kurumsal Mimariler Eğitimi",
            details: "Bilgisayar Lab 1 • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 18,
            date: "10.01.2026",
            tag: "Arşiv",
            title: "Kış Kodlama Kampı ve Proje Geliştirme",
            details: "Donanım Lab • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 19,
            date: "15.12.2025",
            tag: "Arşiv",
            title: "Yapay Zeka Etik Kurultayı",
            details: "Osman Turan Kongre Merkezi • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 20,
            date: "20.11.2025",
            tag: "Arşiv",
            title: "Arduino ile Temel Robotik Atölyesi",
            details: "Elektronik Lab • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 21,
            date: "05.11.2025",
            tag: "Arşiv",
            title: "Siber Güvenlikte Temel Kavramlar",
            details: "Bilgisayar Müh. Amfisi • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 22,
            date: "18.10.2025",
            tag: "Arşiv",
            title: "Açık Kaynak Kodlu Yazılım Geliştirme",
            details: "Yazılım Lab 1 • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 23,
            date: "01.10.2025",
            tag: "Arşiv",
            title: "Güz Dönemi Kulüp Tanıtım Günleri",
            details: "Merkez Yemekhane Önü • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 24,
            date: "15.05.2025",
            tag: "Arşiv",
            title: "Yazılım Sektöründe Staj ve Kariyer Paneli",
            details: "Mimarlık Amfisi • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 25,
            date: "25.04.2025",
            tag: "Arşiv",
            title: "Veritabanı Yönetimi ve SQL Optimizasyonu",
            details: "Bilgisayar Müh. Lab 2 • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 26,
            date: "10.04.2025",
            tag: "Arşiv",
            title: "UI/UX Tasarım İlkeleri ve Figma Atölyesi",
            details: "Tasarım Lab • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 27,
            date: "20.03.2025",
            tag: "Arşiv",
            title: "Python ile Otomasyon Scriptleri Yazma",
            details: "Bilgisayar Lab 1 • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 28,
            date: "05.03.2025",
            tag: "Arşiv",
            title: "Docker ve Konteyner Teknolojileri Paneli",
            details: "Mühendislik Fakültesi Salon B • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFrjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 29,
            date: "14.02.2025",
            tag: "Arşiv",
            title: "Algoritma Günleri ve Problem Çözme Kampı",
            details: "Bilgisayar Müh. Lab 2 • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        },
        {
            id: 30,
            date: "15.01.2025",
            tag: "Arşiv",
            title: "Yılın İlk Teknik Çalıştayı ve Proje Sunumları",
            details: "Osman Turan Kongre Merkezi • Gerçekleşti",
            buttonText: null,
            buttonIcon: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAaEzzY73nrb58f1Zs0fO3gvNe5UcR1IdexvvY9QArPIXXLmZ_UajkoVEy7hD4jkTNwgzOo9kXja6Y9XPmPwPqyMXiQyxatfzL0FvxyvrDUiyt8VD18f3V596f-TM4q7eP5c0_2I8hcfEwLqUXdsrd9joQVW476AtUYo5hsFRjN0GR5uxbszGIxdXPN7Ldykyv54HkZ0fKUmZ7T8e4cv2kM1ouxjo9VI2ht5jVkDKi84_caMqeV1sPsjxGiNXkllgd27PbmKeBU6c"
        }
    ];

    const today = new Date();
    const events = [...eventsData]
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
        .map((event, index) => {
            const dateObj = parseDate(event.date);
            return {
                ...event,
                dateObj,
                displayDate: `${dateObj.getDate()} ${MONTHS_TR[dateObj.getMonth()]} ${dateObj.getFullYear()}`,
                align: index % 2 === 0 ? 'right' : 'left',
                status: dateObj < today ? 'past' : 'active',
            };
        });

    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                setContainerHeight(containerRef.current.offsetHeight);
            }
        };
        measure();

        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            resizeObserver = new ResizeObserver(measure);
            resizeObserver.observe(containerRef.current);
        }
        window.addEventListener('resize', measure);

        return () => {
            window.removeEventListener('resize', measure);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [events.length]);

    useEffect(() => {
        if (pathRef.current) {
            const length = pathRef.current.getTotalLength();
            setPathLength(length);
            pathRef.current.style.strokeDasharray = length;
            pathRef.current.style.strokeDashoffset = length;
        }
    }, [containerHeight, events.length]);

    useEffect(() => {
        const updateTimeline = () => {
            if (pathRef.current && containerRef.current && pathLength > 0) {
                const rect = containerRef.current.getBoundingClientRect();
                const total = rect.height - window.innerHeight;
                let percent = total > 0 ? (-rect.top) / total : 1;
                percent = Math.max(0, Math.min(1, percent));

                pathRef.current.style.strokeDashoffset = pathLength * (1 - percent);
            }

            nodesRef.current.forEach(node => {
                if (node) {
                    const rect = node.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.8) {
                        node.classList.add('active');
                    }
                }
            });
        };

        window.addEventListener('scroll', updateTimeline, { passive: true });
        const t = setTimeout(updateTimeline, 100);

        return () => {
            window.removeEventListener('scroll', updateTimeline);
            clearTimeout(t);
        };
    }, [pathLength]);

    const pathD = buildCircuitPath(events.length, containerHeight);

    return (
        <main className="pt-40 pb-7 overflow-x-hidden px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
            {/* Title Section */}
            <section className="mb-32 text-center relative z-10">
                <nav className="flex items-center justify-center flex-wrap gap-1.5 md:gap-2 text-on-surface-variant/60 font-label-md text-xs md:text-label-md mb-3 md:mb-4 uppercase tracking-widest">
                        <Link href="/" className="hover:text-primary transition-colors">
                            Ana Sayfa
                        </Link>
                        <span className="material-symbols-outlined text-[12px] md:text-[14px] shrink-0">
                            chevron_right
                        </span>
                        <span className="text-primary font-bold">
                            Etkinlikler
                        </span>
                    </nav>
                <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-6">
                    Etkinlik Akışı
                </h1>
                <p className="font-size-10 font-body-lg md:text-body-lg  text-on-surface-variant max-w-2xl mx-auto">
                    Topluluğumuzun yolculuğuna eşlik edin. Geçmişin tecrübesiyle geleceği kodluyoruz.
                </p>
            </section>

            {/* Timeline Container */}
            <div ref={containerRef} className="relative overflow-x-hidden w-full min-h-[1500px]">
                <svg
                    id="timeline-svg"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0"
                    preserveAspectRatio="none"
                    viewBox={`0 0 100 ${containerHeight || 1}`}
                >
                    <path
                        ref={pathRef}
                        id="circuit-path"
                        className="fill-none stroke-primary stroke-[2px] opacity-30"
                        d={pathD}
                    />
                </svg>

                {/* Mapping Timeline Nodes */}
                {events.map((event, index) => (
                    <div
                        key={event.id}
                        className={`relative flex flex-col md:flex-row items-center justify-between mb-48 group ${event.align === 'right' ? 'md:flex-row-reverse' : ''} ${event.status === 'past' ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}`}
                        style={{ marginTop: index === 0 ? '100px' : '0' }}
                    >
                        <div className="hidden md:block w-1/2"></div>

                        {/* Center Dot */}
                        <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-10 ${event.status === 'past' ? 'bg-outline' : 'bg-primary shadow-[0_0_15px_rgba(158,0,0,0.5)]'}`}></div>

                        {/* Content Block */}
                        <div
                            ref={el => nodesRef.current[index] = el}
                            className={`node-content w-full md:w-[45%] flex items-center gap-8 ${event.align === 'right' ? 'reveal-right' : 'reveal-left flex-row-reverse'}`}
                        >
                            {/* Date Column (Vertical Text) */}
                            <div className={`vertical-text font-display-lg opacity-50 select-none ${event.status === 'past' ? 'text-secondary' : 'text-primary'}`}>
                                {event.displayDate}
                            </div>

                            {/* Glass Card */}
                            <div className={`glass-panel p-10 flex-1 relative overflow-hidden ${event.align === 'right' ? 'shape-blob-1' : 'shape-blob-2'} ${event.status === 'past' ? 'grayscale' : ''}`}>

                                {/* Diagonal Image Mask */}
                                <div className={`absolute ${event.align === 'right' ? '-right-20 -top-10' : '-left-20 -bottom-10'} w-64 h-64 md:w-72 md:h-72 opacity-30 diagonal-mask z-0`}>
                                    <img className="w-full h-full object-cover" src={event.image} alt={event.title} />
                                </div>

                                {/* Card Text Content */}
                                <div className={`relative z-10 ${event.align === 'left' ? 'text-right' : ''}`}>
                                    <span className={`${event.tag === 'Arşiv' ? 'bg-surface-variant text-on-surface-variant' : (event.tag === 'Atölye' || event.tag === 'Workshop' ? 'bg-primary-container text-white' : 'bg-primary text-white')} text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter mb-4 inline-block`}>
                                        {event.tag}
                                    </span>
                                    <h2 className={`font-headline-md mb-4 ${event.status === 'past' ? 'text-secondary' : 'text-on-surface'}`}>
                                        {event.title}
                                    </h2>
                                    <p className={`font-body-md mb-6 ${event.status === 'past' ? 'text-on-surface-variant opacity-60' : 'text-on-surface-variant'}`}>
                                        {event.details}
                                    </p>

                                    {event.buttonText && (
                                        <button className={`text-primary font-label-md flex items-center gap-2 group-hover:gap-4 transition-all ${event.align === 'left' ? 'flex-row-reverse ml-auto' : ''}`}>
                                            {event.buttonText} <span className="material-symbols-outlined text-sm">{event.buttonIcon}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}