const Discord = require('discord.js');

module.exports = {
	check(message) {
		return message.content.toLowerCase().includes('so sad');
	},
	execute(message, args) {
		const file = new Discord.MessageAttachment(__dirname + '/' + '../../assets/so-sad.jpg');
		message.channel.send({ files: [file] });
		return;
	},
};