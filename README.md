# BridgeLIB 

This is a migration workspace for the existing BridgeLIB Liberia education platform. The original source of truth is the public GitHub repository https://github.com/Exploit-009/BridgeLIB. The main React app is in artifacts/bridgelib and there is a separate API server in artifacts/api-server.

IMPORTANT: First inspect the public repository and report whether you can access/read its actual source files and identify the framework, app entry point, dependencies, and backend integration. Do NOT invent or replace the existing BridgeLIB app with a generic starter. Do NOT create a new Supabase database, enable Lovable Cloud database, run migrations, change schema, or request/expose any service-role secret. The existing Supabase backend must be preserved. Do not connect to or push to GitHub yet; do not modify the original repository. If this environment cannot import/read the existing repository source, stop and clearly tell me what is needed to import it safely. For now, do an inspection-only first step and do not implement features until you have confirmed what source you can access.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bridgelib.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a97119b9-f724-45e6-9b15-b75025aea33b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
