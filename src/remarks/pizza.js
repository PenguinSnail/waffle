const Discord = require('discord.js');

module.exports = {
	name: 'pizza',
	check(message) {
		return message.content.toLowerCase().includes('pizza');
	},
	execute(message, args) {
		const file = new Discord.MessageAttachment(__dirname + '/' + '../../assets/remarks/pizza.gif');
		message.channel.send({ files: [file] });
		return;
	},
};