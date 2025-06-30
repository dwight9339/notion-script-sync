import { Command } from "@oclif/core";
import { Config } from "@sprongus/core";

export default class ConfigPath extends Command {
  static description = "Show the path to the Sprongus config file";
  static examples = [
    `<%= config.bin %> <%= command.id %>`
  ];

  async run(): Promise<void> {
    const configPath = Config.getConfigFilePath();
    this.log(configPath);
  }
}