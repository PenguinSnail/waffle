const Discord = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');
const child_process = require('child_process');
const path = require('path');

const template = path.resolve(
	__dirname +
	'/../../assets/templates/no-only.png'
);

const name = 'noonly';
const description = 'No \\_\\_\\_, only \\_\\_\\_';
const arguments = '"<text>" "<text>"';

module.exports = {
	name: name,
	description: description,
	arguments: arguments,
	execute: (message, args) => new Promise((resolve, reject) => {
		// "first line text" "second line text"
		// ['first line text', ' ', 'second line text']
		// ['first line text', 'second line text'] with filter
		const splitArgs = args.join(' ')
			.trim()
			.replace(/[\u2018\u2019]/g, "'")
			.replace(/[\u201C\u201D]/g, '"')
			.split('"')
			.filter(e => Boolean(e.trim()));

		if (splitArgs.length < 2) {
			message.channel.send(`
				**${name}**
				${process.env.PREFIX}${name} ${arguments}
			`.replace(/\t+/g, ''));

		resolve();
		return;
		}

		const captionNo = splitArgs[0];
		const captionOnly = splitArgs[1];

		const tmpPath = path.resolve(
			__dirname +
			'/../../assets/tmp/' +
			crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10) +
			'.jpg'
		);
		
		const convertNo = child_process.spawn(
			'convert',
			[
				'-background', '#00000000',
				'-size', '190x60',
				'-font', 'Impact',
				'-fill', 'black',
				'-gravity', 'center',
				`caption:${captionNo}`,
				'miff:-'
			]
		);
		const compositeNo = child_process.spawn(
			'composite',
			[
				'-gravity', 'NorthWest',
				'-geometry', '+190+60',
				'-', template,
				tmpPath
			]
		);

		convertNo.stdout.pipe(compositeNo.stdin);

		compositeNo.on('exit', () => {
			const convertOnly = child_process.spawn(
				'convert',
				[
					'-background', '#00000000',
					'-size', '190x60',
					'-font', 'Impact',
					'-fill', 'black',
					'-gravity', 'Center',
					`caption:${captionOnly}`,
					'miff:-'
				]
			);
			const compositeOnly = child_process.spawn(
				'composite',
				[
					'-gravity', 'NorthWest',
					'-geometry', '+595+60',
					'-', tmpPath,
					tmpPath
				]
			);

			convertOnly.stdout.pipe(compositeOnly.stdin);

			compositeOnly.on('exit', () => {
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

			convertOnly.on('error', e => reject(e));
			compositeOnly.on('error', e => reject(e));
		});

		convertNo.on('error', e => reject(e));
		compositeNo.on('error', e => reject(e));
	}),
};