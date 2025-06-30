import { Args, Command } from "@oclif/core";
import { Config } from "@sprongus/core";

export default class ConfigSet extends Command {
  static args = {
    key: Args.string({ description: "The config key to set", required: true }),
    value: Args.string({ description: "The value to assign", required: true })
  };
  static description = "Set a configuration key/value pair";
  static examples = [
    `<%= config.bin %> <%= command.id %> notionToken sk-abc123`
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(ConfigSet);
    Config.setConfigValue(args.key, args.value);
    this.log(`Set ${args.key}`);
  }
}
