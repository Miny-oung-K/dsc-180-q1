# DSC 180 — Quarter 1

This branch contains **Harmonic Lab**, an interactive sound and vowel-synthesis investigation.

- **Branch:** `app/harmonic-lab`
- **Application:** [apps/harmonic-lab](apps/harmonic-lab)
- **Technical workflow:** [docs/workflow.md](docs/workflow.md)
- **Development history:** [docs/development.md](docs/development.md)
- **Research references:** [docs/references.md](docs/references.md)
- **Hosted app:** https://harmonic-lab.mik061.chatgpt.site (may require the owner's ChatGPT sign-in)

## Run and test

Requires Node.js 20 or newer. The browser app has no third-party JavaScript dependencies.

```sh
cd apps/harmonic-lab
npm test
npm run dev
```

Open the server's printed localhost URL. Microphone access requires localhost or HTTPS and permission from the browser/operating system.

The `main` branch is a course-project index. The app branch contains the implementation, tests, synthetic prototype settings, and an optional offline analysis workflow. GitHub publication does not alter the separately hosted app or its access controls.

Personal voice recordings, reflection answers, chat transcripts, secrets, and host-specific deployment configuration are excluded.
