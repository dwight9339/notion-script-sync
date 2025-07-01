import { Args, Command } from "@oclif/core";
import { Config } from "@sprongus/core";

export default class ConfigUnset extends Command {
  static args = {
    key: Args.string({ description: "The config key to remove", required: true })
  };
  static description = "Remove a config key";
  static examples = [
    `<%= config.bin %> <%= command.id %> notionToken`
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(ConfigUnset);
    Config.unsetConfigValue(args.key);
    this.log(`Unset ${args.key}`);
  }
}
