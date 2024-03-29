import audioPlayer from 'web-audio-player';
import createAnalyser from 'web-audio-analyser';
import average from 'analyser-frequency-average';
import createAudioContext from 'ios-safe-audio-context';


function createPlayer(source, string) {
    var loading = document.querySelector(string);
    var audioContext = createAudioContext();

    var player = audioPlayer(source, {
        context: audioContext,
        buffer: true,
        loop: true
    });

    // This is triggered on mobile, when decodeAudioData begins.
    player.once('decoding', function(amount) {
        loading.innerText = 'Decoding...'
    });

    // Only gets called when loop: false
    player.on('end', function() {
        console.log('Audio ended')
    });

    // If there was an error loading the audio
    player.on('error', function(err) {
        console.error(err.message)
        loading.innerText = 'Error loading audio.'
    });

    // This is called with 'canplay' on desktop, and after
    // decodeAudioData on mobile.
    player.on('load', function() {
        loading.style.display = 'none'

        console.log('Source:', player.element ? 'MediaElement' : 'Buffer')
        console.log('Playing', Math.round(player.duration) + 's of audio...')

        // start audio node
        player.play()
    });

    return player;
}

export default createPlayer;