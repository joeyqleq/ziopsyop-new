# v0 Boot Sequence Replacement Design

## Goal

Replace the current homepage bootloader with the exact boot animation supplied in
`/home/jq/Desktop/zio-psyop-boot-sequence.zip`. Preserve the archive's complete
approximately 48-second timeline and visual pacing.

## Integration boundary

Only the bootloader implementation is imported:

- Boot scene components from the archive's `components/boot` directory.
- Timeline and ASCII-art utilities from the archive's `lib/boot` directory.
- The `.zio-*` animation styles used by those components.

The archive's Next.js application shell, landing page, generic UI components,
configuration files, and unrelated package dependencies are excluded. Existing
project dependencies are reused where they already satisfy the bootloader.

## Application behavior

`BootGate` remains the application boundary. It shows the sequence only for a
fresh direct visit to `/`, records completion in browser storage, and then reveals
the existing application. Deep-link visits and later client-side navigation do not
replay the sequence. Reduced-motion behavior supplied by the archive is preserved.

The imported sequence calls the existing completion callback at the end of its
native timeline. No archive home-page content replaces the current site.

## Runtime error repair

The asynchronous pulse and beam loops in `AnimatedEye` receive explicit
cancellation. Cleanup marks each loop inactive and clears its pending timer.
Every `controls.start()` call is guarded after the wait, preventing animation
controls from running after the component has unmounted.

## Verification

- Type-check and production-build the Next.js application.
- Load `/` with boot storage cleared and confirm the complete sequence reaches the
  existing homepage.
- Confirm the browser console does not report animation-control lifecycle errors.
- Navigate among existing pages and confirm they render without replaying the boot.
- Reload within the same stored session and confirm the boot remains skipped.
- Inspect the final dependency and file diff to confirm no unrelated v0 modules or
  packages were imported.
