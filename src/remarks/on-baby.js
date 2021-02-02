const Discord = require('discord.js');

module.exports = {
	name: 'on baby',
	check(message) {
		return message.content.toLowerCase().includes('on baby');
	},
	execute(message, args) {
		const file = new Discord.MessageAttachment(__dirname + '/' + '../../assets/remarks/on-baby.jpg');
		message.channel.send({ files: [file] });
		return;
	},
};