# Air Violin — Sound Sculptor (v2)

A browser instrument with two playing modes and shared additive synthesis controls.

## Camera instrument
Start camera & sound and grant camera permission. Keep your physical left hand in the left side of the mirrored view and your right hand on the right. Use Swap hand zones if needed.

- Point the right index with other fingers tucked to sustain the selected note. Relax the index or remove the hand to release, allowing 180 ms for brief tracking dropouts. Right-hand palm height shapes timbre: top (camera y ≤ 0.2) is soft/fingerboard-like, bottom (y ≥ 0.8) is bright/bridge-like. Between those positions the fundamental and seven overtones are blended continuously with 180 ms exponential smoothing. The left-hand fundamental stays fixed unless fingering, string, or the separate octave-harmonic control changes.
- Left fist is an open string; 1–4 raised fingers choose ascending natural notes. A string remains A4 B4 C5 D5 E5.
- Hold left thumb up/down for 500 ms to change one string in G D A E order. Return to fingering before the next switch. If the left hand disappears, the last pitch remains selected.
- Rounded O-mouth or Harmonic touch shifts the note one octave higher and softens upper partials.
- Hold the preview button (or Space while outside controls) to audition without a camera.

## Play the strings
Choose one of 13 chromatic positions across the first octave on each string. The interactive strings open by default. Click the same circle once for a normal note, again for its harmonic, and a third time to release. Selecting a new position on the same string replaces it. Different strings play together, up to four voices. Circle distances follow equal-tempered stopped-string length, not equal spacing.

Each string has an independent normal/harmonic state, so chords can mix both. Harmonic circles are translucent. The side button can make all selected strings harmonic or normal. This is an octave/timbre approximation; circles represent stopped-pitch positions rather than acoustic harmonic nodes.

## Timbre
In live camera mode, bow height drives the mixer automatically; its bars and percentages show the effective mixture. Stop the camera to edit the saved presets and sliders manually. This is an additive-synthesis analogy to bow contact position, not a physical simulation of bow/string friction.

Pure, Warm strings, Hollow and Electric choose different amplitude mixtures. Expand Customize the harmonic mixture to set the fundamental and seven upper harmonics. The harmonic mixer changes tone colour without changing the selected fundamental frequency. Amplitudes are normalized by energy, with polyphonic headroom, smoothed gain changes and a compressor. Partials above the supported frequency range are muted.

Harmonic touch is separate: it raises the pitch by an octave and attenuates upper partials to simulate a light-touch violin effect. Turn it off for full timbre exploration. Mixer bars show the resulting relative partial amplitudes; percentages show requested slider levels.

## Musical sketch
The latest 16 note/chord events appear as dots on a treble staff with ledger lines. Chords are stacked; harmonic touches are translucent. This is a pitch sketch, without measured rhythm or duration. Clear sketch does not stop audio.

Stop all sound (or Escape) clears sounding strings and preview voices. During camera use, relax the right index or move the hand out of view to re-arm after stopping. Switching modes releases sound and stops the camera. Hiding the page also stops both.

## Privacy and local use
Frames stay on device; no recording, upload, or microphone access. MediaPipe libraries/models and fonts download from public CDNs. Modern desktop browser, HTTPS or localhost, and internet access for those resources are required.

Run `npm start` and visit http://127.0.0.1:8765. Run `npm run check` for source checks and numerical/voice-lifecycle tests.

Validated: note/string positions and staff mapping, timbre weights, polyphonic release, UI chords/note replacement/stop-all/harmonic toggle/custom mixer, and OfflineAudioContext-rendered spectra showing same-pitch timbre changes versus octave harmonic touch. The MediaPipe tracker is unchanged from v1. Live human gesture tracking still depends on framing and lighting and needs a user play-through.
