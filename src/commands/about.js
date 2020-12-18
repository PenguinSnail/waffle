module.exports = {
	name: 'about',
	description: 'About Waffle',
	execute(message, args) {
		message.channel.send(`
			**Waffle** is a simple discord bot
			**GitHub:** https://github.com/PenguinSnail/waffle
			Licensed under the AGPL-3.0 License
		`.replace('\t',''));
	},
};