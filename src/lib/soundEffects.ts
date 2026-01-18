// Sound effects manager for score and win sounds
export const playScoreSound = (teamName?: string, playerName?: string, totalScore?: number, teamNumber?: number, playerTotalScore?: number) => {
  // Announce only: player name, team name, and team total score
  try {
    // Play light background music first
    playLightNotificationSound();
    
    let message = '';
    // Announce: Player name, 1 point, Team name, Team total score
    if (playerName && teamName && totalScore !== undefined) {
      message = `${playerName}, 1 point. ${teamName}, total ${totalScore}`;
    } else if (teamName && totalScore !== undefined) {
      message = `${teamName}, total score ${totalScore}`;
    } else if (playerName && teamName) {
      message = `${playerName} from ${teamName}`;
    } else if (teamName) {
      message = `${teamName}`;
    }
    
    if (message) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-IN';
      
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      
      selectedVoice = voices.find(voice => 
        (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Zira') || voice.name.includes('Aria')) &&
        (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman')) &&
        (voice.lang === 'en-IN' || voice.lang === 'en_IN' || voice.lang === 'en-US' || voice.lang === 'en_US')
      );
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          (voice.lang === 'en-IN' || voice.lang === 'en_IN') && 
          (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') || voice.name.toLowerCase().includes('isha') || voice.name.toLowerCase().includes('rishi'))
        );
      }
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang === 'en-IN' || voice.lang === 'en_IN'
        );
      }
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          (voice.lang === 'en-US' || voice.lang === 'en_US') && 
          (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') || voice.name.toLowerCase().includes('moira') || voice.name.toLowerCase().includes('victoria'))
        );
      }
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('woman')
        );
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      setTimeout(() => {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  } catch (err) {
    console.log('Speech synthesis not available, playing beep instead');
    playBeepSound();
  }
};

const playLightNotificationSound = () => {
  // Create a light, pleasant notification sound - two soft chime notes
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // First note - G4 (392 Hz)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    
    osc1.frequency.value = 392;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc1.start(now);
    osc1.stop(now + 0.3);
    
    // Second note - B4 (494 Hz) - starts slightly after first
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    
    osc2.frequency.value = 494;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.15, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    
    osc2.start(now + 0.15);
    osc2.stop(now + 0.45);
  } catch (err) {
    console.log('Could not play notification sound');
  }
};

const playBeepSound = () => {
  // Create a simple beep sound using Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

export const playWinSound = (winnerName?: string) => {
  // Play winning fanfare (voice announcement disabled)
  try {
    // First, play an epic fanfare
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [
      { freq: 523, duration: 0.3 },   // C5
      { freq: 659, duration: 0.3 },   // E5
      { freq: 784, duration: 0.4 },   // G5
      { freq: 1047, duration: 0.6 },  // C6
      { freq: 1047, duration: 0.3 },  // C6
    ];
    
    let startTime = audioContext.currentTime;
    
    notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = note.freq;
      oscillator.type = 'sine';
      
      const noteStartTime = startTime + index * 0.35;
      gainNode.gain.setValueAtTime(0.4, noteStartTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, noteStartTime + note.duration);
      
      oscillator.start(noteStartTime);
      oscillator.stop(noteStartTime + note.duration);
    });
    
    // Voice announcement disabled
    // Uncomment below to re-enable voice announcements
    /*
    if (winnerName) {
      setTimeout(() => {
        try {
          const message = `${winnerName} wins the match!`;
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.85;
          utterance.pitch = 0.9;
          utterance.volume = 1.0;
          utterance.lang = 'en-IN';
          
          const voices = window.speechSynthesis.getVoices();
          let selectedVoice = voices.find(voice => 
            voice.name.includes('Google') && voice.name.includes('Female')
          );
          
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => 
              voice.name.includes('Victoria') ||
              voice.name.includes('Samantha')
            );
          }
          
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.name.includes('Female'));
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.log('Could not play win announcement');
        }
      }, 1500);
    }
    */
  } catch (err) {
    console.log('Error playing win sound:', err);
  }
};
