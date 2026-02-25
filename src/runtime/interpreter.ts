import {
  MK_NULL,
  type NumberValue,
  type RuntimeValue,
  type StringValue,
  type ValueType,
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
} from "./eval/expressions";

export function evaluate(astNode: Stmt, env: Environment): RuntimeValue {
  global.lastStmt = astNode;
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

    case "Identifier":
      return evaluateIdentifier(astNode as Identifier, env);

    case "MemberExpr":
      return evaluateMemberExpr(astNode as MemberExpr, env);

    case "ObjectLiteral":
      return evalObjectExpr(astNode as ObjectLiteral, env);

    case "ArrayLiteral":
      return evaluateArrayLiteral(astNode as ArrayLiteral, env);

    case "CallExpr":
      return evaluateCallExpr(astNode as CallExpr, env);

    case "AssignmentExpr":
      return evaluateAssignment(astNode as AssignmentExpr, env);

    case "BinaryExpr":
      return evaluateBinaryExpr(astNode as BinaryExpr, env);

    case "UnaryExpr":
      return evaluateUnaryExpr(astNode as UnaryExpr, env);

    case "Program":
      return evaluateProgram(astNode as Program, env);

    case "VarDeclaration":
      return evaluateVarDeclaration(astNode as VarDeclaration, env);

    case "FunctionDeclaration":
      return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env);

    case "IfStmt":
      return evaluateIfStmt(astNode as IfStmt, env);

    case "WhileStmt":
      return evaluateWhileStmt(astNode as WhileStmt, env);

    case "ImportDeclaration":
      return evaluateImportDeclaration(astNode as ImportDeclaration, env);

    case "ExportDeclaration":
      return evaluateExportDeclaration(astNode as ExportDeclaration, env);

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
}
