import {
  type Stmt,
  type Expr,
  type Program,
  type BinaryExpr,
  type Identifier,
  type NumericLiteral,
  type VarDeclaration,
  type AssignmentExpr,
  type ObjectLiteral,
  type Property,
  type CallExpr,
  type MemberExpr,
  type FunctionDeclaration,
  type StringLiteral,
  type WhileStmt,
  type ArrayLiteral,
  type LambdaExpr,
  type ImportDeclaration,
  type ExportDeclaration,
  type AwaitExpr,
} from "./ast";
import { tokenise, type Token, TokenType } from "./lexer";

export default class Parser {
  private tokens: Token[] = [];

  private notEOF(): boolean {
    return this.tokens[0]?.type !== TokenType.EOF;
  }

  private at(): Token {
    return this.tokens[0] as Token;
  }

  private peek(): Token {
    return this.tokens[1] as Token;
  }

  private eat(): Token {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, msg: string): Token {
    const prev = this.eat();
    if (prev.type !== type) {
      throw `${msg} ${JSON.stringify(prev)} - Expecting: ${type} at ${this.filename}:${prev.line}:${prev.column}`;
    }
    return prev;
  }

  private filename: string = "";

  public produceAST(sourceCode: string, filename: string): Program {
    this.filename = filename;
    this.tokens = tokenise(sourceCode, filename);
    const program: Program = { kind: "Program", body: [], line: 0, column: 0 };

    // Parse until the end of the file
    while (this.notEOF()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  private parse_stmt(): Stmt {
    // skip to parse_expr
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();

      case TokenType.Fn: {
        const fn = this.parse_function_declaration(false);
        if (this.at().type === TokenType.Semicolon) this.eat();
        return fn;
      }

      case TokenType.Async: {
        if (this.peek().type === TokenType.Fn) {
          const fn = this.parse_function_declaration(true);
          if (this.at().type === TokenType.Semicolon) this.eat();
          return fn;
        }
        // Fall back to expr (for async lambdas)
        const expr = this.parse_expr();
        if (this.at().type === TokenType.Semicolon) this.eat();
        return expr;
      }

      case TokenType.If: {
        const ifStmt = this.parse_if_stmt();
        if (this.at().type === TokenType.Semicolon) this.eat();
        return ifStmt;
      }

      case TokenType.While: {
        const whileStmt = this.parse_while_stmt();
        if (this.at().type === TokenType.Semicolon) this.eat();
        return whileStmt;
      }

      case TokenType.Import: {
        const importStmt = this.parse_import_declaration();
        if (this.at().type === TokenType.Semicolon) this.eat();
        return importStmt;
      }

      case TokenType.Export: {
        const exportStmt = this.parse_export_declaration();
        if (this.at().type === TokenType.Semicolon) this.eat();
        return exportStmt;
      }

      default: {
        const expr = this.parse_expr();
        if (this.at().type === TokenType.Semicolon) {
          this.eat();
        }
        return expr;
      }
    }
  }

  private parse_while_stmt(): Stmt {
    this.eat(); // consume while
    this.expect(TokenType.OpenParen, "Expected '(' after while");
    const condition = this.parse_expr();
    this.expect(TokenType.CloseParen, "Expected ')' after while condition");

    this.expect(TokenType.OpenBrace, "Expected '{' after while condition");
    const body: Stmt[] = [];
    while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
      body.push(this.parse_stmt());
    }
    this.expect(TokenType.CloseBrace, "Expected '}' after while body");

    return {
      kind: "WhileStmt",
      condition,
      body,
    } as WhileStmt;
  }

  private parse_if_stmt(): Stmt {
    this.eat(); // consume if
    this.expect(TokenType.OpenParen, "Expected '(' after if");
    const condition = this.parse_expr();
    this.expect(TokenType.CloseParen, "Expected ')' after if condition");

    this.expect(TokenType.OpenBrace, "Expected '{' after if condition");
    const thenBranch: Stmt[] = [];
    while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
      thenBranch.push(this.parse_stmt());
    }
    this.expect(TokenType.CloseBrace, "Expected '}' after if body");

