# TableTalk Recipe Sharing App

TableTalk is a full-stack recipe-sharing platform with a React frontend and Express/MongoDB backend. Users can browse paginated recipes, search by dish or ingredient, publish and edit recipes, and toggle likes or saved recipes.

## Structure

- `frontend/` React + Vite client using React Router and Fetch
- `backend/` Express REST API, Mongoose schema, validation, pagination, and Multer image upload support

## Run locally

1. Start MongoDB locally, or set `MONGODB_URI` in `backend/.env` using `backend/.env.example`.
2. In one terminal: `cd backend && npm install && npm run dev`
3. In another: `cd frontend && npm install && npm run dev`
4. Open `http://localhost:5173`.

Uploaded images are sent to Cloudinary when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are present in `backend/.env`. The MongoDB document stores the returned secure URL and Cloudinary public ID.

## API contract

- `GET /api/recipes?search=&page=1&limit=6` returns `{ recipes, pagination }`.
- `POST /api/recipes` accepts JSON or `multipart/form-data`; repeated `ingredients` and `steps` fields are supported. An `image` file is accepted by Multer and uploaded to Cloudinary, or provide `imageUrl`.
- `GET /api/recipes/:id` returns one nested recipe document.
- `PUT /api/recipes/:id` updates a recipe with the same payload shape as create.
- `POST /api/recipes/:id/like` and `POST /api/recipes/:id/save` accept `{ "user": "user-id" }` and toggle that user's state.

The current client uses a lightweight `you` user identifier. Authentication can be added without changing the recipe document contract.
