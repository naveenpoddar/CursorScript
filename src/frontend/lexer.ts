// let x = 45 + ( a * b )
// [ LetToken, IdentifierToken, OpenParenToken, NumberToken, CloseParenToken ]

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

  // Operators
  OpenParen, // (
  CloseParen, // )
  BinaryOperator,
  Equals,
  Semicolon,
  OpenBrace, // {
  CloseBrace, // }
  OpenBracket, // [
  CloseBracket, // ]
  Colon, // :
  Comma, // ,
  Dot, // .
  Quote, // "

  EOF, // End of File
}

const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
  fn: TokenType.Fn,
};

export interface Token {
  value: string;
  type: TokenType;
  line: number;
}

function token(value: string = "", type: TokenType, line: number): Token {
  return { value, type, line };
}

function isskippable(src: string | undefined) {
  if (src == null) return false;
  return src === " " || src === "\t" || src === "\n" || src === "\r";
}

function isalpha(src: string | undefined) {
  if (src == null) return false;
  return src.toUpperCase() != src.toLowerCase();
}

function isint(src: string | undefined) {
  if (src == null) return false;
  const c = src.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= bounds[0]! && c <= bounds[1]!;
}

export function tokenise(sourceCode: string, filename: string): Token[] {
  const tokens: Token[] = [];
  const src = sourceCode.split("");

  let isReadingComment = false;

  let isReadingString = false;
  let accuStr = "";

  let line = 1;

  while (src.length > 0) {
    const char = src[0];
    if (char == null) {
      console.error("Unexpected end of source code", filename);
      break;
    }

    if (char !== '"' && isReadingString) {
      accuStr += src.shift();
      continue;
    }

    if (src[0] === "/" && src[1] === "/") {
      isReadingComment = true;
      src.shift();
      src.shift();
      continue;
    }

    if (isReadingComment) {
      const char = src.shift();
      if (char === "\n") {
        isReadingComment = false;
      }
      continue;
    }

    if (char === "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen, line));
    } else if (char === ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen, line));
    } else if (char === "{") {
      tokens.push(token(src.shift(), TokenType.OpenBrace, line));
    } else if (char === "}") {
      tokens.push(token(src.shift(), TokenType.CloseBrace, line));
    } else if (char === "[") {
      tokens.push(token(src.shift(), TokenType.OpenBracket, line));
    } else if (char === "]") {
      tokens.push(token(src.shift(), TokenType.CloseBracket, line));
    } else if (char === "=") {
      tokens.push(token(src.shift(), TokenType.Equals, line));
    } else if (
      char === "+" ||
      char === "-" ||
      char === "*" ||
      char === "/" ||
      char === "%"
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator, line));
    } else if (char === ";") {
      tokens.push(token(src.shift(), TokenType.Semicolon, line));
    } else if (char === ":") {
      tokens.push(token(src.shift(), TokenType.Colon, line));
    } else if (char === ",") {
      tokens.push(token(src.shift(), TokenType.Comma, line));
    } else if (char === ".") {
      tokens.push(token(src.shift(), TokenType.Dot, line));
    } else if (char === '"') {
      src.shift();

      if (isReadingString) {
        tokens.push(token(accuStr, TokenType.String, line));
        accuStr = "";
      }

      isReadingString = !isReadingString;
    } else {
      // Handle Multi Character Token

      if (isint(char)) {
        let num = "";
        while (src.length > 0 && isint(src[0])) {
          num += src.shift()!;
        }

        tokens.push(token(num, TokenType.Number, line));
      } else if (isalpha(char)) {
        let identifier = ""; // foo or let (user-defined OR keywords)
        while (src.length > 0 && isalpha(src[0])) {
          identifier += src.shift()!;
        }

        // Check for reserved keywords
        const reserved = KEYWORDS[identifier];

        if (typeof reserved === "number") {
          tokens.push(token(identifier, reserved, line));
        } else {
          tokens.push(token(identifier, TokenType.Identifier, line));
        }
      } else if (isskippable(char)) {
        line += char === "\n" ? 1 : 0;
        src.shift(); // Skip whitespace
      } else {
        // improve error printing
        console.error(
          `Unrecognised character found: ${char} at line no ${filename}:${line}`,
        );
        process.exit(1);
      }
    }
  }

  tokens.push({ type: TokenType.EOF, value: "EndOfFile", line });
  return tokens;
}

// const source = await Bun.file("test/Main.Cursor").text();

// for (const token of tokenise(source)) {
//   console.log(token);
// }
