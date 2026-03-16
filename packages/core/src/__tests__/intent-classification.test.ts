// Simple test runner for intent classification
// Run with: npx ts-node packages/core/src/__tests__/intent-classification.test.ts

const keywords = {
  health: ['喝水', '运动', '跑步', '锻炼', 'ml', '公里', '步数'],
  finance: ['花钱', '买了', '支付', '工资', '收入', '花了', '块', '元'],
  fashion: ['衣服', '穿搭', '衣柜', '买衣服', '新衣服'],
};

interface IntentResult {
  intent: string | null;
  confidence: number;
  entities: Record<string, any>;
}

function classifyByKeywords(message: string, kw: Record<string, string[]>): IntentResult {
  const msg = message.toLowerCase();
  
  for (const [category, words] of Object.entries(kw)) {
    for (const word of words) {
      if (msg.includes(word)) {
        const entities: Record<string, any> = {};
        
        const amountMatch = message.match(/(\d+)\s*(ml|毫升|公里|公里|步|块|元)/i);
        if (amountMatch) {
          entities.amount = parseInt(amountMatch[1]);
          entities.unit = amountMatch[2];
        }
        
        if (category === 'health') {
          if (msg.includes('喝水') || msg.includes('ml') || msg.includes('毫升')) {
            return { intent: 'health_log_water', confidence: 0.9, entities };
          }
          if (msg.includes('运动') || msg.includes('跑步') || msg.includes('锻炼')) {
            return { intent: 'health_log_exercise', confidence: 0.8, entities };
          }
        }
        
        if (category === 'finance') {
          return { intent: 'finance_log_expense', confidence: 0.8, entities };
        }
        
        if (category === 'fashion') {
          return { intent: 'fashion_add_item', confidence: 0.8, entities };
        }
        
        return { intent: `${category}_default`, confidence: 0.6, entities };
      }
    }
  }
  
  return { intent: null, confidence: 0, entities: {} };
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
  console.log(`✅ ${message}`);
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`🧪 ${name}`);
  } catch (e) {
    console.error(`❌ ${name}: ${e}`);
    process.exit(1);
  }
}

// Tests
test('should classify health_log_water intent', () => {
  const result = classifyByKeywords('我喝了200ml水', keywords);
  assert(result.intent === 'health_log_water', `intent should be health_log_water, got ${result.intent}`);
  assert(result.confidence > 0.5, `confidence should be > 0.5, got ${result.confidence}`);
  assert(result.entities.amount === 200, `amount should be 200, got ${result.entities.amount}`);
});

test('should classify health_log_exercise intent', () => {
  const result = classifyByKeywords('今天跑步5公里', keywords);
  assert(result.intent === 'health_log_exercise', `intent should be health_log_exercise, got ${result.intent}`);
  assert(result.confidence > 0.5, `confidence should be > 0.5`);
});

test('should classify finance intent', () => {
  const result = classifyByKeywords('今天花了50块买咖啡', keywords);
  assert(result.intent === 'finance_log_expense', `intent should be finance_log_expense, got ${result.intent}`);
  assert(result.confidence > 0.5, `confidence should be > 0.5`);
});

test('should classify fashion intent', () => {
  const result = classifyByKeywords('买了件新衣服', keywords);
  assert(result.intent === 'fashion_add_item', `intent should be fashion_add_item, got ${result.intent}`);
  assert(result.confidence > 0.5, `confidence should be > 0.5`);
});

test('should return unknown for unrecognized messages', () => {
  const result = classifyByKeywords('今天天气不错', keywords);
  assert(result.intent === null, `intent should be null, got ${result.intent}`);
  assert(result.confidence === 0, `confidence should be 0`);
});

test('should extract amount entities', () => {
  const result = classifyByKeywords('喝水500ml', keywords);
  assert(result.entities.amount === 500, `amount should be 500, got ${result.entities.amount}`);
  assert(result.entities.unit === 'ml', `unit should be ml, got ${result.entities.unit}`);
});

test('should be case insensitive', () => {
  const result = classifyByKeywords('我喝了300ML水', keywords);
  assert(result.intent === 'health_log_water', `intent should be health_log_water`);
});

console.log('\n✅ All tests passed!');
