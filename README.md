# DSC 180 — Quarter 1

Course projects and reproducible technical workflows.

| Project | Branch | Contents |
|---|---|---|
| Harmonic Lab | [app/harmonic-lab](https://github.com/Miny-oung-K/dsc-180-q1/tree/app/harmonic-lab) | Frequency mixer, microphone sound explorer, WAV recording/export, and automatic vowel synthesis |
| Air Violin | [app/air-violin](https://github.com/Miny-oung-K/dsc-180-q1/tree/app/air-violin) | Camera-controlled violin, clickable strings and chords, harmonic mixer, and musical note trail |

Switch to the app branch to view its source, tests, research workflow, and documentation:

```sh
git switch app/harmonic-lab
```

The repository contains implementation and technical documentation. It does not include reflection answers, chat transcripts, personal voice recordings, credentials, or managed hosting configuration.


## Air Violin

The Air Violin source and technical guide are in [`apps/air-violin/`](apps/air-violin/) on this branch.

Live app: [Air Violin — Sound Sculptor](https://air-violin-minyoung.mik061.chatgpt.site).

```sh
git switch app/air-violin
cd apps/air-violin
npm run check
npm start
```

Open http://127.0.0.1:8765. Node.js runs the checks; Python 3 serves the app. There is no dependency installation or build step. The camera requires localhost or HTTPS. Fonts and MediaPipe resources load from public CDNs.
