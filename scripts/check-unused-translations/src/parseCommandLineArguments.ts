// Parse command line arguments
export function parseCommandLineArguments<T extends string>(options: {
  /**
   * The arguments from the command line in the format:
   * --param1 value1 --param2 value2
   */
  argv: string[];
}): { [key in T]: string | undefined } {
  const args = options.argv.slice(2);
  const parsedOptions: { [key in T]: string } = {} as { [key in T]: string };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[i + 1];

      if (!value || value.startsWith("--")) {
        console.error(`Error: Missing value for argument ${arg}`);
        process.exit(1);
      }

      parsedOptions[key as T] = value;
      i++; // Skip the next argument since we consumed it
    }
  }

  return parsedOptions;
}
