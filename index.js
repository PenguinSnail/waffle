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

const helpMessage = new Discord.MessageEmbed().setTitle('Waffle Help');
helpMessage.addFields(client.commands.map(c => ({
	name: c.name,
	value: `\`${process.env.PREFIX}${c.name} ${c.arguments}\`\n${c.description}\n`
})));
helpMessage.addFields({
	name: 'Remarks',
	value: client.remarks.map(r => r.name).join(', ')
});

client.on('message', message => {
	if (message.author.bot) return;

	if (message.content.toLowerCase().trim() === process.env.PREFIX + 'help') {
		message.channel.send(helpMessage);
		return;
	}
	
	client.remarks.forEach(remark => {
		if (remark.check(message)) {
			message.channel.startTyping();
			remark.execute(message);
			message.channel.stopTyping();
			return;
		}
	});

	if (!message.content.startsWith(process.env.PREFIX)) return;

	const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;

	message.channel.startTyping();
	client.commands.get(command).execute(message, args).then(() => {
		message.channel.stopTyping();
	}, e => {
		console.error(e);
		message.reply('there was an error trying to execute that command!');
		message.channel.stopTyping();
	});
});

client.login(process.env.DISCORD_TOKEN);