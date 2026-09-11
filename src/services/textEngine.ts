import type { DifficultyMode, TestType } from '../types';

// Curated collections
const HOME_ROW_WORDS = [
  'all', 'ask', 'dad', 'fall', 'flask', 'glad', 'half', 'hall', 'has', 'lad',
  'salad', 'dash', 'flash', 'slash', 'glass', 'adds', 'shall', 'gash', 'flak',
  'sad', 'fad', 'jag', 'lag', 'hash', 'flag', 'dahl', 'fall', 'ska', 'keg',
  'alas', 'alfalfa', 'falls', 'flags', 'flasks', 'had', 'halls', 'jags', 'lads',
  'lakh', 'lass', 'salsa', 'shad', 'slag', 'slags', 'slah', 'sash', 'dashes'
];

const BEGINNER_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'find', 'tell', 'ask', 'seem', 'feel', 'try', 'leave', 'call', 'world', 'school',
  'still', 'last', 'great', 'same', 'big', 'group', 'begin', 'help', 'talk',
  'turn', 'start', 'might', 'show', 'part', 'against', 'place', 'such', 'again',
  'few', 'case', 'week', 'company', 'where', 'system', 'each', 'right', 'program',
  'hear', 'question', 'during', 'play', 'small', 'number', 'always', 'move', 'night',
  'live', 'point', 'believe', 'hold', 'today', 'bring', 'happen', 'next', 'without', 'before',
  'large', 'million', 'must', 'home', 'under', 'water', 'room', 'write', 'mother', 'area',
  'national', 'money', 'story', 'young', 'fact', 'month', 'different', 'study', 'book', 'eye',
  'job', 'word', 'though', 'business', 'issue', 'side', 'kind', 'four', 'head', 'far',
  'black', 'long', 'both', 'little', 'house', 'yes', 'since', 'around', 'friend', 'father',
  'build', 'power', 'speed', 'flow', 'focus', 'sharp', 'clean', 'train', 'finger', 'rhythm',
  'motion', 'habit', 'quick', 'press', 'light', 'ready', 'click', 'craft', 'rapid', 'level',
  'score', 'skill', 'pulse', 'prime', 'smart', 'spark', 'shift', 'space', 'entry', 'track',
  'sound', 'force', 'solid', 'boost', 'clear', 'drive', 'master', 'strike', 'react', 'motor'
];

const INTERMEDIATE_SENTENCES = [
  "Speed and precision come from calm rhythmic finger movement rather than hasty rushing.",
  "Muscle memory develops through consistent daily deliberate practice over several weeks.",
  "Keep your eyes fixed on the screen ahead rather than looking down at your fingers.",
  "A steady pace of sixty words per minute is easily attainable with proper home row placement.",
  "Consistency is the true foundation of fast typing; avoid rushing into frequent typos.",
  "The quick brown fox jumps over the lazy dog while practicing fluent keyboard mechanics.",
  "Typing without looking at the keyboard allows your mind to focus entirely on creative flow.",
  "Relax your shoulders, keep your wrists slightly elevated, and maintain an upright posture.",
  "Practice each mistake carefully to rewrite the neural pathways in your fingertips.",
  "Every great software engineer and writer benefits immensely from effortless touch typing.",
  "Fluid rhythm and zero hesitation will naturally elevate your speed toward seventy words per minute.",
  "Focus on ninety-eight percent accuracy first; raw typing velocity will automatically follow.",
  "When you master finger independence, each finger moves with autonomous mechanical efficiency.",
  "The secret to breaking through plateaus is diagnosing specific trouble keys and drilling them systematically.",
  "Typing should feel like playing a musical instrument, where cadence and harmony produce high velocity.",
  "Modern software engineering requires rapid translation of complex mental architectures into clean syntax.",
  "Daily discipline of just twenty focused minutes will transform your tactile dexterity dramatically.",
  "Do not hammer the keys with excessive force; gentle tactile taps conserve stamina over long hours.",
  "Visualizing the physical keyboard in your mind eliminates the subconscious urge to look down.",
  "Patience and persistence are the quiet keystrokes behind every seventy-plus words per minute milestone.",
  "Building muscle memory requires neural repetition until thought and character output merge into one seamless loop.",
  "Clear typing mechanics reduce hand strain and cognitive overhead during long programming sessions.",
  "Notice how your thumbs naturally strike the spacebar with rhythmic precision on each complete word.",
  "Smooth transitions between home-row keys and number keys prepare you for real-world document writing.",
  "Deliberate practice with real-time feedback accelerates the conversion of conscious effort into instinct.",
  "Achieving deep focus during typing sessions rewires finger reaction times down to the millisecond level.",
  "Great keyboardists anticipate the next two words ahead while completing their current keystroke.",
  "The best ergonomic position keeps your elbows at ninety degrees and your spine supported.",
  "When you hit an error, do not panic; pause momentarily and restore your steady rhythm immediately.",
  "High speed typing turns your keyboard into a direct extension of your thoughts and creativity."
];

