import { isTesting } from '../shared/react/isTesting';

const webpType = 'image/webp';

export const welcomeNotes = [
  {
    sortKey: 'note_202408261008000_123',
    createdAt: 1724666880000,
    isLocal: true,
    isWelcome: true,
    note: `## Welcome to notenote.cc!
A brief list of what you get with notenote.cc:
- **Encrypted**: All your notes and images are encrypted before they are sent to server, nobody but you can read them; You can check the [source code in github](https://github.com/penghuili/notenotecc);
- **Instagram style**: Photos at the top, words below them, like this one you are reading;
- **Unlimited**: ${isTesting() ? 'You can take unlimited notes;' : 'You can take unlimited notes without photos `for free`; With a small subscription ($1.99/Month), you can take unlimited photos and short videos;'}
- **Fast**: I have invested a lot of time on making the note taking fast.
Is notenote.cc for you? Try it!`,
    images: [],
  },

  {
    sortKey: 'note_202408261007000_123',
    createdAt: 1724666820000,
    isLocal: true,
    isWelcome: true,
    note: `## How it started?
It started with the question: how to backup my photos safely?
I don't want to send my photos to iCloud/GoogleDrive/Dropbox etc. My photos are not encrypted with them, and there are always people who have the right access to view my files. Maybe they won't, but they can.
I could use encrypted drives, like ProtonDrive, Filen, Ente, but I also want to write some words for my photos.
What I need is something like Instagram, photos at top, words below them, and everything is encrypted.
So I created notenote.cc
:)`,
    images: [
      {
        hash: '301273ac-4dda-4888-8f02-f2dab1f4fe2e',
        url: 'https://app.notenote.cc/assets/301273ac-4dda-4888-8f02-f2dab1f4fe2e.webp',
        type: webpType,
      },
      {
        hash: '2fd316ec-26e2-4d85-bfc8-a37053a8237e',
        url: 'https://app.notenote.cc/assets/2fd316ec-26e2-4d85-bfc8-a37053a8237e.webp',
        type: webpType,
      },
      {
        hash: '59ac3284-61d4-4df0-b6b9-28f75ecbbcd1',
        url: 'https://app.notenote.cc/assets/59ac3284-61d4-4df0-b6b9-28f75ecbbcd1.webp',
        type: webpType,
      },
    ],
  },

  {
    sortKey: 'note_202408261006000_123',
    createdAt: 1724666780000,
    isLocal: true,
    isWelcome: true,
    note: `## Why you shouldn't use notenote.cc?
- **I need a native app**. notenote.cc is a web app, if you need something as smooth as native apps, this may not for you;
- **I need high quality photos**. notenote.cc doesn't store orginal photos, it processes your photos before encrypting and sending them to server, to keep the file size small and good enough quality. ${isTesting() ? '' : 'So I can offer such a low price ($1.99/Month) for **unlimited** photos. '}Are you ok with the photos above?
- **I need high quality and long videos**. You can take short videos(15s) with notenote.cc, and you can't pick videos from your device. Same reason as above;
If you don't need these, try notenote.cc, and it's for you!`,
    images: [
      {
        hash: 'c2c545bb-6ade-4768-8372-01d9a16ff4df',
        url: 'https://app.notenote.cc/assets/dce16c44-b473-4499-a01b-d2e5d78c9244.webp',
        type: webpType,
      },
      {
        hash: 'cf57d10a-b403-4253-ad36-4507f85c9cd4',
        url: 'https://app.notenote.cc/assets/cf57d10a-b403-4253-ad36-4507f85c9cd4.webp',
        type: webpType,
      },
    ],
  },

  {
    sortKey: 'note_202408261005000_123',
    createdAt: 1724666740000,
    isLocal: true,
    isWelcome: true,
    note: `## How encryption works in notenote.cc?
notenote.cc uses the same encryption algorithms (OpenPGP) as Proton email, you can check the [details here](https://proton.me/blog/what-is-end-to-end-encryption). And this is how notenote.cc does the encryption:
**When you signup**:
1. Your device generates a public &amp; private key pair.
2. Then your device encrypts the private key with your password;
3. Then your device sends your username, public key, encrypted private key to server;
Your password never leaves your device!

**When you sign in**:
1. Your device makes a request with your username to get your public key, encrypted private key, and a challenge encrypted with your public key;
2. Your device decrypts the encrypted private key with your password;
3. Then it uses the decrypted private key to decrypt the challenge, and send the decrypted challenge to server;
4. Server checks if the challenge is solved, if yes, it will return an access token and a refresh token back to your device, and you are logged in.
So again, your password never leaves your device!!

**When you create a note**:
1. Your device generates a strong password;
2. Then your device encrypts the texts and files with this password;
3. Then your device encrypts this password with your public key;
4. Then your device sends the encrypted texts, the encrypted files and the encrypted password to server;

**When you fetch a note from server**:
1. Your device gets the encrypted texts, encrypted files and the encrypted password from server;
2. Your device decrypts the encrypted password with your private key;
3. Then your device decrypts the encrypted texts or files with the decrypted password;

Let me know if you have feedback.`,
    images: [
      {
        hash: 'dce16c44-b473-4499-a01b-d2e5d78c9244',
        url: 'https://app.notenote.cc/assets/c2c545bb-6ade-4768-8372-01d9a16ff4df.webp',
        type: webpType,
      },
    ],
  },
];
