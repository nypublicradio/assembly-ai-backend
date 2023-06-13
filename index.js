require( 'dotenv' ).config();

// create supabase client
const {
    createClient
} = require( '@supabase/supabase-js' );
const supabase = createClient( process.env.SUPABASE_URL, process.env.SUPABASE_KEY )

// inserts a new record to the transcripts table
const insertTranscript = async ( transcriptData ) => {
    const {
        error
    } = await supabase
        .from( 'transcripts' )
        .insert( [ {
            station_id: process.env.STATION_ID,
            transcript: {
                "text": transcriptData.text,
                "created": transcriptData.created,
                "audio_end": transcriptData.audio_end,
                "confidence": transcriptData.confidence,
                "audio_start": transcriptData.audio_start
            }
        }, ] )
    if ( error ) {
        console.log( 'insertTranscript error', error );
    }
}

// updates the current partial transcript in the closedCaptioning table
const updatePartialTranscript = async ( transcriptData ) => {
    const {
        error
    } = await supabase
        .from( 'closedCaptioning' )
        .update( {
            current_partial_transcript: transcriptData.text
        } )
        .eq( 'station_id', process.env.STATION_ID )
    if ( error ) {
        console.log( 'updatePartialTranscript error', error );
    }
}

const WebSocket = require( 'ws' );
const spawn = require( 'child_process' ).spawn;

const ws = new WebSocket( 'wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000', {
    headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
    }
} );

ws.on( 'open', function open() {
    const ffmpeg = spawn( 'ffmpeg', [ '-re', '-i', process.env.HLS_URL, '-vn', '-f', 's16le', '-ac', '1', '-ar', '16000', '-' ] );

    let buffer = Buffer.alloc( 0 );

    ffmpeg.stdout.on( 'data', ( data ) => {
        buffer = Buffer.concat( [ buffer, data ] );
        const buffer_size = 4096;
        while ( buffer.length >= buffer_size ) {
            const chunk = buffer.slice( 0, buffer_size );
            buffer = buffer.slice( buffer_size );

            if ( ws.readyState === WebSocket.OPEN ) {
                ws.send( JSON.stringify( {
                    audio_data: chunk.toString( 'base64' )
                } ), ( error ) => {
                    if ( error ) console.error( error );
                } );
            }
        }
    } );

    ffmpeg.stderr.on( 'data', ( data ) => {
        // console.error(`stderr: ${data}`);
    } );

    ffmpeg.on( 'close', ( code ) => {
        console.log( `child process exited with code ${code}` );
    } );

    ws.on( 'close', () => {
        ffmpeg.kill();
    } );
} );

ws.on( 'message', function incoming( message ) {
    const data = JSON.parse( message );
    // save the current partial transcript to the database
    if ( data.message_type === 'PartialTranscript' ) {
        console.log( 'PartialTranscript', data.text );
        updatePartialTranscript( data );
    }
    // save the final transcript to the database
    if ( data.message_type === 'FinalTranscript' ) {
        console.log( 'FinalTranscript', data.text );
        insertTranscript( data );
    }
} );