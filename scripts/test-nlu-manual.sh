#!/bin/bash
# Test script for OpenClaw Natural Language MVP
# This script tests the NLU -> health API flow

echo "=========================================="
echo "Testing jiner Natural Language Integration"
echo "=========================================="
echo ""

# Test 1: Structured tool call (backward compatibility)
echo "Test 1: Structured tool call (backward compatibility)"
echo "---------------------------------------------------"
echo "Sending: { action: 'health_log_water', payload: { amount: 3 } }"
echo ""
echo "Expected: Water record created, success response"
echo ""

# Test 2: Natural language processing
echo "Test 2: Natural language processing"
echo "-------------------------------------"
echo "Sending: { naturalLanguage: 'I drank 3 glasses of water' }"
echo ""
echo "Expected flow:"
echo "  1. NLU detects water intent"
echo "  2. Extracts amount: 3"
echo "  3. Calls health_log_water API"
echo "  4. Returns success with logged amount"
echo ""

# Test 3: Exercise logging
echo "Test 3: Exercise logging via NL"
echo "---------------------------------"
echo "Sending: { naturalLanguage: 'I ran for 30 minutes' }"
echo ""
echo "Expected:"
echo "  1. NLU detects exercise intent"
echo "  2. Extracts activity: running, duration: 30"
echo "  3. Calls health_log_exercise API"
echo ""

# Test 4: Error handling - unparseable input
echo "Test 4: Error handling - unparseable input"
echo "------------------------------------------"
echo "Sending: { naturalLanguage: 'What is the weather?' }"
echo ""
echo "Expected: { success: false, error: 'Could not understand request' }"
echo ""

# Test 5: Error handling - no model configured
echo "Test 5: Error handling - no AI model"
echo "---------------------------------------"
echo "When no AI model is configured:"
echo "Expected: { success: false, error: 'No AI model configured' }"
echo ""

echo "=========================================="
echo "Manual Test Commands"
echo "=========================================="
echo ""
echo "Start the server first:"
echo "  npm run dev"
echo ""
echo "Then test with curl:"
echo ""
echo "# Test 1: Structured call"
echo 'curl -X POST http://localhost:3001/api/health/water \\'
echo '  -H "Content-Type: application/json" \\'
echo '  -d '"'"'{"amount": 3}'"'"''
echo ""
echo "# Test 2: Get today's total"
echo 'curl http://localhost:3001/api/health/water/today'
echo ""
echo "# Test 3: List all water logs"
echo 'curl http://localhost:3001/api/health/water'
echo ""
