/**
 * Represents a token in the boolean search query
 */
type Token = {
  type: 'AND' | 'OR' | 'NOT' | 'TERM' | 'LPAREN' | 'RPAREN';
  value: string;
};

/**
 * Tokenizes the search query into meaningful tokens
 */
const tokenize = (query: string): Token[] => {
  const tokens: Token[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    
    if (char === '"' || char === '\'') {
      inQuotes = !inQuotes;
      if (!inQuotes && current) {
        tokens.push({ type: 'TERM', value: current });
        current = '';
      }
      continue;
    }
    
    if (inQuotes) {
      current += char;
      continue;
    }
    
    // Check for operators
    // Check for word operators (must be at word boundary)
    const nextTwo = query.substr(i, 3); // Get next 3 chars for lookahead
    
    // Check for NOT as a word
    const isNotWord = nextTwo.toUpperCase().startsWith('NOT') && 
                     (i + 3 >= query.length || /[\s\(]/.test(query[i + 3]));
    
    // Check for AND as a word
    const isAndWord = nextTwo.toUpperCase().startsWith('AND') && 
                     (i + 3 >= query.length || /[\s\(]/.test(query[i + 3]));
    
    // Check for OR as a word
    const isOrWord = nextTwo.toUpperCase().startsWith('OR') && 
                    (i + 2 >= query.length || /[\s\(\|]/.test(query[i + 2]));
    
    if (isNotWord) {
      if (current) tokens.push({ type: 'TERM', value: current });
      tokens.push({ type: 'NOT', value: 'NOT' });
      i += 2; // Skip 'NOT' (3 chars - 1 for loop increment)
      current = '';
    } else if (isAndWord) {
      if (current) tokens.push({ type: 'TERM', value: current });
      tokens.push({ type: 'AND', value: 'AND' });
      i += 2; // Skip 'AND' (3 chars - 1 for loop increment)
      current = '';
    } else if (isOrWord) {
      if (current) tokens.push({ type: 'TERM', value: current });
      tokens.push({ type: 'OR', value: 'OR' });
      i += 1; // Skip 'OR' (2 chars - 1 for loop increment)
      current = '';
    } else if (char === '&' && query[i + 1] === '&') {
      if (current) tokens.push({ type: 'TERM', value: current });
      tokens.push({ type: 'AND', value: 'AND' });
      i++; // Skip next &
      current = '';
    } else if (char === '|' && query[i + 1] === '|') {
      if (current) tokens.push({ type: 'TERM', value: current });
      tokens.push({ type: 'OR', value: 'OR' });
      i++; // Skip next |
      current = '';
    } else if (char === '!') {
      if (current) tokens.push({ type: 'TERM', value: current });
      tokens.push({ type: 'NOT', value: 'NOT' });
      // If the next character is '(', we need to handle it as a group
      if (i + 1 < query.length && query[i + 1] === '(') {
        i++; // Skip the '!', the '(' will be handled in the next iteration
      }
      current = '';
    } else if (char === '(') {
      if (current) tokens.push({ type: 'TERM', value: current });
      tokens.push({ type: 'LPAREN', value: '(' });
      // If the previous token was NOT, we need to ensure proper grouping
      if (tokens.length > 1 && tokens[tokens.length - 2]?.type === 'NOT') {
        // Add a group start marker
        tokens.splice(tokens.length - 1, 0, { type: 'LPAREN', value: '(' });
      }
      current = '';
    } else if (char === ')') {
      if (current) tokens.push({ type: 'TERM', value: current });
      tokens.push({ type: 'RPAREN', value: ')' });
      current = '';
    } else if (/\s/.test(char)) {
      if (current) {
        tokens.push({ type: 'TERM', value: current });
        current = '';
      }
    } else {
      current += char;
    }
  }
  
  if (current) {
    tokens.push({ type: 'TERM', value: current });
  }
  
  return tokens;
};

/**
 * Parses the tokenized query into a boolean expression tree
 */
const parse = (tokens: Token[]): any => {
  let index = 0;
  
  const parseOr = (): any => {
    let left = parseAnd();
    
    while (index < tokens.length && tokens[index].type === 'OR') {
      const operator = tokens[index++].value;
      const right = parseAnd();
      left = { type: 'OR', left, right };
    }
    
    return left;
  };
  
  const parseAnd = (): any => {
    let left = parseNot();
    
    while (index < tokens.length && (tokens[index].type === 'AND' || 
           (tokens[index].type === 'TERM' && index + 1 < tokens.length && 
            tokens[index + 1].type !== 'OR' && tokens[index + 1].type !== 'AND' && 
            tokens[index + 1].type !== 'RPAREN' && tokens[index + 1].type !== 'NOT'))) {
      if (tokens[index].type === 'AND') {
        index++;
      } else if (tokens[index].type === 'TERM') {
        // Implicit AND between terms
      }
      const right = parseNot();
      left = { type: 'AND', left, right };
    }
    
    return left;
  };
  
  const parseNot = (): any => {
    if (tokens[index]?.type === 'NOT') {
      index++;
      return { type: 'NOT', value: parsePrimary() };
    }
    return parsePrimary();
  };
  
  const parsePrimary = (): any => {
    if (tokens[index]?.type === 'LPAREN') {
      index++; // skip '('
      const expr = parseOr();
      if (tokens[index]?.type !== 'RPAREN') {
        throw new Error('Expected )');
      }
      index++; // skip ')'
      // Handle grouped NOT expressions
      if (tokens[index]?.type === 'RPAREN' && index > 0 && tokens[index - 2]?.type === 'NOT') {
        index++; // Skip the extra ')'
        return { type: 'NOT', value: expr };
      }
      return expr;
    }
    
    if (tokens[index]?.type === 'TERM') {
      return { type: 'TERM', value: tokens[index++].value };
    }
    
    throw new Error('Unexpected token');
  };
  
  return parseOr();
};

/**
 * Evaluates the parsed boolean expression against the text
 */
const evaluate = (node: any, text: string): boolean => {
  const textLower = text.toLowerCase();
  
  switch (node.type) {
    case 'TERM':
      return textLower.includes(node.value.toLowerCase());
    case 'NOT':
      return !evaluate(node.value, text);
    case 'AND':
      return evaluate(node.left, text) && evaluate(node.right, text);
    case 'OR':
      return evaluate(node.left, text) || evaluate(node.right, text);
    default:
      return false;
  }
};

// Test function to debug tokenization and parsing
const debugSearch = (query: string) => {
  try {
    const tokens = tokenize(query);
    console.log('Tokens:', tokens);
    if (tokens.length > 0 && !(tokens.length === 1 && tokens[0].type === 'TERM')) {
      const expr = parse([...tokens]);
      console.log('Parsed:', JSON.stringify(expr, null, 2));
    }
  } catch (error) {
    console.error('Debug error:', error);
  }
};

/**
 * Tests if a string matches a boolean search query
 * @param text The text to search in
 * @param query The search query
 * @returns boolean indicating if the text matches the query
 */
export const matchesBooleanSearch = (text: string, query: string): boolean => {
  // Uncomment to debug specific queries
  // if (query.includes('OR') || query.includes('||')) {
  //   console.log('\nOriginal query:', query);
  //   debugSearch(query);
  // }
  if (!query.trim()) return true;
  
  try {
    // Tokenize and parse the query
    const tokens = tokenize(query);
    if (tokens.length === 0) return true;
    
    // If it's a simple term, just check for inclusion
    if (tokens.length === 1 && tokens[0].type === 'TERM') {
      return text.toLowerCase().includes(tokens[0].value.toLowerCase());
    }
    
    // Parse into an expression tree
    const expression = parse(tokens);
    
    // Evaluate the expression
    return evaluate(expression, text);
  } catch (error) {
    console.error('Error parsing boolean search:', error);
    // Fall back to simple string inclusion if parsing fails
    return text.toLowerCase().includes(query.toLowerCase());
  }
};
