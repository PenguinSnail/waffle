const Discord = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');
const child_process = require('child_process');
const path = require('path');

const template = path.resolve(
	__dirname +
	'/../../assets/templates/wish-all.png'
);

const name = 'wishall';
const description = 'I wish all \\_\\_\\_ a very \\_\\_\\_';
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

		const captionTop = splitArgs[0];
		const captionBottom = splitArgs[1];

		const tmpPath = path.resolve(
			__dirname +
			'/../../assets/tmp/' +
			crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10) +
			'.jpg'
		);
		
		const convertTop = child_process.spawn(
			'convert',
			[
				'-background', '#00000000',
				'-size', '235x160',
				'-font', 'Impact',
				'-fill', 'white',
				'-gravity', 'center',
				`caption:${captionTop}`,
				'miff:-'
			]
		);
		const compositeTop = child_process.spawn(
			'composite',
			[
				'-gravity', 'NorthWest',
				'-geometry', '+20+80',
				'-', template,
				tmpPath
			]
		);

		convertTop.stdout.pipe(compositeTop.stdin);

		compositeTop.on('exit', () => {
			const convertBottom = child_process.spawn(
				'convert',
				[
					'-background', '#00000000',
					'-size', '260x110',
					'-font', 'Impact',
					'-fill', 'white',
					'-gravity', 'Center',
					`caption:${captionBottom}`,
					'miff:-'
				]
			);
			const compositeBottom = child_process.spawn(
				'composite',
				[
					'-gravity', 'NorthWest',
					'-geometry', '+20+290',
					'-', tmpPath,
					tmpPath
				]
			);

			convertBottom.stdout.pipe(compositeBottom.stdin);

			compositeBottom.on('exit', () => {
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

			convertBottom.on('error', e => reject(e));
			compositeBottom.on('error', e => reject(e));
		});

		convertTop.on('error', e => reject(e));
		compositeTop.on('error', e => reject(e));
	}),
};