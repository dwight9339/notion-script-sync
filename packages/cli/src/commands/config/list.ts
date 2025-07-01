import { Command } from "@oclif/core";
import { Config } from "@sprongus/core";

export default class ConfigList extends Command {
  static description = "List all configuration settings";
  static examples = [
    `<%= config.bin %> <%= command.id %>`
  ];

  async run(): Promise<void> {
    const config = Config.listConfig();
    const keys = Object.keys(config);
    if (keys.length === 0) {
      this.log("No config values set.");
      return;
    }

    for (const key of keys) {
      this.log(`${key} = ${config[key]}`);
    }
  }
}
