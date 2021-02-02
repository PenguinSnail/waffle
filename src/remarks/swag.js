const Discord = require('discord.js');

const images = 10;

module.exports = {
	name: 'swag',
	check(message) {
		return message.content.toLowerCase().includes('swag');
	},
	execute(message, args) {
		const file = new Discord.MessageAttachment(__dirname + '/' + '../../assets/remarks/swag' + Math.round(Math.random() * (images - 1)) + '.jpg');
		message.channel.send({ files: [file] });
		return;
	},
};