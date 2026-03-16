# Implementation Tasks

## 1. Plugin Extension - Intent Classification API

- [x] 1.1 Extend `openclaw.plugin.json` to add `nlu_handoff` capability
- [x] 1.2 Add `/api/ai/classify-intent` endpoint in privy-jiner API
- [x] 1.3 Implement keyword matching logic in intent classifier
- [x] 1.4 Implement NLU integration for complex intent classification
- [x] 1.5 Add confidence scoring and threshold logic
- [ ] 1.6 Write unit tests for intent classification

## 2. Plugin Configuration

- [x] 2.1 Add intent routing configuration schema to `openclaw.plugin.json`
- [x] 2.2 Define default keyword mappings (health, finance, fashion)
- [x] 2.3 Add configuration loading and validation
- [x] 2.4 Document configuration options

## 3. Gateway Integration Research

- [x] 3.1 Investigate Openclaw Gateway extension points
- [x] 3.2 Test message interception capability (or alternative)
- [x] 3.3 Implement fallback: tool auto-invocation if extension unavailable

## 4. End-to-End Testing

- [x] 4.1 Test health intent: "我喝了200ml水" ✅
- [x] 4.2 Test finance intent: "今天花了50块" ✅
- [x] 4.3 Test fashion intent: "买了件新衣服" ✅
- [x] 4.4 Test low confidence fallback
- [x] 4.5 Test backward compatibility with explicit jiner_nlu call ✅

## 5. Documentation

- [x] 5.1 Update plugin README with auto-routing usage
- [x] 5.2 Document configuration options
- [x] 5.3 Document intent keywords format
