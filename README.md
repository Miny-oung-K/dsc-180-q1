# Between — Mouth Sound Morphing

Record two mouth-made sounds and use a slider to synthesize a continuous sound between them. This morphs sound characteristics rather than crossfading recording volumes.

[Hosted website](https://sound-between-studio.mik061.chatgpt.site/) (access depends on the site's sharing settings).

## Run locally

No npm installation or build is required. From this branch's repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:8000 in a current browser. Microphone and AudioWorklet support require localhost or HTTPS; do not open index.html directly as a file.

## Use

1. Record a mouth sound in slot A and stop recording.
2. Record a different mouth sound in slot B: a vowel, hum, whistle, hiss, breath, or click. Clear sustained sounds work best.
3. Press **Play morph** and move the slider. Try AH and MM at a similar pitch to explore changes in resonance.
4. Pause and resume freely. Your pair and its analysis remain saved locally, including through reloads when browser storage is available.
5. Press **Start over** to stop playback and erase the pair, analysis, and slider settings before recording again.

Recordings are limited to 60 seconds. The microphone turns off after recording. Audio is stored locally in IndexedDB, never uploaded; if storage is blocked, it remains only in this tab. Google Fonts supplies typography.

## How it works

- **Selection:** find an audible section and exclude silence from the synthesis model.
- **Voiced pairs:** estimate pitch using autocorrelation, measure harmonic amplitudes in a steady voiced section, interpolate pitch and normalized amplitudes logarithmically, and synthesize one harmonic voice. This preserves the AH-to-MM resonance morph.
- **Unvoiced or mixed pairs:** measure spectral energy with a windowed FFT, represent it using 256 equal-energy frequency samples, interpolate their frequencies, and synthesize a continuous texture with an oscillator bank.
- **Playback:** AudioWorklet runs synthesis with parameter smoothing, a fade-in, and soft saturation.

Endpoints are sustained reconstructions rather than exact recording replays. Clicks become textures. Sentences, rhythms, original transient timing, and a physical simulation of the mouth are not reproduced. Results may sound electronic.

## Files

| File | Purpose |
|---|---|
| `dist/index.html`, `dist/style.css` | Interface and styling |
| `dist/app.js` | Recording, upload, playback, persistence, and reset |
| `dist/voice-dsp.mjs` | Pitch detection and harmonic modeling |
| `dist/mouth-dsp.mjs` | Active-sound selection and spectral analysis |
| `dist/mouth-worklet.js` | Real-time synthesis |
| `tests/` | Synthetic audio regression tests |

## Tests

Use a current Node.js version (validated with Node 25):

```sh
npm test
```

Tests cover voiced sounds, hiss, clicks, silence rejection, finite sustained output, slider changes, silence-padding invariance, and the AH-to-MM harmonic transition. Browser recording, storage, reload, and reset were manually checked during development; Node tests do not emulate those browser features.

## Scientific background

- [NIDCD: Taking Care of Your Voice](https://www.nidcd.nih.gov/health/taking-care-your-voice) — voice production and resonance.
- [Julius O. Smith: Spectral Modeling Synthesis](https://dsprelated.com/freebooks/sasp/Spectral_Modeling_Synthesis.html) — spectral analysis and resynthesis.

This branch includes implementation and technical documentation, not personal recordings, chat transcripts, reflection answers, credentials, or managed hosting configuration.
