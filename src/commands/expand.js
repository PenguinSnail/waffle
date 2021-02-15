const Discord = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');
const child_process = require('child_process');
const path = require('path');
const glob = require('glob');

const name = 'expand';
const description = 'EXPAND DONG';
const arguments = '<text>';

module.exports = {
	name: name,
	description: description,
	arguments: arguments,
	execute: (message, args) => new Promise((resolve, reject) => {
		if (args.length < 1) {
			message.channel.send(`
				**${name}**
				${process.env.PREFIX}${name} ${arguments}
			`.replace(/\t+/g, ''));

		resolve();
		return;
		}

		const randomID = crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10);

		let lines = [
			[]
		];
		args.forEach(word => {
			const characters = word.replace(/[^0-9a-z]/gi, '').toLowerCase().split('');
			characters.push(' ');

			let currentLine = lines.length - 1;
			const currentLength = lines[currentLine].length;

			if (currentLength + characters.length > 40) currentLine = currentLine + 1;
			lines[currentLine] = lines[currentLine] ? lines[currentLine].concat(characters) : characters;
		});

		lines.forEach(line => {
			if (line[line.length - 1] === ' ') line = line.pop();
		})

		let completedLines = 0;

		lines.forEach((line, lineNum) => {
			const linePath = path.resolve(
				__dirname +
				'/../../assets/tmp/' +
				randomID +
				'-line' + lineNum + '.jpg'
			);

			const lineGen = child_process.spawn(
				'convert',
				[
					'-geometry', 'x100',
					'+append',
					...line.map(c => {
						const files = fs.readdirSync(
							path.resolve(`${__dirname}/../../assets/templates/expand-letters/`)
						).filter(file => file.split('')[0] === c);

						if (files.length < 1) {
							return path.resolve(`${__dirname}/../../assets/templates/expand-letters/SPACE.png`);
						} else {
							const randomChar = Math.round(Math.random() * (files.length - 1));
							return path.resolve(`${__dirname}/../../assets/templates/expand-letters/${c}${randomChar}.png`);
						}
					}),
					linePath
				]
			);
			lineGen.on('error', e => reject(e));

			lineGen.on('exit', code => {
				completedLines++;
				if (completedLines >= lines.length) {
					const tmpPath = path.resolve(
						__dirname +
						'/../../assets/tmp/' +
						randomID +
						'.jpg'
					);

					const lineMerge = child_process.spawn(
						'convert',
						[
							'-append',
							...lines.map((l, index) => path.resolve(
								__dirname +
								'/../../assets/tmp/' +
								randomID +
								'-line' + index + '.jpg'
							)),
							tmpPath
						]
					);
					lineMerge.on('error', e => reject(e));

					lineMerge.on('exit', code => {
						const file = new Discord.MessageAttachment(tmpPath);
						message.channel.send({ files: [file] });

						lines.forEach((line, lineIndex) => {
							const removeLinePath = path.resolve(
								__dirname +
								'/../../assets/tmp/' +
								randomID +
								'-line' + lineIndex + '.jpg'
							);
							setTimeout(() => {
								try {
									fs.unlinkSync(removeLinePath);
								} catch (e) {
									console.error(`Error removing file ${removeLinePath}`, e);
								}
							}, 60 * 1000);
						});
						setTimeout(() => {
							try {
								fs.unlinkSync(tmpPath);
							} catch (e) {
								console.error(`Error removing file ${tmpPath}`, e);
							}
						}, 60 * 1000);

						resolve();
					});
				}
			});
		});
	}),
};