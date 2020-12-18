const Discord = require('discord.js');

module.exports = {
	check(message) {
		return message.content.toLowerCase().includes('pizza');
	},
	execute(message, args) {
		const file = new Discord.MessageAttachment(__dirname + '/' + '../../assets/pizza.gif');
		message.channel.send({ files: [file] });
		return;
	},
};