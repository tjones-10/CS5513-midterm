### The Bookworm with Next.js + Firebase

The original Friendly Eats codelab has the full Firebase setup instructions, but as a quick start, you can do this.

#### Run the application

1. In your terminal, run:

```sh
firebase emulators:start --project demo-codelab-nextjs
```

2. Copy the file `lib/firebase/config-copy.js` to `lib/firebase/config.js` and fill in the values from the Firebase console.

3. In a new terminal tab/window, run:

```sh
npm i
npm run dev
```

For Gemini review summaries in Firebase App Hosting, set the `GEMINI_API_KEY` secret:

```sh
firebase apphosting:secrets:set GEMINI_API_KEY
```

Enter the Google AI API key when prompted; do not put it in source control. The `apphosting.yaml` configuration exposes this secret to the server as `GEMINI_API_KEY`. Deploy the App Hosting backend again after creating or updating the secret and configuration.

4. In your browser, open the URL: `http://localhost:3000`

#### Use the application

1. While on `http://localhost:3000/` within your browser, click the "Sign in" button in the top right corner and sign in.
2. In the dropdown menu in the top right menu, select "Add sample books".