const ADVANCED_PASSAGES = [
  "Asynchronous event loops decouple execution threads, minimizing latency across distributed microservices (e.g., Node.js & Go @ 10,000 req/sec).",
  "Cognitive dexterity combined with proprioceptive tactile feedback allows elite typists to surpass 100+ WPM effortlessly without eye fatigue.",
  "The juxtaposition of ephemeral algorithms and immutable cryptographic ledgers presents unique distributed consensus paradigms.",
  "Optimizing algorithmic complexity from O(n^2) to O(n log n) yields non-linear throughput improvements in high-frequency trading architectures.",
  "Syntactic precision demands meticulous finger coordination across punctuation symbols: brackets { [ ( ) ] }, ampersands (&), and pipes (|).",
  "Phenomenological investigations into human-computer interaction reveal that tactile keyboard actuation reduces cognitive friction significantly.",
  "Vectorized embeddings in 1,536-dimensional latent space enable semantic nearest-neighbor retrieval with sub-millisecond quantization thresholds.",
  "The philosophical paradox of recursive self-reference emerges repeatedly in computational logic, Godel's incompleteness, and Turing machines.",
  "Contemporary distributed systems leverage Raft and Paxos consensus algorithms to enforce strict linearizability across Byzantine fault domains.",
  "Microarchitectural branch prediction buffers and speculative execution pipelines minimize CPU instruction stalls at gigahertz frequencies.",
  "Declarative state management models synchronize reactive virtual DOM trees through algebraic diffing heuristics and memoized reconciliation.",
  "High-throughput transactional databases utilize write-ahead logging (WAL) and multi-version concurrency control (MVCC) for ACID compliance.",
  "Cryptographic zero-knowledge proofs (zk-SNARKs) allow verifiable computational integrity without disclosing underlying private witness parameters.",
  "Kernel-level socket multiplexing via epoll and kqueue facilitates non-blocking I/O operations across hundreds of thousands of concurrent client connections.",
  "Neurological plasticity facilitates rapid motor skill acquisition when multisensory auditory and visual feedback loops operate in synchrony.",
  "Modern compilers execute static single assignment transformations, constant folding, and dead code elimination to generate optimal machine instructions.",
  "Distributed stream processing frameworks partition unbounded event streams using deterministic key hashes to ensure partition-level ordering.",
  "Fault-tolerant consensus protocols handle arbitrary network partitions while preserving data consistency across geographic availability zones.",
  "The convergence of quantum computing and lattice-based post-quantum cryptography redefines the boundaries of computational security."
];

