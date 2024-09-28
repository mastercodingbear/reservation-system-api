import { createDefaultPreset, JestConfigWithTsJest } from "ts-jest";

const defaultPreset = createDefaultPreset();

const jestConfig: JestConfigWithTsJest = {
  ...defaultPreset,
};

export default jestConfig;
