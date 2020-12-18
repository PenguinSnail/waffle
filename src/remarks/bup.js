module.exports = {
	name: 'bup',
	check(message) {
		return message.content.toLowerCase().includes('bup');
	},
	execute(message, args) {
		message.channel.send('B U P');
		return;
	},
};