    let elseBranch: Stmt[] | undefined;
    if (this.at().type === TokenType.Else) {
      this.eat(); // consume else
      if (this.at().type === TokenType.If) {
        elseBranch = [this.parse_if_stmt()];
      } else {
        this.expect(TokenType.OpenBrace, "Expected '{' after else");
        elseBranch = [];
        while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
          elseBranch.push(this.parse_stmt());
        }
        this.expect(TokenType.CloseBrace, "Expected '}' after else body");
      }
    }

    return {
      kind: "IfStmt",
      condition,
      thenBranch,
      elseBranch,
      line: 0,
      column: 0,
    } as any;
  }

  private parse_function_declaration(isAsync: boolean): Stmt {
    const line = this.at().line;
    const column = this.at().column;
    if (isAsync) this.eat(); // consume async
    this.eat(); // consume fn

    const name = this.expect(
      TokenType.Identifier,
      "Expected function name following fn keyword",
    ).value;

    const args = this.parse_args();
    const params: string[] = [];

    for (const arg of args) {
      if (arg.kind !== "Identifier") {
        throw "Expected function parameter to be of type string.";
      }

      params.push((arg as Identifier).symbol);
    }

    this.expect(
      TokenType.OpenBrace,
      "Expected '{' following function parameters",
    );

    const body: Stmt[] = [];

    while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
      body.push(this.parse_stmt());
    }

    this.expect(TokenType.CloseBrace, "Expected '}' following function body");

    const fn = {
      kind: "FunctionDeclaration",
      name,
      parameters: params,
      body,
      async: isAsync,
      line,
      column,
    } as FunctionDeclaration;

    return fn;
  }

  private parse_var_declaration(): Stmt {
    const line = this.at().line;
    const column = this.at().column;
    const isConst = this.eat().type === TokenType.Const;

    let identifier = "";
    let identifiers: string[] | undefined;

    if (this.at().type === TokenType.OpenParen) {
      this.eat(); // consume (
      identifiers = [];
      while (this.notEOF() && this.at().type !== TokenType.CloseParen) {
        identifiers.push(
          this.expect(
            TokenType.Identifier,
            "Expected identifier in destructuring",
          ).value,
        );
        if (this.at().type === TokenType.Comma) {
          this.eat();
        }
      }
      this.expect(TokenType.CloseParen, "Expected ')' after destructuring");
    } else {
      identifier = this.expect(
        TokenType.Identifier,
        "Expected identifier name following let | const keywords",
      ).value;
    }

    if (this.at().type === TokenType.Semicolon) {
      this.eat();
      if (isConst) {
        throw "Must assign value to constant expression. No value provided";
      }

      return {
        kind: "VarDeclaration",
        identifier,
        identifiers,
        constant: isConst,
        line,
        column,
      } as VarDeclaration;
    }

    this.expect(TokenType.Equals, "Expected '=' after variable declaration");
    const value = this.parse_expr();

    if (this.at().type === TokenType.Semicolon) {
      this.eat();
    }

    return {
      kind: "VarDeclaration",
      identifier,
      identifiers,
      constant: isConst,
      value,
      line,
      column,
    } as VarDeclaration;
  }

  private parse_import_declaration(): Stmt {
    this.eat(); // consume import

    this.expect(TokenType.OpenBrace, "Expected '{' after import");
    const specifiers: string[] = [];

    while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
      specifiers.push(
        this.expect(TokenType.Identifier, "Expected identifier in import list")
          .value,
      );
      if (this.at().type === TokenType.Comma) {
        this.eat();
      }
    }

    this.expect(TokenType.CloseBrace, "Expected '}' after import list");
    this.expect(TokenType.From, "Expected 'from' after import specifiers");
    const source = this.expect(
      TokenType.String,
      "Expected string literal for import source",
    ).value;

    if (this.at().type === TokenType.Semicolon) {
      this.eat();
    }

    return {
      kind: "ImportDeclaration",
      source,
      specifiers,
      line: this.at().line,
      column: this.at().column,
    } as ImportDeclaration;
  }

  private parse_export_declaration(): Stmt {
    this.eat(); // consume export
    const declaration = this.parse_stmt();

    if (
      declaration.kind !== "VarDeclaration" &&
      declaration.kind !== "FunctionDeclaration"
    ) {
      throw "Export declaration must be a variable or function declaration.";
    }

    return {
      kind: "ExportDeclaration",
      declaration,
      line: this.at().line,
      column: this.at().column,
    } as ExportDeclaration;
  }

  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  private parse_assignment_expr(): Expr {
    const left = this.parse_logical_or_expr();

    if (this.at().type === TokenType.Equals) {
      const line = this.at().line;
      const column = this.at().column;
      this.eat();

      const value = this.parse_assignment_expr();

      if (this.at().type === TokenType.Semicolon) {
        this.eat();
      }

      return {
        kind: "AssignmentExpr",
        assignee: left,
        value,
        line,
        column,
      } as AssignmentExpr;
    }

    return left;
  }

  private parse_logical_or_expr(): Expr {
    let left = this.parse_logical_and_expr();

    while (this.at().type === TokenType.BarBar) {
      const operator = this.eat().value;
      const right = this.parse_logical_and_expr();
      left = {
        kind: "BinaryExpr",
        operator,
        left,
        right,
        line: this.at().line,
        column: this.at().column,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_logical_and_expr(): Expr {
    let left = this.parse_object_expr();

    while (this.at().type === TokenType.AmpersandAmpersand) {
      const operator = this.eat().value;
      const right = this.parse_object_expr();
      left = {
        kind: "BinaryExpr",
        operator,
        left,
        right,
        line: this.at().line,
        column: this.at().column,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_object_expr(): Expr {
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parse_comparison_expr();
    }

    this.eat(); // consume '{'
    const properties = new Array<Property>();

    while (this.notEOF() && this.at().type != TokenType.CloseBrace) {
      const token = this.eat();
      let key: string;

      if (
        token.type === TokenType.Identifier ||
        token.type === TokenType.String
      ) {
        key = token.value;
      } else {
        throw `Object literal key expected, got ${TokenType[token.type]} at ${this.filename}:${token.line}:${token.column}`;
      }

      if (this.at().type === TokenType.Comma) {
        this.eat();
        properties.push({
          kind: "Property",
          key,
          line: this.at().line,
          column: this.at().column,
        });
        continue;
      } else if (this.at().type === TokenType.CloseBrace) {
        properties.push({
          kind: "Property",
          key,
          line: this.at().line,
          column: this.at().column,
        });
        continue;
      }

      this.expect(
        TokenType.Colon,
        "Missing colon following identifier in Object Literal",
      );
      const value = this.parse_expr();

      properties.push({ kind: "Property", key, value } as Property);

      if (this.at().type === TokenType.Comma) {
        this.eat();
      }
    }

    this.expect(TokenType.CloseBrace, "Expected '}' closing object literal");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  private parse_comparison_expr(): Expr {
    let left = this.parse_additive_expr();

    while (
      this.at().type === TokenType.LessThan ||
      this.at().type === TokenType.GreaterThan ||
      this.at().type === TokenType.LessThanEquals ||
      this.at().type === TokenType.GreaterThanEquals ||
      this.at().type === TokenType.EqualsEquals ||
      this.at().type === TokenType.NotEquals
    ) {
      const operator = this.eat().value;
      const right = this.parse_additive_expr();
      left = {
        kind: "BinaryExpr",
        operator,
        left,
        right,
        line: this.at().line,
        column: this.at().column,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicative_expr();

    while (this.at().value === "+" || this.at().value === "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicative_expr();
      left = {
        kind: "BinaryExpr",
        operator,
        left,
        right,
        line: this.at().line,
        column: this.at().column,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_multiplicative_expr(): Expr {
    let left = this.parse_unary_expr();

    while (
      this.at().value === "*" ||
      this.at().value === "/" ||
      this.at().value === "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_unary_expr();
      left = {
        kind: "BinaryExpr",
        operator,
        left,
        right,
        line: this.at().line,
        column: this.at().column,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_unary_expr(): Expr {
    if (
      this.at().type === TokenType.Bang ||
      this.at().type === TokenType.Await ||
      (this.at().type === TokenType.BinaryOperator && this.at().value === "-")
    ) {
      const token = this.eat();
      const operator = token.value;
      const argument = this.parse_unary_expr();

      if (token.type === TokenType.Await) {
        return {
          kind: "AwaitExpr",
          argument,
          line: token.line,
          column: token.column,
        } as AwaitExpr;
      }

      return {
        kind: "UnaryExpr",
        operator,
        argument,
        line: this.at().line,
        column: this.at().column,
      } as any;
    }

    return this.parse_call_member_expr();
  }

  private parse_call_member_expr(): Expr {
    const member = this.parse_member_expr();

    if (this.at().type === TokenType.OpenParen) {
      return this.parse_call_expr(member);
    }

    return member;
  }

  private parse_call_expr(caller: Expr): Expr {
    let call_expr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parse_args(),
      line: this.at().line,
      column: this.at().column,
    } as CallExpr;

    if (this.at().type === TokenType.OpenParen) {
      call_expr = this.parse_call_expr(call_expr);
    }

    return call_expr;
  }

  private parse_args(): Expr[] {
    this.expect(TokenType.OpenParen, "Expected '(' after function call");

    const args =
      this.at().type === TokenType.CloseParen
        ? []
        : this.parse_arguments_list();

    this.expect(TokenType.CloseParen, "Expected ')' after function call");

    return args;
  }

  private parse_arguments_list(): Expr[] {
    const args = [this.parse_assignment_expr()];

    while (this.at().type === TokenType.Comma && this.eat()) {
      args.push(this.parse_assignment_expr());
    }

    return args;
  }

  private parse_member_expr(): Expr {
    let object = this.parse_primary_expr();

    while (
      this.at().type === TokenType.Dot ||
      this.at().type === TokenType.OpenBracket
    ) {
      const operator = this.eat();
      let property: Expr;
      let computed: boolean;

      // non-computed values aka object.expr
      if (operator.type === TokenType.Dot) {
        computed = false;
        property = this.parse_primary_expr();

        if (property.kind !== "Identifier") {
          throw "Cannot use dot operator without right hand side being an identifier";
        }
      } else {
        // this allows obj[computedValue]
        computed = true;
        property = this.parse_expr();

        this.expect(
          TokenType.CloseBracket,
          "Expected ']' after computed property",
        );
      }

      object = {
        kind: "MemberExpr",
        object,
        property,
        computed,
        line: this.at().line,
        column: this.at().column,
      } as MemberExpr;
    }

    return object;
  }

  private isLambda(): boolean {
    if (this.at().type !== TokenType.OpenParen) return false;

    let parenCount = 0;
    for (let i = 0; i < this.tokens.length; i++) {
      const type = this.tokens[i]!.type;
      if (type === TokenType.OpenParen) parenCount++;
      else if (type === TokenType.CloseParen) {
        parenCount--;
        if (parenCount === 0) {
          return this.tokens[i + 1]?.type === TokenType.Arrow;
        }
      } else if (type === TokenType.EOF) return false;
    }
    return false;
  }

  private parse_lambda_expr(): Expr {
    this.expect(TokenType.OpenParen, "Expected '(' at start of lambda");

    const params: string[] = [];
    if (this.at().type !== TokenType.CloseParen) {
      params.push(
        this.expect(
          TokenType.Identifier,
          "Expected identifier in lambda params",
        ).value,
      );
      while (this.at().type === TokenType.Comma) {
        this.eat();
        params.push(
          this.expect(
            TokenType.Identifier,
            "Expected identifier after comma in lambda params",
          ).value,
        );
      }
    }

    this.expect(TokenType.CloseParen, "Expected ')' after lambda params");
    this.expect(TokenType.Arrow, "Expected '->' after lambda params");

    const body: Stmt[] = [];
    if (this.at().type === TokenType.OpenBrace) {
      this.eat();
      while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
        body.push(this.parse_stmt());
      }
      this.expect(TokenType.CloseBrace, "Expected '}' after lambda body");
    } else {
      body.push(this.parse_expr());
    }

    return {
      kind: "LambdaExpr",
      parameters: params,
      body,
      async: false, // TODO: support async lambdas if needed
      line: this.at().line,
      column: this.at().column,
    } as LambdaExpr;
  }

  private parse_primary_expr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return {
          kind: "Identifier",
          line: this.at().line,
          column: this.at().column,
          symbol: this.eat().value,
        } as Identifier;

      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          line: this.at().line,
          column: this.at().column,
          value: parseFloat(this.eat().value),
        } as NumericLiteral;

      case TokenType.String:
        return {
          kind: "StringLiteral",
          line: this.at().line,
          column: this.at().column,
          value: this.eat().value,
        } as StringLiteral;

      case TokenType.OpenParen:
        if (this.isLambda()) {
          return this.parse_lambda_expr();
        }
        this.eat(); // eat the opening paren
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parentheses expression. Expected ')' closing parenthesis.",
        ); // eat the closing paren
        return value;

      case TokenType.OpenBracket:
        return this.parse_array_literal();

      default:
        throw `Unexpected token found during parsing at ${this.filename}:${this.at().line}:${this.at().column}: ${JSON.stringify(this.at())}`;
    }
  }

  private parse_array_literal(): Expr {
    this.eat(); // [
    const elements = new Array<Expr>();

    while (this.notEOF() && this.at().type !== TokenType.CloseBracket) {
      elements.push(this.parse_expr());
      if (this.at().type === TokenType.Comma) {
        this.eat();
      }
    }

    this.expect(TokenType.CloseBracket, "Expected ']' after array literal");

    return {
      kind: "ArrayLiteral",
      elements,
    } as ArrayLiteral;
  }
}
