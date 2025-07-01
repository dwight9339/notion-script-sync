import { Args, Command } from "@oclif/core";
import { Config } from "@sprongus/core";

export default class ConfigGet extends Command {
  static args = {
    key: Args.string({ description: "The config key to retrieve", required: true })
  };
  static description = "Retrieve a configuration value";
  static examples = [
    `<%= config.bin %> <%= command.id %> notionToken`
  ];


  async run(): Promise<void> {
    const { args } = await this.parse(ConfigGet);
    const value = Config.getConfigValue(args.key);
    if (value === undefined) {
      this.log(`${args.key} is not set.`);
    } else {
      this.log(`${args.key} = ${value}`);
    }
  }
}
