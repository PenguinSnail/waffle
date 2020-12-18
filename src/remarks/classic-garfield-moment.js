const Discord = require('discord.js');

module.exports = {
	name: 'classic-garfield-moment',
	check(message) {
		return message.content.toLowerCase().includes('classic garfield moment');
	},
	execute(message, args) {
		const file = new Discord.MessageAttachment(__dirname + '/' + '../../assets/classic-garfield-moment.jpg');
		message.channel.send({ files: [file] });
		return;
	},
};