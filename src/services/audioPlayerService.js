// Audio Player Service for pre-recorded stories
class AudioPlayerService {
  constructor() {
    this.currentAudio = null;
    this.onPlayCallback = null;
    this.onStopCallback = null;
  }

  // Play an audio file
  play(audioUrl, callbacks = {}) {
    // Stop any currently playing audio
    this.stop();

    this.currentAudio = new Audio(audioUrl);
    this.onPlayCallback = callbacks.onPlay;
    this.onStopCallback = callbacks.onStop;

    // Event listeners
    this.currentAudio.addEventListener('ended', () => {
      this.handleStop();
    });

    this.currentAudio.addEventListener('error', (error) => {
      console.error('Error playing audio:', error);
      this.handleStop();
    });

    // Start playing
    this.currentAudio.play()
      .then(() => {
        if (this.onPlayCallback) {
          this.onPlayCallback();
        }
      })
      .catch(error => {
        console.error('Error starting audio:', error);
      });
  }

  // Stop current audio
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.handleStop();
    }
  }

  // Handle stop event
  handleStop() {
    if (this.onStopCallback) {
      this.onStopCallback();
    }
    this.currentAudio = null;
    this.onPlayCallback = null;
    this.onStopCallback = null;
  }

  // Check if currently playing
  isPlaying() {
    return this.currentAudio && !this.currentAudio.paused;
  }
}

export const audioPlayerService = new AudioPlayerService();
