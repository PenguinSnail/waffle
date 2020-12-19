const Discord = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');
const child_process = require('child_process');
const path = require('path');

const template = path.resolve(
	__dirname +
	'/../../assets/templates/going-to.png'
);

module.exports = {
	name: 'goingto',
	description: 'I am going to ___',
	execute: (message, args) => new Promise((resolve, reject) => {
		if (args.length < 1) {
			message.channel.send(`
			**${this.description}**
			${process.env.PREFIX}${this.name} <what you're going to>
		`.replace(/\t+/g, ''));

		resolve();
		return;
		}

		const tmpPath = path.resolve(
			__dirname +
			'/../../assets/tmp/' +
			crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10) +
			'.jpg'
		);

		const convert = child_process.spawn(
			'convert',
			[
				'-background', '\'#00000000\'',
				'-size', '1000x60',
				'-fill', 'white',
				'-gravity', 'Center',
				`caption:${args.join(' ')}`,
				'miff:-'
			]
		);
		const composite = child_process.spawn(
			'composite',
			[
				'-gravity', 'South',
				'-geometry', '+0+10',
				'-', template,
				tmpPath
			]
		);

		convert.stdout.pipe(composite.stdin);
		
		composite.on('exit', () => {
			const file = new Discord.MessageAttachment(tmpPath);
			message.channel.send({ files: [file] });
		
			setTimeout(() => {
				try {
					fs.unlinkSync(tmpPath);
				} catch (e) {
					console.error(`Error removing file ${tmpPath}`, e);
				}
			}, 60 * 1000);
			resolve();
		});

		convert.on('error', e => reject(e));
		composite.on('error', e => reject(e));
	}),
};