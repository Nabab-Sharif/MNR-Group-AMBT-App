export const announceScore = (playerName: string, teamName: string, teamTotalScore: number) => {
	// Announce: Player name, Team name, Team total score
	const message = `${playerName}. ${teamName}. Total ${teamTotalScore}`;

	const utterance = new SpeechSynthesisUtterance(message);
	utterance.rate = 0.85;
	utterance.pitch = 1.0;
	utterance.volume = 1.0;
	utterance.lang = "en-IN";

	if (window.speechSynthesis) {
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utterance);
	}
};

export const announceWinner = (winnerTeam: string) => {
	// Voice announcement disabled
	// Uncomment below to re-enable
	/*
	const message = `Match finished! ${winnerTeam} is the winner!`;

	const utterance = new SpeechSynthesisUtterance(message);
	utterance.rate = 1;
	utterance.pitch = 1;
	utterance.volume = 1;
	utterance.lang = "en-US";

	if (window.speechSynthesis) {
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utterance);
	}
	*/
};

export const announceLiveMatchStart = (match: any) => {
	// Announce: "Live match start right now"
	const message = `Live match start right now`;

	const utterance = new SpeechSynthesisUtterance(message);
	utterance.rate = 0.85;
	utterance.pitch = 1.0;
	utterance.volume = 1.0;
	utterance.lang = "en-IN";

	if (window.speechSynthesis) {
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utterance);
	}
};

