module.exports = {
	name: 'help',
	description: 'Waffle Help',
	execute(message, args) {
		message.channel.send(`
			**Remarks**
			\`bup\`
			\`so sad\`
			\`pizza\`
			\`classic garfield moment\`
			**Commands**
			--------------------
		`.replace(/\t+/g, ''));
	},
};