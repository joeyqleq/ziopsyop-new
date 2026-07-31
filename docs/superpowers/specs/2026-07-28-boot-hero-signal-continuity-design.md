# Bootloader + Hero Motion Polish — Signal Continuity

Date: 2026-07-28  
Status: approved for implementation

## Intent

The bootloader and homepage hero should feel like one continuous instrument
waking up, resolving a signal, and handing control to the reader. The current
experience has strong individual assets, but its motion is assembled from
several unrelated loops: randomized eyelid glyphs, independent glow pulses,
constant arc sweeps, a hard boot-to-page swap, and a generic hero fade-up.

The redesign keeps the supplied visual language and every narrative act while
giving the sequence one choreography:

1. **Wake** — the ASCII eye opens with asymmetric, biological timing.
2. **Acquire** — the reticle makes small saccades, then locks to evidence.
3. **Reconstruct** — Parts I, II, and III arrive as successive analysis modes.
4. **Converge** — the modes compress into one methodology and one conclusion.
5. **Identify** — `RATHBONE` remains fully legible for at least two seconds.
6. **Handoff** — the final boot eye becomes the homepage eye; the page is
   revealed through the same aperture instead of appearing after a hard cut.

The signature moment is the handoff. Supporting motion exists only to make that
moment feel inevitable.

## Motion character

Three words: **watchful, mechanical, predatory**.

- Watchful: irregular single and double blinks, short saccades, quiet holds.
- Mechanical: scan passes, reticle acquisition, deterministic phase timing.
- Predatory: stillness before movement; no cheerful bounce or elastic easing.

The system uses exponential deceleration for entrances and faster exits. It
avoids simultaneous perpetual loops. At most one foreground action and one
ambient action should command attention at any instant.

## Runtime and pacing

The imported sequence has an authored 53-second master clock. Preserve that
canonical cut while repairing its lifecycle and timing defects. Several scenes
currently combine master-clock phase changes with wall-clock CSS animations and
component-local timers; globally compressing the sequence before those scenes
consume normalized phase progress would make the visible cues drift apart.

| Act | Authored range | Purpose |
| --- | ---: | --- |
| Wake / notice | 0–10.5s | Eye opens, phrases resolve, field forms and breaks |
| Acquire | 10.5–13s | Establish the forensic system |
| Part I | 13–18s | Narrative network |
| Part II | 18–23.5s | Battlefield ledger |
| Part III | 23.5–29s | Media frame comparison |
| Converge | 29–34s | Three views become one apparatus |
| Signal | 34–37.5s | Classification resolves |
| Flag / shatter | 37.5–42.5s | Closing transformation |
| Rathbone creed | 42.5–47.5s | Wordmark is stable for at least 2.2 seconds |
| CRT / cedar / handoff | 47.5–53s | Power-down resolves into the live homepage |

The first-load skip control becomes visible by roughly 1.2 seconds and has a
proper 44px touch target, so the theatrical cut remains deliberate rather than
coercive. A shorter cut can be added later as a separately authored timeline
after each scene accepts normalized phase progress; it must not be simulated by
blindly scaling the master clock.

## Hero eye behavior

Replace independent `setInterval`/`controls.start()` loops with one mounted
motion controller:

- two curved SVG eyelids clipped to the actual eye aperture; no rectangular
  HTML shutters and no free-floating ASCII panels;
- an explicit blink state machine: close 90–120ms, hold 35–55ms, open 170–220ms;
- occasional double blink with a short 110–160ms inter-blink hold;
- idle saccades every 2.8–6.5 seconds, with pointer influence blended rather
  than switching the eye into a separate hover mode;
- one restrained scan/acquisition event every 7–12 seconds;
- breathing is expressed mostly through luminance and a 1–2% scale shift;
- all SVG definition IDs are instance-unique so the navigation and hero eyes
  cannot collide;
- `prefers-reduced-motion` displays a stable open eye with direct pointer
  response disabled and no infinite scan loops.

The hero entrance is not a generic stack of fade-ups. The eye resolves first,
its scan beam exposes the wordmark, then the thesis and gateway controls become
available in a short, readable cascade.

## Boot-to-page handoff

`BootGate` mounts the homepage beneath the final boot overlay so the last eye
and first hero frame can spatially align. During the handoff:

- the boot overlay opens a centered eye-shaped/radial aperture;
- the live hero eye is already in its locked, open pose;
- the boot eye fades while the hero eye sharpens, without a scale jump;
- page interaction remains disabled only until the aperture clears;
- completion is persisted exactly once, and deep links continue to bypass boot.

The hero receives a short-lived handoff state through the existing boot context
or an extended stage value. Returning sessions skip straight to the settled
hero without replaying the entrance theater.

## Responsive composition

Desktop keeps the wide forensic console. Portrait layouts are deliberately
re-authored rather than shrunk:

- the eye stays centered in the middle third of the viewport;
- left/right panels become top/bottom evidence bands;
- scene labels use safe-area-aware insets;
- text scales with `clamp()` and is capped to avoid long-word overflow;
- the boot rail becomes a compact vertical or wrapped progress index;
- mobile canvases use a lower cell density and device-pixel-ratio cap;
- no content may depend on landscape proportions or extend beyond `100svh`.

Target checks: 390×844, 412×915, 768×1024, 1440×900.

## Performance and accessibility

- Maintain 60fps on desktop and a practical 45–60fps mobile budget.
- Bound blur/glow to the eye area and avoid full-screen animated filters.
- Prefer transforms, opacity, masks, and canvas drawing over layout animation.
- Pause clocks while the page is hidden and cancel every timer/RAF on unmount.
- Preserve keyboard skip and a visible skip affordance.
- Reduced-motion users receive a static synopsis with an immediate Enter action.
- Decorative layers remain hidden from assistive technology; the narrative
  synopsis remains available as real text.

## Acceptance criteria

- No `controls.start() should only be called after a component has mounted`
  errors during navigation, Strict Mode remounts, or boot completion.
- `RATHBONE` is continuously legible for at least two seconds.
- The boot-to-hero transition has no black flash, layout jump, or mismatched eye
  position at the target viewports.
- The mobile composition reads as intentional portrait choreography.
- Reduced motion contains no looping eye, scan, ticker, or CRT animation.
- Existing deep-link bypass and one-time boot persistence continue to work.
