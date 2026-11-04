# Harmonic Lab

A buildless browser app for studying how frequency, harmonic amplitude, and microphone input relate to sound.

## Features

- Type frequencies and amplitudes; adjust synchronized amplitude sliders while listening.
- Generate integer or odd harmonics and compare a mix with its lowest active tone.
- Change waveform time and amplitude scales.
- Draw a frequency filter over the synthesized spectrum; compare original and filtered peaks while the waveform and playback update live.
- Use low-pass/high-pass presets, bypass, reset, or numeric narrow-band controls. Synthesized WAV exports include the drawn filter.
- Display microphone waveform and spectrum without speaker monitoring.
- Record microphone audio and download the original or a synthesized WAV.
- Automatically record a five-second vowel, find a steady section, estimate its fundamental, measure harmonic strengths, fill 24 slider slots, and render a steady reconstruction.
- Compare the original section with the new synthesis, choose a shared fundamental, and export analysis/settings JSON.

The frequency dashboard appears first. Automatic vowel synthesis is at the bottom, below the microphone explorer.

Automatic synthesis uses microphone recordings made in the app. There is no recording-upload control or server-side audio processing.

## Run

```sh
npm run dev
```

Open http://127.0.0.1:8000. To choose a different port: `PORT=8001 npm run dev` (POSIX shells). No package installation or build is required for the app.

## Verify

```sh
npm test
```

Tests also cover drawn harmonic rejection, curve interpolation, low-pass/high-pass presets, bypass/reset, and preserving attenuation in WAV rendering, including complete silence. Tests cover stronger upper harmonics, a missing fundamental, quiet/noisy input, pitch-grid changes, section validation, and a simulated microphone-to-analysis-to-sliders flow. The microphone test uses simulated devices; real-device permission and audio quality must also be checked manually.

## Files

| File | Purpose |
|---|---|
| `dist/app.js` | Manual mixer, waveform plots, playback, slider integration |
| `dist/filter-dsp.js` | Frequency-dependent gain curve, interpolation, presets, and amplitude application |
| `dist/filter-ui.js` | Drawable spectrum response, before/after peaks, bypass, presets, and numeric controls |
| `dist/audio-files.js` | PCM WAV encoding and offline mix rendering |
| `dist/microphone.js` | Microphone lifecycle, live analysis, recording |
| `dist/mic-capture.js` | AudioWorklet sample capture with silent output |
| `dist/vowel-dsp.js` | YIN-style pitch estimator, FFT, section selection, harmonic analysis |
| `dist/vowel-worker.js` | Run vowel analysis outside the UI thread |
| `dist/vowel-ui.js` | Microphone-only automatic synthesis and comparison controls |
| `tests/` | Deterministic DSP and integration tests |
| `research/` | Reusable offline analysis and designed prototype settings |

## Drawn filter

The filter displays the exact Fourier components of the additive sine-wave mix. The orange curve sets retained amplitude (0–100%); blue peaks show the original and green peaks the filtered spectrum. Frequency remains unchanged. Gains stay anchored to absolute frequency when the harmonic grid changes, which supports exploring vowel-like spectral envelopes at different pitches. The curve reduces existing components; it cannot create missing frequencies or amplify above the input.

Main-mix playback, its waveform, and its WAV export use the filter. The lowest-tone reference, original microphone recording, and automatic vowel comparison remain unfiltered. Exports use the original amplitude sum for normalization, so lowering the curve makes the sound quieter. Changing the frequency view preserves the full curve.

## Limits

The automatic reconstruction uses a steady harmonic model, not a trained voice model. It does not reproduce breathiness, full speech, changing pitch, or the complete /j/ to /u/ transition in 유. Estimated pitch is restricted to 60–600 Hz; analysis recordings are 0.3–30 seconds. Shared-pitch mode interpolates the measured magnitude envelope, which is approximate, especially below the original fundamental. A periodicity score is not a probability that the pitch is correct.

Audio, FFT processing, and synthesis stay in the browser. Downloads are initiated by the user. Personal audio is not included in this repository.
