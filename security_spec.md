# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Global Deny Catch-All**: All paths not explicitly matched are denied by default (`allow read, write: if false;`).
2. **PlayerProfile Invariant**: A `PlayerProfile` at `/profiles/{profileId}` can only be created or updated by its authenticated owner (`ownerUid == request.auth.uid` and `profileId == request.auth.uid`) or a verified Admin (`carmenmena1204@gmail.com`). Users cannot self-assign `isDev: true` unless they are an Admin.
3. **UserReport Invariant**: A `UserReport` at `/reports/{reportId}` must have `reporterUid == request.auth.uid` and initial `status == 'pending'`. Once `status` reaches a terminal state (`'resolved'` or `'dismissed'`), non-admin users cannot modify it. Only Admins can transition `status` or edit `devNotes`.
4. **DevRecord Invariant**: Only Admins can create, update, or delete records in `/devs/{devId}`.
5. **Temporal & Structural Integrity**: All string fields have explicit `.size()` bounds matching `firebase-blueprint.json`. `createdAt` is immutable on update and must equal `request.time` on create; `updatedAt` must equal `request.time` on create and update.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: Creating `/profiles/user1` with `auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Creating `/profiles/user1` with `email_verified == false` -> `PERMISSION_DENIED`.
3. **Identity Spoofing on Profile**: Creating `/profiles/user1` where `ownerUid == 'victimUid'` != `request.auth.uid` -> `PERMISSION_DENIED`.
4. **Privilege Escalation (Self-Assigning `isDev`)**: Non-admin creating or updating `/profiles/user1` with `isDev: true` -> `PERMISSION_DENIED`.
5. **Shadow Field Injection**: Sending extra field `isAdmin: true` to `/profiles/user1` -> Rejected by `.keys().hasOnly(...)`.
6. **ID Poisoning**: Creating document with 500-char ID or invalid characters -> Rejected by `isValidId()`.
7. **Oversized String ("Denial of Wallet")**: Creating `/reports/rep1` with `details` > 2000 chars -> `PERMISSION_DENIED`.
8. **Immutable Field Mutation**: Updating `createdAt` or `ownerUid` on `/profiles/user1` -> `PERMISSION_DENIED`.
9. **Forged Client Timestamp**: Creating `/reports/rep1` with `createdAt != request.time` -> `PERMISSION_DENIED`.
10. **Report Terminal State Bypass**: Updating a report whose existing `status` is `'resolved'` as a non-admin -> `PERMISSION_DENIED`.
11. **Unauthorized Report Triage**: Non-admin attempting to update `status` to `'resolved'` or `devNotes` on `/reports/rep1` -> `PERMISSION_DENIED`.
12. **Blanket List Scraping**: Listing `/reports` as a non-owner without filtering by `resource.data.reporterUid == request.auth.uid` -> `PERMISSION_DENIED`.
