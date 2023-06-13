# Assembly AI Backend

## Setup

#### Create the .env file

```bash
cp .env.sample .env
```

Open the .env file and update the ```ASSEMBLYAI_API_KEY``` and the ```SUPABASE_KEY```

The Assembly AI API Key can be found at https://www.assemblyai.com/app/account

The Supabase public key can be found at https://supabase.com/dashboard/project/dyjmrswsrewafrohnfcv/settings/api

#### Install the dependencies

```bash
npm install
```

#### Start the server

Note: ```ffmpeg``` must be installed on the server (or on your local machine)!

```bash
node index.js
```