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
- **Encrypted**: All your notes and images are encrypted before they are sent to server, nobody but you can read them; If you know coding, you can check the [source code](https://github.com/penghuili/notenotecc) yourself to see how it works;
- **Instagram style**: Photos at the top, words below them, good way to record your everyday;
- **Unlimited**: ${isTesting() ? 'You can take unlimited notes;' : 'You can take unlimited notes without photos `for free`; With a small subscription ($1.99/Month), you can attach unlimited photos and short videos;'}
- **Today in history**: See what happened the same day of last week, last month, last year etc.;
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
It started with the question: **how to backup my photos safely?**
**Not iCloud/GoogleDrive/Dropbox etc**: They don't encrypt my photos and notes, and there are always people who have the permission to view my files. Maybe they won't, but they can.
**Not encrypted drives**: like ProtonDrive, Filen, Ente, because I also want to write some words for my photos.
What I really need is **something like Instagram**, photos at top, words below them, like this one you are reading. And everything is encrypted of course.
So I created notenote.cc`,
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
    createdAt: 1724666820000,
    isLocal: true,
    isWelcome: true,
    note: `## Encryption looks like this
"**Take notes like Instagram, and encrypted.**"
\`becomes\`
**wy4ECQMIEBxRNEeIF4bgdM7Y+SQ7tISQ57p1ZjndMSjTgY9TfjHeuM3eV4uJ**
**ScYG0loBx5NmvvYropaF6BNKyE15YsOZhGUmJLoOKhYvEdagyOXNhzp4Ajd4**
**j8TARG9Cve1sZgcdVr/2zHE5iq5BX3zG+hSpr3tnlcnx8UVFBi9DsRy7/ivL**
**lgD0L+g=**
**=kxgU**
Same for your photos, and those encrypted-nobody-can-understand things are saved in server. Learn more abount [encryption](https://notenote.cc/encryption).`,
    images: [
      {
        hash: 'dce16c44-b473-4499-a01b-d2e5d78c9244',
        url: 'https://app.notenote.cc/assets/722da360-fe3b-4586-aacf-ce3f60d05fed.webp',
        type: webpType,
      },
      {
        hash: 'cf57d10a-b403-4253-ad36-4507f85c9cd4',
        url: 'https://app.notenote.cc/assets/0367c7c5-900b-4d25-9e95-deaf4e7314ba.webp',
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
**When you sign up**:
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
