import { MathL } from "../lib/MathLib";
import {
  MK_BOOL,
  MK_NULL,
  MK_NATIVE_FN,
  type RuntimeValue,
  MK_NUMBER,
  MakePrintable,
  MK_STRING,
  type StringValue,
  type NumberValue,
} from "./values";

export function createGlobalEnv() {
  const env = new Environment();
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);

  // Define a native build in method
  env.declareVar(
    "print",
    MK_NATIVE_FN((_args, scope) => {
      const args = _args.map(MakePrintable);
      console.log(...args);
      return MK_NULL();
    }),
    true,
  );

  function timeFunc(): RuntimeValue {
    return MK_NUMBER(Date.now());
  }

  env.declareVar("time", MK_NATIVE_FN(timeFunc), true);

  env.declareVar(
    "exit",
    MK_NATIVE_FN(() => {
      process.exit(1);
    }),
    true,
  );

  env.declareVar(
    "clear",
    MK_NATIVE_FN(() => {
      console.clear();
      return MK_NULL();
    }),
    true,
  );

  env.declareVar(
    "help",
    MK_NATIVE_FN(() => {
      console.log("[====================================================]");
      console.log("Available commands:");
      console.log("print(args...) - prints any value");
      console.log("time() - returns the current time in milliseconds");
      console.log("exit() - exits the program");
      console.log("clear() - clears the console");
      console.log("[====================================================]");
      return MK_NULL();
    }),
    true,
  );

  env.declareVar("dir", MK_STRING(process.cwd()), true);

  env.declareVar(
    "rand",
    MK_NATIVE_FN(([start, end], scope) => {
      const s = start as NumberValue;
      const e = end as NumberValue;

      if (s.type !== "number" || e.type !== "number") {
        throw "rand() expects two arguments of type number.";
      }

      return MK_NUMBER(
        Math.floor(Math.random() * (e.value - s.value + 1)) + s.value,
      );
    }),
    true,
  );

  env.declareVar(
    "len",
    MK_NATIVE_FN((args, scope) => {
      const arg = args[0] as StringValue;

      if (arg.type !== "string") {
        throw "len() expects one argument of type string.";
      }

      return MK_NUMBER(arg.value.length);
    }),
    true,
  );

  env.declareVar(
    "str",
    MK_NATIVE_FN((args, scope) => {
      const arg = args[0] as RuntimeValue;
      const strValue = MakePrintable(arg);

      return strValue !== null ? MK_STRING(String(strValue)) : MK_NULL();
    }),
    true,
  );

  env.declareVar(
    "typeof",
    MK_NATIVE_FN((args, scope) => {
      const arg = args[0] as RuntimeValue;

      return MK_STRING(arg.type);
    }),
    true,
  );

  env.declareVar(
    "concat",
    MK_NATIVE_FN((args, scope) => {
      const strings = args.map((arg) => {
        const strValue = MakePrintable(arg);
        return strValue !== null ? String(strValue) : "";
      });

      return MK_STRING(strings.join(" "));
    }),
    true,
  );

  env.declareVar("Math", MathL, true);

  // TODO: readFile, writeFile, deleteFile -> Implment async await

  return env;
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeValue>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVar(
    varname: string,
    value: RuntimeValue,
    isConst: boolean = false,
  ): RuntimeValue {
    if (this.variables.has(varname)) {
      throw `Variable '${varname}' has already been defined.`;
    }

    this.variables.set(varname, value);
    if (isConst) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeValue): RuntimeValue {
    const env = this.resolve(varname);

    if (env.constants.has(varname)) {
      throw `Cannot reassign constant variable '${varname}'.`;
    }

    env.variables.set(varname, value);
    return value;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }

    if (!this.parent) {
      throw `Cannot resolve variable '${varname}' is not defined.`;
    }

    return this.parent.resolve(varname);
  }

  public lookupVar(varname: string): RuntimeValue {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeValue;
  }
}