const CODE_SNIPPETS = [
  `const debounce = <T extends (...args: any[]) => any>(fn: T, delay = 300) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};`,
  `function binarySearch<T>(arr: T[], target: T): number {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
  `async function fetchUserData(userId: string): Promise<User> {
  const res = await fetch(\`/api/users/\${userId}\`);
  if (!res.ok) throw new Error(\`HTTP status: \${res.status}\`);
  const data = await res.json();
  return data.user;
}`,
  `const [state, dispatch] = useReducer((prev, action) => {
  switch (action.type) {
    case 'INCREMENT': return { count: prev.count + 1 };
    case 'DECREMENT': return { count: Math.max(0, prev.count - 1) };
    default: return prev;
  }
}, { count: 0 });`,
  `def quicksort(items: list[int]) -> list[int]:
    if len(items) <= 1:
        return items
    pivot = items[len(items) // 2]
    left = [x for x in items if x < pivot]
    middle = [x for x in items if x == pivot]
    right = [x for x in items if x > pivot]
    return quicksort(left) + middle + quicksort(right)`,
  `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
}`,
  `SELECT users.id, users.username, COUNT(orders.id) as total_orders
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.status = 'COMPLETED'
GROUP BY users.id, users.username
HAVING COUNT(orders.id) > 5
ORDER BY total_orders DESC;`,
  `fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}`,
  `package main
import (
    "fmt"
    "sync"
)
func main() {
    var wg sync.WaitGroup
    ch := make(chan int, 10)
    wg.Add(1)
    go func() {
        defer wg.Done()
        for v := range ch {
            fmt.Printf("received: %d\\n", v)
        }
    }()
    for i := 1; i <= 5; i++ { ch <- i }
    close(ch)
    wg.Wait()
}`,
  `export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};`
];

const FAMOUS_QUOTES = [
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "The only way to go fast, is to go well.", author: "Robert C. Martin" },
  { text: "Computers are fast; developers are not. Optimize developer productivity first.", author: "Grace Hopper" },
  { text: "Stay hungry, stay foolish. Never settle for ordinary craftsmanship.", author: "Steve Jobs" },
  { text: "Premature optimization is the root of all evil in software engineering.", author: "Donald Knuth" },
  { text: "It is not that I'm so smart. But I stay with the questions much longer.", author: "Albert Einstein" },
  { text: "Continuous effort - not strength or intelligence - is the key to unlocking our potential.", author: "Winston Churchill" },
  { text: "Excellence is not an act, but a habit. We are what we repeatedly do.", author: "Aristotle" },
  { text: "The most damaging phrase in the language is: it has always been done that way.", author: "Grace Hopper" },
  { text: "Code is like humor. When you have to explain it, it is bad.", author: "Cory House" },
  { text: "Fix the cause, not the symptom.", author: "Steve Maguire" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupery" },
  { text: "We build our computer systems the way we build our cities: over time, without a plan, on top of ruins.", author: "Ellen Ullman" },
  { text: "There are only two hard things in Computer Science: cache invalidation and naming things.", author: "Phil Karlton" },
  { text: "Give someone a program, you frustrate them for a day; teach them to program, you frustrate them for a lifetime.", author: "David Leinweber" }
];

export interface TextEnginePayload {
  text: string;
  author?: string;
  source: string;
  wordCount: number;
}

export class TextEngine {
  private static trimToExactWordCount(str: string, targetCount: number): string {
    const words = str.trim().split(/\s+/).filter(Boolean);
    if (words.length >= targetCount) {
      return words.slice(0, targetCount).join(' ');
    }
    const padded = [...words];
    while (padded.length < targetCount) {
      padded.push(BEGINNER_WORDS[Math.floor(Math.random() * BEGINNER_WORDS.length)]);
    }
    return padded.join(' ');
  }

  // Generate text based on difficulty and test configuration
  public static async generateText(
    difficulty: DifficultyMode,
    testType: TestType,
    configValue: number,
    troubleKeys: string[] = []
  ): Promise<TextEnginePayload> {
    const targetWords = testType === 'words' ? configValue : (testType === 'time' ? Math.max(30, Math.ceil(configValue * 1.6)) : 50);

    // 1. Quotes mode
    if (difficulty === 'quotes') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch('https://dummyjson.com/quotes/random', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.quote) {
            let quoteText = data.quote.trim();
            if (testType === 'words') {
              quoteText = this.trimToExactWordCount(quoteText, configValue);
            }
            return {
              text: quoteText,
              author: data.author || 'Anonymous',
              source: 'DummyJSON API',
              wordCount: quoteText.trim().split(/\s+/).length
            };
          }
        }
      } catch {
        // Fallback to local curated quotes
      }

      const q = FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)];
      let quoteText = q.text;
      if (testType === 'words') {
        quoteText = this.trimToExactWordCount(quoteText, configValue);
      }
      return {
        text: quoteText,
        author: q.author,
        source: 'Curated Classics',
        wordCount: quoteText.trim().split(/\s+/).length
      };
    }

    // 2. Code mode
    if (difficulty === 'code') {
      const snippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
      const codeText = snippet.trim();
      return {
        text: codeText,
        author: 'Clean Code Snippets',
        source: 'Dev Syntax Engine',
        wordCount: codeText.trim().split(/\s+/).length
      };
    }

    // 3. Trouble keys practice drill
    if (difficulty === 'drill') {
      const keysToTarget = troubleKeys.length > 0 ? troubleKeys : ['p', 'q', 'z', 'x', 'b'];
      const wordsWithKeys: string[] = [];
      
      const allWords = [...BEGINNER_WORDS, ...HOME_ROW_WORDS];
      for (const w of allWords) {
        if (keysToTarget.some(k => w.toLowerCase().includes(k.toLowerCase()))) {
          wordsWithKeys.push(w);
        }
      }

      const wordPool = wordsWithKeys.length >= 6 ? wordsWithKeys : allWords;
      const selected: string[] = [];
      for (let i = 0; i < targetWords; i++) {
        selected.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
      }
      const drillText = selected.join(' ');
      return {
        text: drillText,
        source: `Targeted Mistake Drill (${keysToTarget.join(', ')})`,
        wordCount: selected.length
      };
    }

    // 4. Beginner mode (Home row + high frequency common words)
    if (difficulty === 'beginner') {
      const pool = [...BEGINNER_WORDS, ...HOME_ROW_WORDS];
      const selected: string[] = [];
      for (let i = 0; i < targetWords; i++) {
        selected.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      const beginnerText = selected.join(' ');
      return {
        text: beginnerText,
        source: 'Beginner Core',
        wordCount: selected.length
      };
    }

    // 5. Advanced / Elite mode
    if (difficulty === 'advanced') {
      const shuffled = [...ADVANCED_PASSAGES].sort(() => 0.5 - Math.random());
      let text = shuffled.slice(0, 2).join(' ');
      if (testType === 'words') {
        text = this.trimToExactWordCount(text, configValue);
      } else {
        const words = text.split(/\s+/);
        if (words.length > targetWords) {
          text = words.slice(0, targetWords).join(' ');
        }
      }
      return {
        text,
        source: 'Advanced 70+ WPM Mastery',
        wordCount: text.trim().split(/\s+/).length
      };
    }

    // 6. Intermediate (Default)
    const shuffledSentences = [...INTERMEDIATE_SENTENCES].sort(() => 0.5 - Math.random());
    let text = shuffledSentences.slice(0, 3).join(' ');
    
    if (testType === 'words') {
      text = this.trimToExactWordCount(text, configValue);
    } else {
      const words = text.split(/\s+/);
      if (words.length > targetWords) {
        text = words.slice(0, targetWords).join(' ');
      }
    }

    return {
      text,
      source: 'Intermediate Prose',
      wordCount: text.trim().split(/\s+/).length
    };
  }
}
