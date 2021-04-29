const Discord = require('discord.js');
const noonly = require("../commands/noonly");

module.exports = {
	name: 'no only',
	/**
	 * @param {{content: string}} message
	 * @returns {boolean}
	 */
	check(message) {
		const words = message.content.toLowerCase().split(" ");
		if (words.includes("no") && words.includes("only") && words.length >= 4) {
			return words.indexOf("no") < words.indexOf("only");
		} else {
			return false;
		}
	},
	/**
	 * @param {{content: string}} message
	 */
	execute(message, args) {
		const no = message.content.toLowerCase().split(" ").indexOf("no");
		const only = message.content.toLowerCase().split(" ").indexOf("only");

		const words = message.content.split(" ");

		const noText = words.slice(no + 1, only).join(" ");
		const onlyText = words.slice(only + 1).join(" ");

		noonly.execute(message, `"${noText}" "${onlyText}"`.split(/ +/));
	},
};