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

  private eat(): Token {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, msg: string): Token {
    const prev = this.eat();
    if (prev.type !== type) {
      console.error(
        msg,
        prev,
        "- Expecting:",
        type,
        `at ${this.filename}:${prev.line}:${prev.column}`,
      );
      process.exit(1);
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

      case TokenType.Fn:
        return this.parse_function_declaration();

      default:
        return this.parse_expr();
    }
  }

  private parse_function_declaration(): Stmt {
    this.eat();

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
    } as FunctionDeclaration;

    return fn;
  }

  private parse_var_declaration(): Stmt {
    const isConst = this.eat().type === TokenType.Const;

    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name following let | const keywords",
    ).value;

    if (this.at().type === TokenType.Semicolon) {
      this.eat();
      if (isConst) {
        throw "Must assign value to constant expression. No value provided";
      }

      return {
        kind: "VarDeclaration",
        identifier,
        constant: isConst,
      } as VarDeclaration;
    }

    this.expect(TokenType.Equals, "Expected '=' after variable declaration");
    const value = this.parse_expr();

    this.expect(TokenType.Semicolon, "Expected ';' after variable declaration");

    return {
      kind: "VarDeclaration",
      identifier,
      constant: isConst,
      value,
    } as VarDeclaration;
  }

  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  private parse_assignment_expr(): Expr {
    const left = this.parse_object_expr();

    if (this.at().type === TokenType.Equals) {
      const line = this.at().line;
      const column = this.at().column;
      this.eat();

      const value = this.parse_assignment_expr();

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

  private parse_object_expr(): Expr {
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parse_additive_expr();
    }

    this.eat(); // consume '{'
    const properties = new Array<Property>();

    while (this.notEOF() && this.at().type != TokenType.CloseBrace) {
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key expected",
      ).value;

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
    let left = this.parse_call_member_expr();

    while (
      this.at().value === "*" ||
      this.at().value === "/" ||
      this.at().value === "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_call_member_expr();
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
        this.eat(); // eat the opening paren
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parentheses expression. Expected ')' closing parenthesis.",
        ); // eat the closing paren
        return value;

      default:
        console.error(
          `Unexpected token found during parsing at ${this.filename}:${this.at().line}:${this.at().column}:`,
          this.at(),
        );
        process.exit(1);
    }
  }
}
