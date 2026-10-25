# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- University students (mostly KTÜ, computer engineering and neighbouring departments) deciding whether to come and buying a ticket, almost always on a phone (~90% of traffic), often arriving from an Instagram or WhatsApp link.
- Software professionals and speakers checking who else is on stage and whether the event is serious.
- Potential sponsors and partners judging the organisation's credibility before getting in touch.

## Product Purpose

CODEWAVE is the annual software summit organised by KTÜCEC (Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü). It brings working engineers from industry on stage in front of students in Trabzon. The 2026 site exists to make the event credible at first glance, tell people when and where it is and who is speaking, and turn visitors into ticket holders. Success is a paid ticket bought from a phone without friction.

## Positioning

A student-run summit at KTÜ that puts senior industry engineers (Microsoft MVP, Havelsan, Pegasus, Trendyol, Hepapi) in one hall in Trabzon for one day. It is the club's own event, in its second edition, not a franchise of a global brand.

## Operating Context

- Event: CODEWAVE 2026, 8 December 2026, 10:00 (Türkiye, UTC+03:00), KTÜ Prof. Dr. Osman Turan Kültür ve Kongre Merkezi, Trabzon.
- Tickets are paid, roughly ₺100; the price is not final and lives in one config value.
- Payment goes through Shopier (redirect to Shopier's own payment page). The Shopier account does not exist yet; integration ships switched off until credentials are set.
- Site is bilingual TR/EN; Turkish is the default.
- Separate Next.js app (`codewave/`), deployed at codewave.ktucec.com, independent from the main ktucec.com site. `/` is 2026, `/2025` is the previous edition and must keep working unchanged.

## Capabilities and Constraints

- Countdown to the event start; after the start it must switch to a "started/finished" state, never negative.
- Ticket purchase: short form on-site, then redirect to Shopier. No fake success: a ticket is confirmed only by a verified Shopier callback.
- Speakers: five confirmed, a sixth not yet confirmed. Photos come later; slots are 1:1 and must accept real photos without layout changes.
- Undecided: programme/session titles and times, sponsors for 2026, KVKK privacy notice text.

## Brand Commitments

- Theme colours for 2026: blue `#2e7ebe` and green `#88df8a`. They are the identity; 2025's purple language must not return.
- Name is written CODEWAVE. Organiser is KTÜCEC.

## Evidence on Hand

- Confirmed 2026 speakers (name, company, title): Taner Saydam (Microsoft MVP), Barış Atak (Havelsan, Senior Software Engineer), Güvenç Eraslan (Pegasus Airlines, Expert Data Engineer), Emre Savcı (Trendyol Group, Tech Lead), Akın Özer (Hepapi, DevOps Manager).
- Contacts: ktucec@ceng.ktu.edu.tr; sponsorship +90 (543) 665 72 10 and turkalinehir@gmail.com (from the holding page). Socials: instagram.com/ktucec, linkedin.com/company/ktucec, twitter.com/ktucec.
- 2025 edition lives at /2025 with its own photos; the 2026 page links to it with a single plain button and does not reuse its statistics.
- Absent and not to be invented: speaker photos, bios and talk titles, programme, 2026 sponsors, attendance figures, testimonials.

## Product Principles

1. Date, place and the ticket action are never more than one glance away, especially on a phone.
2. Only real facts: anything not confirmed is shown as pending, never filled with plausible fiction.
3. The ticket flow asks only what the purchase needs and never claims success it cannot verify.
4. CODEWAVE 2026 stands on its own identity; 2025 is a link, not a template.

## Accessibility & Inclusion

WCAG 2.2 AA contrast and keyboard access, visible focus, reduced-motion support, touch targets ≥44px, usable at 320px width, Turkish characters rendered correctly in every face.
