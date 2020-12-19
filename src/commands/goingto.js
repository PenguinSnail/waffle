const Discord = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');
const child_process = require('child_process');
const path = require('path');

module.exports = {
	name: 'goingto',
	description: 'I am going to ___',
	execute(message, args) {
		const tmpPath = path.resolve(__dirname + '/../../assets/tmp/' + crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10) + '.jpg');
		const template = path.resolve(__dirname + '/' + '../../assets/templates/going-to.png');
		
		child_process.execSync('convert -background \'#00000000\' -size 1000x60 -fill white -gravity Center label:\'' + args.join(' ') + '\' miff:-|composite -gravity South -geometry +0+10 - ' + '"' + template + '" "' + tmpPath + '"');
		
		const file = new Discord.MessageAttachment(tmpPath);

		message.channel.send({ files: [file] });
		
		setTimeout(() => fs.unlinkSync(tmpPath), 60 * 1000);
	},
};