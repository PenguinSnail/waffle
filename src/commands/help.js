module.exports = {
	name: 'help',
	description: 'Waffle Help',
	execute(message, args) {
		message.channel.send(`
			**Remarks**
			\`bup\`
			\`swag\`
			\`so sad\`
			\`pizza\`
			\`classic garfield moment\`
			**Commands**
			\`help\`
		`.replace(/\t+/g, ''));
	},
};