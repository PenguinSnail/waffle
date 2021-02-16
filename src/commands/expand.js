const Discord = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');
const child_process = require('child_process');
const path = require('path');

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

		const wordFiles = fs.readdirSync(
			path.resolve(`${__dirname}/../../assets/templates/expand/words/`)
		);
		const charFiles = fs.readdirSync(
			path.resolve(`${__dirname}/../../assets/templates/expand/characters/`)
		);

		const randomID = crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10);

		let lines = [
			[]
		];
		args.forEach(word => {
			let currentLine = lines.length - 1;
			const currentLength = lines[currentLine].join().length;

			word = word
			.replace(/[\u2018\u2019]/g, "'")
			.replace(/[\u201C\u201D]/g, '"')
			.toLowerCase();

			const wordMatches = wordFiles.filter(file => file.split('_')[0] === word);

			if (wordMatches.length > 0) {
				if (currentLength + word.length > 40) currentLine = currentLine + 1;
				lines[currentLine] = lines[currentLine] ? lines[currentLine].concat([word]) : [word];
				lines[currentLine].push(' ');
			} else {
				const characters = word.split('');
				characters.push(' ');

				if (currentLength + characters.length > 40) currentLine = currentLine + 1;
				lines[currentLine] = lines[currentLine] ? lines[currentLine].concat(characters) : characters;
			}
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
						if (c === '-') c = '_HYPHEN';
						if (c === '!') c = '_BANG';
						if (c === '?') c = '_QUESTION';
						if (c === '.') c = '_PERIOD';
						if (c === ':') c = '_COLON';
						if (c === '"') c = '_DQUOTE';
						if (c === '\'') c = '_SQUOTE';
						if (c === ',') c = '_COMMA';
						if (c === '_') c = '_UNDERSCORE';
						if (c === '#') c = '_POUND';

						const wordMatches = wordFiles.filter(file => file.split('_')[0] === c);

						const files = fs.readdirSync(
							path.resolve(`${__dirname}/../../assets/templates/expand/${wordMatches.length > 0 ? 'words/' : 'characters/'}`)
						).filter(file => wordMatches.length > 0 ? file.split('_')[0] === c : file.startsWith(c));

						if (files.length < 1) {
							return path.resolve(`${__dirname}/../../assets/templates/expand/characters/_SPACE.png`);
						} else {
							const randomChar = Math.round(Math.random() * (files.length - 1));
							return path.resolve(`${__dirname}/../../assets/templates/expand/${wordMatches.length > 0 ? 'words/' : 'characters/'}${c}${wordMatches.length > 0 ? '_' : ''}${randomChar}.png`);
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
						if (fs.existsSync(tmpPath)) {
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
						}

						resolve();
					});
				}
			});
		});
	}),
};