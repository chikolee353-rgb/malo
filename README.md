# Malvin — Music & Media

Simple static website to upload and display music, photos and videos using browser storage (localStorage). Includes an Advertisement tab with cart and WhatsApp checkout.

Files:
- `home.html` — main page
- `styles.css` — styles
- `app.js` — client-side logic

Notes:
- Uploaded files are stored in the browser (localStorage). They are available only on the same device and browser.
- WhatsApp checkout opens a chat with the number `0780242465` (owner). Update `app.js` if you prefer a different number or international format.

To run: open `home.html` in a browser.

Optional: run the Node upload server so uploads are stored centrally and visible to other users/devices.

1. Install dependencies (requires Node.js):

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open `home.html` in the browser at `http://localhost:3000/home.html` (or serve the folder with a static server) — the frontend will detect the server and upload files to `/uploads`.

Notes:
- Files uploaded via the server are saved to the `uploads/` folder under subfolders `music`, `photos`, and `videos` depending on the upload type.
- If no server is running, uploads fall back to browser `localStorage` (single-device only).
