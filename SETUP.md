# Setup checklist

1. **Install**

   ```bash
   npm install
   ```

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Set `VITE_API_URL` to your FastAPI origin (for example `http://localhost:8000`, no trailing slash). The hey-api client uses this via `configureOpenAPI()` in `src/main.tsx` (`OpenAPI.BASE`).

3. **Develop**

   ```bash
   npm run dev
   ```

4. **Production build**

   ```bash
   npm run build
   npm run preview
   ```

5. **Regenerate the TypeScript client**

   With the backend running and serving OpenAPI at `/openapi.json`:

   ```bash
   export VITE_OPENAPI_URL=http://localhost:8000/openapi.json
   npm run generate-api
   ```

   Then fix any import renames in `src/api/hooks.ts` if the generator output changes.

6. **Backend**

   This UI expects the Agri hybrid scheduler API: `GET /health`, `GET /scenarios/{sid}` (`sid` is `1` or `2`), `GET /scenarios/{sid}/assignments`, and `POST /scenarios/{sid}/force-assign`. The database must be configured so assignments can be computed and cached.
