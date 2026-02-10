import {
  MK_BOOL,
  MK_NULL,
  MK_NATIVE_FN,
  type RuntimeValue,
  MK_NUMBER,
} from "./values";

export function createGlobalEnv() {
  const env = new Environment();
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);

  // Define a native build in method
  env.declareVar(
    "print",
    MK_NATIVE_FN((args, scope) => {
      console.log(...args);
      return MK_NULL();
    }),
    true,
  );

  function timeFunc(args: RuntimeValue[], scope: Environment): RuntimeValue {
    return MK_NUMBER(Date.now());
  }
  env.declareVar("time", MK_NATIVE_FN(timeFunc), true);

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
