/**
 * Represents the type of a token in the source code.
 */
export enum TokenType {
  // Literal Types
  Null,
  Number,
  Identifier,
  String,

  // Keywords
  Let,
  Const,
  Fn,

  // Operators & Delimiters
  OpenParen, // (
  CloseParen, // )
  OpenBrace, // {
  CloseBrace, // }
  OpenBracket, // [
  CloseBracket, // ]
  BinaryOperator, // +, -, *, /, %
  Equals, // =
  Semicolon, // ;
  Colon, // :
  Comma, // ,
  Dot, // .
  Quote, // "

  EOF, // End of File
}

/**
 * Maps reserved keywords to their corresponding TokenType.
 */
const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
  fn: TokenType.Fn,
};

/**
 * Represents a single token found in the source code.
 */
export interface Token {
  value: string;
  type: TokenType;
  line: number;
}

/**
 * Lexer class responsible for converting source code into a stream of tokens.
 */
class Lexer {
  private source: string;
  private filename: string;
  private tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  constructor(source: string, filename: string) {
    this.source = source;
    this.filename = filename;
  }

  /**
   * Main entry point for tokenization.
   */
  public tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      value: "EndOfFile",
      line: this.line,
    });

    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source.charAt(this.current + 1);
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }

  private addToken(type: TokenType, value?: string): void {
    const text =
      value !== undefined
        ? value
        : this.source.substring(this.start, this.current);
    this.tokens.push({ type, value: text, line: this.line });
  }

  private scanToken(): void {
    const char = this.advance();

    switch (char) {
      // Single-character tokens
      case "(":
        this.addToken(TokenType.OpenParen);
        break;
      case ")":
        this.addToken(TokenType.CloseParen);
        break;
      case "{":
        this.addToken(TokenType.OpenBrace);
        break;
      case "}":
        this.addToken(TokenType.CloseBrace);
        break;
      case "[":
        this.addToken(TokenType.OpenBracket);
        break;
      case "]":
        this.addToken(TokenType.CloseBracket);
        break;
      case ";":
        this.addToken(TokenType.Semicolon);
        break;
      case ":":
        this.addToken(TokenType.Colon);
        break;
      case ",":
        this.addToken(TokenType.Comma);
        break;
      case ".":
        this.addToken(TokenType.Dot);
        break;
      case "=":
        this.addToken(TokenType.Equals);
        break;

      // Operators
      case "+":
      case "*":
      case "/":
        if (char === "/" && this.peek() === "/") {
          // Single-line comment
          while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.BinaryOperator);
        }
        break;
      case "%":
        this.addToken(TokenType.BinaryOperator);
        break;

      case "-":
        this.handleHyphen();
        break;

      // Whitespace and Newlines
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        this.line++;
        break;

      // Literals
      case '"':
        this.handleString();
        break;

      default:
        if (this.isDigit(char)) {
          this.handleNumber();
        } else if (this.isAlpha(char)) {
          this.handleIdentifier();
        } else {
          console.error(
            `Unrecognised character '${char}' at ${this.filename}:${this.line}`,
          );
          process.exit(1);
        }
        break;
    }
  }

  /**
   * Handles the subtraction operator or a negative number.
   */
  private handleHyphen(): void {
    const lastToken = this.tokens[this.tokens.length - 1];
    const isNegativeSign =
      this.isDigit(this.peek()) &&
      (!lastToken ||
        (lastToken.type !== TokenType.Identifier &&
          lastToken.type !== TokenType.Number &&
          lastToken.type !== TokenType.CloseParen));

    if (isNegativeSign) {
      this.handleNumber();
    } else {
      this.addToken(TokenType.BinaryOperator);
    }
  }

  /**
   * Consumes a string literal.
   */
  private handleString(): void {
    let value = "";
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      value += this.advance();
    }

    if (this.isAtEnd()) {
      console.error(`Unterminated string at ${this.filename}:${this.line}`);
      process.exit(1);
    }

    // The closing ".
    this.advance();
    this.addToken(TokenType.String, value);
  }

  /**
   * Consumes a numeric literal (integer or float).
   */
  private handleNumber(): void {
    // Current character is already 'advance'd if it was '-' or first digit
    // But wait, scanToken already advanced. If it's handleNumber called from default case,
    // we need to collect the rest.

    // Actually, let's reset 'current' slightly or just build from what we have.
    // In scanToken, we already advanced past the first char.

    while (this.isDigit(this.peek())) this.advance();

    // Look for a fractional part.
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(TokenType.Number);
  }

  /**
   * Consumes an identifier or a reserved keyword.
   */
  private handleIdentifier(): void {
    while (this.isAlphanumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    const type = KEYWORDS[text] ?? TokenType.Identifier;
    this.addToken(type);
  }

  private isDigit(char: string): boolean {
    const c = char.charCodeAt(0);
    return c >= 48 && c <= 57; // 0-9
  }

  private isAlpha(char: string): boolean {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_" ||
      char === "$"
    );
  }

  private isAlphanumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}

/**
 * Tokenizes the given source code into an array of Tokens.
 *
 * @param sourceCode The raw source code to tokenize.
 * @param filename Only used for error reporting.
 * @returns An array of Token objects.
 */
export function tokenise(sourceCode: string, filename: string): Token[] {
  return new Lexer(sourceCode, filename).tokenize();
}
