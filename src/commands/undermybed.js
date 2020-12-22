const Discord = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');
const child_process = require('child_process');
const path = require('path');

const template = path.resolve(
	__dirname +
	'/../../assets/templates/under-my-bed.png'
);
const tmpDir = path.resolve(
	__dirname +
	'/../../assets/tmp/'
);

module.exports = {
	name: 'undermybed',
	description: 'Dad, there\'s a ___ under my bed',
	execute: (message, args) => new Promise((resolve, reject) => {
		if (args.length < 2) {
			message.channel.send(`
				**deepfake**
				${process.env.PREFIX}undermybed <@user> <what's under your bed>
			`.replace(/\t+/g, ''));

			resolve();
			return;
		}

		const id = crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10)
		
		const userID = args[0].replace(/\W/g, '');
		message.guild.members.fetch(userID).then(fakeMember => {
			const avatarURL = fakeMember.user.avatarURL({size: 256});

			args.shift();

			//convert -size 256x256 xc:Black -fill White -draw 'circle 128 128 128 1' -alpha Copy mask.png

			const mask = child_process.spawn(
				'convert',
				[
					'-size', '256x256',
					'-fill', 'White',
					'-draw', 'circle 128 128 128 1',
					'-alpha', 'Copy',
					'xc:Black',
					path.resolve(tmpDir, `${id}_mask.png`)
				]
			);
			mask.on('error', e => reject(e));

			mask.on('exit', code => {
				// convert <url> -gravity Center mask.png -compose CopyOpacity -composite -trim avatar.png

				const avatarCrop = child_process.spawn(
					'convert',
					[
						avatarURL,
						'-gravity', 'Center',
						path.resolve(tmpDir, `${id}_mask.png`),
						'-compose', 'CopyOpacity',
						'-composite',
						'-trim',
						path.resolve(tmpDir, `${id}_avatar.png`),
					]
				);
				avatarCrop.on('error', e => reject(e));

				avatarCrop.on('exit', code => {
					// composite -gravity southwest -geometry +50+0 avatar.png under-bed.png tmp.png

					const mergeAvatar = child_process.spawn(
						'composite',
						[
							'-gravity', 'southwest',
							'-geometry', '+50+0',
							path.resolve(tmpDir, `${id}_avatar.png`),
							template,
							path.resolve(tmpDir, `${id}_tmp.png`)
						]
					);
					mergeAvatar.on('error', e => reject(e));

					mergeAvatar.on('exit', code => {
						// convert -gravity Center -size 130x50 -background '#00000000' -fill black caption:"Dad, there's a bot under my bed" text.png

						const genText = child_process.spawn(
							'convert',
							[
								'-gravity', 'center',
								'-size', '130x50',
								'-background', '#00000000',
								'-fill', 'black',
								`caption:Dad, there's a ${args.join(' ')} under my bed`,
								path.resolve(tmpDir, `${id}_text.png`)
							]
						);
						genText.on('error', e => reject(e));
						genText.on('exit', code => {
							// composite -gravity northwest -geometry +40+35 text.png tmp.png tmp.png
							const finalMerge = child_process.spawn(
								'composite',
								[
									'-gravity', 'northwest',
									'-geometry', '+40+35',
									path.resolve(tmpDir, `${id}_text.png`),
									path.resolve(tmpDir, `${id}_tmp.png`),
									path.resolve(tmpDir, `${id}_tmp.png`)
								]
							);
							finalMerge.on('error', e => reject(e));
							finalMerge.on('exit', code => {
								const file = new Discord.MessageAttachment(path.resolve(tmpDir, `${id}_tmp.png`));
								message.channel.send({ files: [file] });

								setTimeout(() => {
									[
										path.resolve(tmpDir, `${id}_tmp.png`),
										path.resolve(tmpDir, `${id}_mask.png`),
										path.resolve(tmpDir, `${id}_avatar.png`),
										path.resolve(tmpDir, `${id}_text.png`)
									].forEach(file => {
										try {
											fs.unlinkSync(file);
										} catch (e) {
											console.error(`Error removing file ${file}`, e);
										}
									})
								}, 30 * 1000);
								resolve();
							});
						});
					});
				});
			});
		}, e => {
			console.error(e);
			message.channel.send('User not found!');
			resolve();
		});
	}),
};