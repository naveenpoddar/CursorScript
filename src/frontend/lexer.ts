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
}

function token(value: string = "", type: TokenType): Token {
  return { value, type };
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

export function tokenise(sourceCode: string): Token[] {
  const tokens: Token[] = [];
  const src = sourceCode.split("");

  let isReadingComment = false;

  let isReadingString = false;
  let accuStr = "";

  while (src.length > 0) {
    const char = src[0];
    if (char == null) {
      console.error("Unexpected end of source code");
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
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (char === ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (char === "{") {
      tokens.push(token(src.shift(), TokenType.OpenBrace));
    } else if (char === "}") {
      tokens.push(token(src.shift(), TokenType.CloseBrace));
    } else if (char === "[") {
      tokens.push(token(src.shift(), TokenType.OpenBracket));
    } else if (char === "]") {
      tokens.push(token(src.shift(), TokenType.CloseBracket));
    } else if (char === "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else if (
      char === "+" ||
      char === "-" ||
      char === "*" ||
      char === "/" ||
      char === "%"
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (char === ";") {
      tokens.push(token(src.shift(), TokenType.Semicolon));
    } else if (char === ":") {
      tokens.push(token(src.shift(), TokenType.Colon));
    } else if (char === ",") {
      tokens.push(token(src.shift(), TokenType.Comma));
    } else if (char === ".") {
      tokens.push(token(src.shift(), TokenType.Dot));
    } else if (char === '"') {
      src.shift();

      if (isReadingString) {
        tokens.push(token(accuStr, TokenType.String));
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

        tokens.push(token(num, TokenType.Number));
      } else if (isalpha(char)) {
        let identifier = ""; // foo or let (user-defined OR keywords)
        while (src.length > 0 && isalpha(src[0])) {
          identifier += src.shift()!;
        }

        // Check for reserved keywords
        const reserved = KEYWORDS[identifier];

        if (typeof reserved === "number") {
          tokens.push(token(identifier, reserved));
        } else {
          tokens.push(token(identifier, TokenType.Identifier));
        }
      } else if (isskippable(char)) {
        src.shift(); // Skip whitespace
      } else {
        console.error("Unrecognised character found at source: " + char);
        process.exit(1);
      }
    }
  }

  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
  return tokens;
}

// const source = await Bun.file("test/Main.Cursor").text();

// for (const token of tokenise(source)) {
//   console.log(token);
// }
