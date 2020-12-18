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
			\`this is fine\`
			\`on baby\`
			\`classic garfield moment\`
			**Commands**
			\`help\`
			\`fuckit\`
		`.replace(/\t+/g, ''));
	},
};