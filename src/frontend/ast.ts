export type NodeType =
  // Statements
  | "Program"
  | "VarDeclaration"
  | "FunctionDeclaration"
  | "IfStmt"
  | "WhileStmt"
  | "ImportDeclaration"
  | "ExportDeclaration"

  // Expressions
  | "AssignmentExpr"
  | "MemberExpr"
  | "CallExpr"

  // Literals
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral"
  | "StringLiteral"
  | "Identifier"
  | "BinaryExpr"
  | "UnaryExpr"
  | "ArrayLiteral"
  | "LambdaExpr"
  | "AwaitExpr";

export interface LambdaExpr extends Expr {
  kind: "LambdaExpr";
  parameters: string[];
  body: Stmt[];
  async: boolean;
}

export interface AwaitExpr extends Expr {
  kind: "AwaitExpr";
  argument: Expr;
}

// ...
export interface ArrayLiteral extends Expr {
  kind: "ArrayLiteral";
  elements: Expr[];
}

// ...
export interface UnaryExpr extends Expr {
  kind: "UnaryExpr";
  operator: string;
  argument: Expr;
}

export interface Stmt {
  kind: NodeType;
  line: number;
  column: number;
}

export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}

export interface VarDeclaration extends Stmt {
  kind: "VarDeclaration";
  identifier: string;
  identifiers?: string[]; // Support for destructuring like (a, b)
  constant: boolean;
  value?: Expr;
}

export interface FunctionDeclaration extends Stmt {
  kind: "FunctionDeclaration";
  parameters: string[];
  name: string;
  body: Stmt[];
  async: boolean;
}

export interface ImportDeclaration extends Stmt {
  kind: "ImportDeclaration";
  source: string; // "anyfile"
  specifiers: string[]; // ["AnyThing"]
}
export interface ExportDeclaration extends Stmt {
  kind: "ExportDeclaration";
  declaration: Stmt; // The variable or function being exported
}

export interface IfStmt extends Stmt {
  kind: "IfStmt";
  condition: Expr;
  thenBranch: Stmt[];
  elseBranch?: Stmt[];
}

export interface WhileStmt extends Stmt {
  kind: "WhileStmt";
  condition: Expr;
  body: Stmt[];
}

export interface Expr extends Stmt {}

export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assignee: Expr;
  value: Expr;
  identifiers?: string[];
}

export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  operator: string;
  right: Expr;
}

export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}

export interface StringLiteral extends Expr {
  kind: "StringLiteral";
  value: string;
}

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr;
}

export interface ObjectLiteral extends Expr {
  kind: "ObjectLiteral";
  properties: Property[];
}

export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[];
  caller: Expr;
}

export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  object: Expr;
  property: Expr;
  computed: boolean;
}
