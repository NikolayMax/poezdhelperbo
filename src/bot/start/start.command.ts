import { Command } from '../../decorator/command.decorator';
import startAction from './start.action';
import { START } from './consts';
import { Context } from 'telegraf';

class StartCommand {
	@Command(START)
	command(ctx: Context) {
		const { text, buttons } = startAction.buttons();
		ctx.reply(text, buttons);
	}
}
const startCommand = new StartCommand();
export default startCommand;
