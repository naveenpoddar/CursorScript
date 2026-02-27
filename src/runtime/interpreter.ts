import {
  MK_NULL,
  type NumberValue,
  type RuntimeValue,
  type StringValue,
  type ValueType,
  MK_REGEX,
} from "./values";
import type {
  ArrayLiteral,
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  FunctionDeclaration,
  Identifier,
  IfStmt,
  MemberExpr,
  NodeType,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Stmt,
  StringLiteral,
  UnaryExpr,
  VarDeclaration,
  WhileStmt,
  LambdaExpr,
  ImportDeclaration,
  ExportDeclaration,
  AwaitExpr,
  RegexLiteral,
} from "../frontend/ast";
import type Environment from "./environment";
import {
  evaluateFunctionDeclaration,
  evaluateIfStmt,
  evaluateWhileStmt,
  evaluateProgram,
  evaluateVarDeclaration,
  evaluateImportDeclaration,
  evaluateExportDeclaration,
} from "./eval/statements";

import {
  evalObjectExpr,
  evaluateArrayLiteral,
  evaluateAssignment,
  evaluateBinaryExpr,
  evaluateCallExpr,
  evaluateIdentifier,
  evaluateMemberExpr,
  evaluateUnaryExpr,
  evaluateLambdaExpr,
  evaluateAwaitExpr,
} from "./eval/expressions";

export async function evaluate(
  astNode: Stmt,
  env: Environment,
): Promise<RuntimeValue> {
  global.lastStmt = astNode;
  try {
    switch (astNode.kind) {
      case "NumericLiteral":
        return {
          type: "number",
          value: (astNode as NumericLiteral).value,
        } as NumberValue;

      case "StringLiteral":
        return {
          type: "string",
          value: (astNode as StringLiteral).value,
        } as StringValue;

      case "RegexLiteral":
        return MK_REGEX(new RegExp((astNode as RegexLiteral).value));

      case "Identifier":
        return evaluateIdentifier(astNode as Identifier, env);

      case "MemberExpr":
        return await evaluateMemberExpr(astNode as MemberExpr, env);

      case "ObjectLiteral":
        return await evalObjectExpr(astNode as ObjectLiteral, env);

      case "ArrayLiteral":
        return await evaluateArrayLiteral(astNode as ArrayLiteral, env);

      case "CallExpr":
        return await evaluateCallExpr(astNode as CallExpr, env);

      case "AssignmentExpr":
        return await evaluateAssignment(astNode as AssignmentExpr, env);

      case "BinaryExpr":
        return await evaluateBinaryExpr(astNode as BinaryExpr, env);

      case "UnaryExpr":
        return await evaluateUnaryExpr(astNode as UnaryExpr, env);

      case "AwaitExpr":
        return await evaluateAwaitExpr(astNode as AwaitExpr, env);

      case "Program":
        return await evaluateProgram(astNode as Program, env);

      case "VarDeclaration":
        return await evaluateVarDeclaration(astNode as VarDeclaration, env);

      case "FunctionDeclaration":
        return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env);

      case "IfStmt":
        return await evaluateIfStmt(astNode as IfStmt, env);

      case "WhileStmt":
        return await evaluateWhileStmt(astNode as WhileStmt, env);

      case "ImportDeclaration":
        return await evaluateImportDeclaration(
          astNode as ImportDeclaration,
          env,
        );

      case "ExportDeclaration":
        return await evaluateExportDeclaration(
          astNode as ExportDeclaration,
          env,
        );

      case "LambdaExpr":
        return evaluateLambdaExpr(astNode as LambdaExpr, env);

      default:
        console.error(
          "This AST Node has not yet been setup for interpretation",
          astNode,
          astNode.line,
          astNode.column,
        );
        process.exit(0);
    }
  } catch (e: any) {
    if (e && e.hasLineInfo) throw e;

    // Convert to standard error with line numbers
    const errorMsg = e instanceof Error ? e.message : String(e);
    const err = new Error(
      `${errorMsg} at line ${astNode.line ?? 0}, column ${astNode.column ?? 0}`,
    );
    (err as any).hasLineInfo = true;
    throw err;
  }
}
