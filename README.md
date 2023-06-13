# Assembly AI Backend

## Setup

#### Create the .env file

```bash
cp .env.sample .env
```

Open the .env file and update the ```ASSEMBLYAI_API_KEY``` and the ```SUPABASE_KEY```

The Assembly AI API Key can be found at https://www.assemblyai.com/app/account

The Supabase public key can be found at https://supabase.com/dashboard/project/dyjmrswsrewafrohnfcv/settings/api

*Note: the ```STATION_ID``` is set to 1 for WNYC FM (see the ```stations``` table)*

#### Install the dependencies

```bash
npm install
```

#### Start the server

```bash
node index.js
```

*Note: ```ffmpeg``` must be installed on the server or on your local machine!*