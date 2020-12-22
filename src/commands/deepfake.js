const Discord = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');
const child_process = require('child_process');
const path = require('path');

const tmpDir = path.resolve(
	__dirname +
	'/../../assets/tmp/'
);

module.exports = {
	name: 'deepfake',
	description: 'User says ___',
	execute: (message, args) => new Promise((resolve, reject) => {
		if (args.length < 2) {
			message.channel.send(`
				**deepfake**
				${process.env.PREFIX}deepfake <@user> <what @user says>
			`.replace(/\t+/g, ''));

			resolve();
			return;
		}

		const id = crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10)
		
		const userID = args[0].replace(/\W/g, '');
		message.guild.members.fetch(userID).then(fakeMember => {
			const avatarURL = fakeMember.user.avatarURL();
			const displayColor = fakeMember.displayHexColor;
			const displayName = fakeMember.displayName;

			args.shift()

			// convert -size 80x80 xc:Black -fill White -draw 'circle 40 40 40 1' -alpha Copy <id>_mask.png

			const mask = child_process.spawn(
				'convert',
				[
					'-size', '80x80',
					'-fill', 'White',
					'-draw', 'circle 40 40 40 1',
					'-alpha', 'Copy',
					'xc:Black',
					path.resolve(tmpDir, `${id}_mask.png`)
				]
			);
			mask.on('error', e => reject(e));

			mask.on('exit', code => {
				// convert <url> -resize 80x80 - | convert - -gravity Center mask.png -compose CopyOpacity -composite -trim <id>_avatar.png

				const avatarResize = child_process.spawn(
					'convert',
					[
						avatarURL,
						'-resize', '80x80',
						'-'
					]
				);
				avatarResize.on('error', e => reject(e));
				const avatarCrop = child_process.spawn(
					'convert',
					[
						'-',
						'-gravity', 'Center',
						path.resolve(tmpDir, `${id}_mask.png`),
						'-compose', 'CopyOpacity',
						'-composite',
						'-trim',
						path.resolve(tmpDir, `${id}_avatar.png`)
					]
				);
				avatarCrop.on('error', e => reject(e));
				avatarResize.stdout.pipe(avatarCrop.stdin);

				avatarCrop.on('exit', code => {
					// convert -size 600x -gravity NorthWest -splice 140x80 -background '#36393fff' -fill '#c9c9cbff' -pointsize 27 caption:'blah' - | convert - -background '#36393fff' -gravity South -splice 0x35 tmp.png
					const base = child_process.spawn(
						'convert',
						[
							'-size', '565x',
							'-gravity', 'NorthWest',
							'-splice', '140x80',
							'-background', '#36393fff',
							'-fill', '#c9c9cbff',
							'-pointsize', '27',
							`caption:${args.join(' ')}`,
							'miff:-'
						]
					);
					base.on('error', e => reject(e));
					const baseSplice = child_process.spawn(
						'convert',
						[
							'-',
							'-background', '#36393fff',
							'-gravity', 'SouthEast',
							'-splice', '35x35',
							path.resolve(tmpDir, `${id}_tmp.png`)
						]
					);
					baseSplice.on('error', e => reject(e));
					base.stdout.pipe(baseSplice.stdin);

					baseSplice.on('exit', code => {
						// composite -gravity northwest -geometry +30+35 <id>_avatar.png <id>_tmp.png <id>_tmp.png
						const placeAvatar = child_process.spawn(
							'composite',
							[
								'-gravity', 'NorthWest',
								'-geometry', '+30+35',
								path.resolve(tmpDir, `${id}_avatar.png`),
								path.resolve(tmpDir, `${id}_tmp.png`),
								path.resolve(tmpDir, `${id}_tmp.png`)
							]
						);
						placeAvatar.on('error', e => reject(e));
						placeAvatar.on('exit', code => {
							// convert -gravity East -splice 18x0 -background '#00000000' -fill <color> -pointsize 27 label:<username> <id>_name.png
							const nameText = child_process.spawn(
								'convert',
								[
									'-gravity', 'East',
									'-splice', '10x0',
									'-background', '#00000000',
									'-fill', displayColor,
									'-pointsize', '27',
									`label:${displayName}`,
									path.resolve(tmpDir, `${id}_name.png`)
								]
							);
							nameText.on('error', e => reject(e));
							nameText.on('exit', code => {
								const timeString = 'Today at ' + (new Date()).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
								// convert -background '#00000000' -fill '#6d7177ff' -pointsize 20 label:'Today at <time>' <id>_time.png
								const timeText = child_process.spawn(
									'convert',
									[
										'-background', '#00000000',
										'-fill', '#6d7177ff',
										'-gravity', 'SouthWest',
										'-splice', '0x2',
										'-pointsize', '20',
										`label:${timeString}`,
										path.resolve(tmpDir, `${id}_time.png`)
									]
								);
								timeText.on('error', e => reject(e));
								timeText.on('exit', code => {
									// convert -background '#00000000' -gravity SouthWest <id>_name.png <id>_time.png +append -
									const mergeHeaders = child_process.spawn(
										'convert',
										[
											'-background', '#00000000',
											'-gravity', 'SouthWest',
											path.resolve(tmpDir, `${id}_name.png`),
											path.resolve(tmpDir, `${id}_time.png`),
											'+append',
											'-'
										]
									);
									mergeHeaders.on('error', e => reject(e));
									// composite -gravity northwest -geometry +140+39 - <id>_tmp.png <id>_tmp.png
									const finalMerge = child_process.spawn(
										'composite',
										[
											'-gravity', 'NorthWest',
											'-geometry', '+140+39',
											'-',
											path.resolve(tmpDir, `${id}_tmp.png`),
											path.resolve(tmpDir, `${id}_tmp.png`)
										]
									);
									finalMerge.on('error', e => reject(e));

									mergeHeaders.stdout.pipe(finalMerge.stdin);

									finalMerge.on('exit', code => {
										const file = new Discord.MessageAttachment(path.resolve(tmpDir, `${id}_tmp.png`));
										message.channel.send({ files: [file] });

										setTimeout(() => {
											[
												path.resolve(tmpDir, `${id}_tmp.png`),
												path.resolve(tmpDir, `${id}_mask.png`),
												path.resolve(tmpDir, `${id}_avatar.png`),
												path.resolve(tmpDir, `${id}_name.png`),
												path.resolve(tmpDir, `${id}_time.png`)
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
				});
			});
		}, e => {
			console.error(e);
			message.channel.send('User not found!');
			resolve();
		});
	}),
};