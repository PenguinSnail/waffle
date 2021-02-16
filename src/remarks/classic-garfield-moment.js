const Discord = require('discord.js');

module.exports = {
	name: 'classic garfield moment',
	check(message) {
		return (
			message.content.toLowerCase().includes('classic garfield moment')
			|| message.content.toLowerCase().includes('cgm')
		);
	},
	execute(message, args) {
		const file = new Discord.MessageAttachment(__dirname + '/' + '../../assets/remarks/classic-garfield-moment.jpg');
		message.channel.send({ files: [file] });
		return;
	},
};