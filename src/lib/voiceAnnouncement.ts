export const announceScore = (playerName: string, teamName: string, teamTotalScore: number) => {
	const message = `${playerName}. Leader: ${teamName}. Total score: ${teamTotalScore}`;

	const utterance = new SpeechSynthesisUtterance(message);
	utterance.rate = 1;
	utterance.pitch = 1;
	utterance.volume = 1;
	utterance.lang = "en-US";

	// Cancel any in-progress speech and speak new announcement
	if (window.speechSynthesis) {
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utterance);
	}
};

export const announceWinner = (winnerTeam: string) => {
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
};

export const announceLiveMatchStart = (match: any) => {
	if (!match) return;
	const teamA = match.team1_name || 'Team A';
	const teamB = match.team2_name || 'Team B';
	const matchNumber = match.match_number ? `, match ${match.match_number}` : '';
	const message = `Live match started: ${teamA} versus ${teamB}${matchNumber}`;

	const utterance = new SpeechSynthesisUtterance(message);
	utterance.rate = 1;
	utterance.pitch = 1;
	utterance.volume = 1;
	utterance.lang = "en-US";

	if (window.speechSynthesis) {
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utterance);
	}
};

