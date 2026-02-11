import {
  MK_NULL,
  type NumberValue,
  type RuntimeValue,
  type StringValue,
  type ValueType,
} from "./values";
import type {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  FunctionDeclaration,
  Identifier,
  MemberExpr,
  NodeType,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Stmt,
  StringLiteral,
  VarDeclaration,
} from "../frontend/ast";
import type Environment from "./environment";
import {
  evaluateFunctionDeclaration,
  evaluateProgram,
  evaluateVarDeclaration,
} from "./eval/statements";
import {
  evalCallExpr,
  evalObjectExpr,
  evaluateAssignment,
  evaluateBinaryExpr,
  evaluateIdentifier,
  evaluateMemberExpr,
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

    case "CallExpr":
      return evalCallExpr(astNode as CallExpr, env);

    case "AssignmentExpr":
      return evaluateAssignment(astNode as AssignmentExpr, env);

    case "BinaryExpr":
      return evaluateBinaryExpr(astNode as BinaryExpr, env);

    case "Program":
      return evaluateProgram(astNode as Program, env);

    case "VarDeclaration":
      return evaluateVarDeclaration(astNode as VarDeclaration, env);

    case "FunctionDeclaration":
      return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env);

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
