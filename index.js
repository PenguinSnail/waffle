const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

const remarkFiles = fs.readdirSync('./src/remarks').filter(file => file.endsWith('.js'));
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

client.remarks = new Array();
client.commands = new Discord.Collection();

for (const file of remarkFiles) {
	const remark = require(`./src/remarks/${file}`);
	client.remarks.push(remark);
}
for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('message', message => {
	if (message.author.bot) return;
	
	client.remarks.forEach(remark => {
		if (remark.check(message)) {
			remark.execute(message);
			return;
		}
	});

	if (!message.content.startsWith(process.env.PREFIX)) return;

	const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;

	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(process.env.DISCORD_TOKEN);