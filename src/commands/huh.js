const Discord = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');
const child_process = require('child_process');
const path = require('path');

const template = path.resolve(
	__dirname +
	'/../../assets/templates/huh.png'
);
const tmpDir = path.resolve(
	__dirname +
	'/../../assets/tmp/'
);

const name = 'huh';
const description = 'Huh, I wonder who that\'s for';
const arguments = '<@user>';

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

		const id = crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10)
		
		const userID = args[0].replace(/\W/g, '');
		message.guild.members.fetch(userID).then(fakeMember => {
			const avatarURL = fakeMember.user.avatarURL({size: 512});

			args.shift();

			const avatarResize = child_process.spawn(
				'convert',
				[
					avatarURL,
					'-resize', '100x100',
					path.resolve(tmpDir, `${id}_avatar.png`)
				]
			);
			avatarResize.on('error', e => reject(e));

			avatarResize.on('exit', code => {
				const mergeAvatar = child_process.spawn(
					'composite',
					[
						'-gravity', 'northwest',
						'-geometry', '+155+30',
						path.resolve(tmpDir, `${id}_avatar.png`),
						template,
						path.resolve(tmpDir, `${id}_tmp.png`)
					]
				);
				mergeAvatar.on('error', e => reject(e));

				mergeAvatar.on('exit', code => {
					const mergeAvatar2 = child_process.spawn(
						'composite',
						[
							'-gravity', 'northwest',
							'-geometry', '+35+35',
							path.resolve(tmpDir, `${id}_avatar.png`),
							path.resolve(tmpDir, `${id}_tmp.png`),
							path.resolve(tmpDir, `${id}_tmp.png`)
						]
					);
					mergeAvatar2.on('error', e => reject(e));
	
					mergeAvatar2.on('exit', code => {
						const finalMerge = child_process.spawn(
							'composite',
							[
								template,
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
									path.resolve(tmpDir, `${id}_avatar.png`)
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
		}, e => {
			console.error(e);
			message.channel.send('User not found!');
			resolve();
		});
	}),
};