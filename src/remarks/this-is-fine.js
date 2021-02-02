const Discord = require('discord.js');

module.exports = {
	name: 'this is fine',
	check(message) {
		return message.content.toLowerCase().includes('this is fine');
	},
	execute(message, args) {
		const file = new Discord.MessageAttachment(__dirname + '/' + '../../assets/remarks/this-is-fine.jpg');
		message.channel.send({ files: [file] });
		return;
	},
};