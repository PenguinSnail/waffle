const Discord = require('discord.js');

module.exports = {
	check(message) {
		return message.content.toLowerCase().includes('swag');
	},
	execute(message, args) {
		const file = new Discord.MessageAttachment(__dirname + '/' + '../../assets/swag' + Math.round(Math.random() * 3) + '.jpg');
		message.channel.send({ files: [file] });
		return;
	},
};