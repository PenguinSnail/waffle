const Discord = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');
const child_process = require('child_process');
const path = require('path');

const template = path.resolve(
	__dirname +
	'/../../assets/templates/all-my-homies.png'
);

module.exports = {
	name: 'allmyhomies',
	description: 'Fuck ___, All my homies hate ___',
	execute: (message, args) => new Promise((resolve, reject) => {
		if (args.length < 1) {
			message.channel.send(`
			**${this.description}**
			${process.env.PREFIX}${this.name} <what your homies hate>
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
		
		const convertTop = child_process.spawn(
			'convert',
			[
				'-background', '\'#00000000\'',
				'-size', '420x110',
				'-font', 'Impact',
				'-fill', 'white',
				'-stroke', 'black',
				'-strokewidth', '2',
				'-gravity', 'West',
				`caption:${args.join(' ')}`,
				'miff:-'
			]
		);
		const compositeTop = child_process.spawn(
			'composite',
			[
				'-gravity', 'NorthEast',
				'-', template,
				tmpPath
			]
		);

		convertTop.stdout.pipe(compositeTop.stdin);

		compositeTop.on('exit', () => {
			const convertBottom = child_process.spawn(
				'convert',
				[
					'-background', '\'#00000000\'',
					'-size', '735x110',
					'-font', 'Impact',
					'-fill', 'white',
					'-stroke', 'black',
					'-strokewidth', '2',
					'-gravity', 'Center',
					`caption:${args.join(' ')}`,
					'miff:-'
				]
			);
			const compositeBottom = child_process.spawn(
				'composite',
				[
					'-gravity', 'South',
					'-geometry', '+0+10',
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