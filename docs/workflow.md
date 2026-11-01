# Technical workflow

## 1. Manual additive synthesis

Enter a fundamental and its integer multiples. The combined signal is a sum of sine waves weighted by relative amplitudes. A 100 Hz fundamental plus 200 and 300 Hz harmonics repeats every 10 ms. Arbitrarily chosen integer frequencies may have a longer common period; they are not necessarily random noise or nonperiodic.

Hold the fundamental frequency fixed while changing harmonic amplitudes. Relative amplitudes change waveform shape and timbre. Scaling all amplitudes equally scales the plotted waveform, but the app normalizes playback by the sum of active amplitudes. Use a fixed plot scale to compare amplitude and the Volume control to change playback level.

## 2. Microphone observation and recording

Start the microphone, allow access, and inspect both time-domain waveform and frequency-domain spectrum. The microphone is not monitored through the speakers. Stop releases the media tracks and AudioContext. The sound explorer can record up to 120 seconds; the automatic analyzer accepts 0.3–30-second takes and its direct record button captures five seconds.

## 3. Automatic steady-vowel synthesis

1. Record a sustained vowel with the in-app microphone.
2. Decode/resample locally to mono 16 kHz.
3. Analyze overlapping 80 ms frames with a 20 ms hop.
4. Estimate pitch through a YIN-style normalized difference function, using a 60–600 Hz search range.
5. Reject quiet, unvoiced, or inconsistent input and choose a roughly one-second section with consistent pitch and level. Manual section boundaries are also available.
6. Apply a Hann window and a 4096-point FFT to measure energy in bands around harmonic multiples.
7. Normalize per-frame harmonic strengths and combine them with medians to reduce frame-to-frame variation.
8. Use the detected pitch or interpolate the spectral envelope onto a chosen shared fundamental.
9. Populate 24 harmonic slots and render a three-second steady reconstruction with an oscillator bank.
10. Compare the original section and synthesis separately; download WAVs and the analysis JSON.

The synthesized comparison preview is adjusted toward the original section's RMS signal level, subject to a peak limit. This is not perceptual loudness calibration. The editable main mixer uses its own Volume setting. The analysis is deterministic DSP; it does not run DDSP machine learning or identify written vowel letters.

## 4. Vowel experiments

The investigation used Korean 아, 유, and 에. 유 includes an opening /j/ glide, so a steady reconstruction targets the held /u/ portion. Designed prototype amplitudes in `research/prototypes/korean-vowel-settings.json` are initial guesses, not measurements. The optional offline workflow analyzes user-supplied PCM WAV files and estimates new recipes at 100 and 200 Hz.

A common fundamental is useful when comparing vowel quality. Matching a recording also requires matching its actual pitch: forcing a roughly 197 Hz original to 100 Hz changes pitch by roughly an octave. A formant is a resonance region, not necessarily a harmonic or the largest individual spectral peak. A strong second harmonic can cause naive maximum-peak pitch detection to make an octave error.

## 5. Validation and reproducibility

Run the Node tests before changing synthesis or capture behavior. The original microphone-only feature was also checked with three privately supplied vowel recordings; those audio files are intentionally not distributed here. Six automated tests cover DSP failure cases and the simulated capture-to-sliders flow. Manual browser checks cover recording permission/cancellation, playback switching, slider synchronization, WAV downloads, responsive layout, and the absence of file-upload inputs.

For a real-device test: record a comfortable held vowel, analyze it, inspect the harmonic spacing, compare playback, and try another pitch. Document failures rather than treating the repetition score as proof of accuracy.

## 6. Hosting

The app is static HTML/JavaScript. It runs under localhost for development or HTTPS for hosted microphone access. Its current deployment is managed separately through Sites. Host-specific manifests, source credentials, and access policy are not copied into this GitHub repository. GitHub Actions only runs tests; no workflow deploys or changes the live site.

## Drawn spectrum filter

Draw a frequency-dependent amplitude response over the synthesized sound spectrum. The spectrum uses the exact Fourier components of the additive sine-wave recipe, rather than an FFT of a finite sampled window. Coincident, equal-phase components are summed before plotting. Blue peaks show the original spectrum; green peaks show the filtered result; the orange line is the retained amplitude from 0 to 100 percent. The log-like frequency axis includes zero. Changing the visible frequency range preserves the full 0–20 kHz curve.

The filter multiplies each tone amplitude by its response at that frequency. Playback and WAV exports retain the original amplitude sum as their normalization denominator, so attenuation is not automatically undone. Smooth live gain transitions reduce clicks. It changes magnitude only, leaving frequency and phase unchanged; it cannot add components absent from the input. Low-pass and high-pass presets, reset, bypass, touch drawing, and a numeric narrow-band alternative are included. The combined waveform reflects the filter. The lowest-tone comparison, microphone recordings, and automatic vowel reference preview remain unfiltered; use the main mix/export for a filtered vowel recipe.

Run `npm test` in `apps/harmonic-lab`. The filter tests cover harmonic rejection, stroke direction, preset behavior, bypass/reset, and export normalization including silence. Drawing and live playback were also checked in the local browser preview.
