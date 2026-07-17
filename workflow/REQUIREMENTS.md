# STU-10: Add vendor onboarding wizard on first login

## Problem

When a user logs in for the first time, the app has no way to know what role they play (vendor, venue, or both) and doesn't collect the relevant profile information. Without this, the app can't tailor the experience or show appropriate features.

## Desired Outcome

A multi-step onboarding wizard appears the first time a user logs in. It should:

1. **Role selection** — Ask the user whether they are a vendor, a venue, or both
2. **Profile setup** — Based on their selection, prompt them to fill out the relevant information (e.g. business name, services offered, location, contact details)
3. Be skippable at any point, but re-accessible later from a help or settings menu

## Scope

**In scope:**
- Onboarding wizard UI (multi-step modal/overlay)
- Role selection step (vendor / venue / both)
- Conditional profile setup forms based on selected role(s)
- First-login detection (backend `has_seen_onboarding` flag on user record)
- Skip/dismiss functionality with re-access from help or settings
- Backend endpoint to save role and profile data, mark onboarding as complete

**Out of scope:**
- Feature-specific setup flows beyond profile (e.g. creating a first event, inviting team members)
- Analytics/tracking of onboarding completion

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-10/add-vendor-onboarding-wizard-on-first-login
