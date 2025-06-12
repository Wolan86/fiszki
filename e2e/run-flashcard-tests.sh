#!/bin/bash

# Flashcard E2E Tests Runner
# Usage: ./run-flashcard-tests.sh [option]

CONFIG_FILE="e2e/playwright.config.flashcards.ts"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Flashcard E2E Tests Runner${NC}"
echo "================================="

# Check if Playwright is installed
if ! command -v npx playwright &> /dev/null; then
    echo -e "${RED}❌ Playwright not found. Please install it first:${NC}"
    echo "npm install @playwright/test"
    exit 1
fi

# Function to run tests with specific project
run_tests() {
    local project=$1
    local description=$2
    
    echo -e "\n${YELLOW}🚀 Running: $description${NC}"
    echo "Project: $project"
    echo "----------------------------------------"
    
    npx playwright test --config=$CONFIG_FILE --project=$project
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $description - PASSED${NC}"
    else
        echo -e "${RED}❌ $description - FAILED${NC}"
        return 1
    fi
}

# Function to show help
show_help() {
    echo "Available options:"
    echo "  basic      - Run basic flashcard scenarios"
    echo "  advanced   - Run advanced technical scenarios"
    echo "  integration- Run integration tests"
    echo "  all        - Run all flashcard tests"
    echo "  mobile     - Run mobile tests (Pixel 5)"
    echo "  tablet     - Run tablet tests (iPad)"
    echo "  firefox    - Run cross-browser tests (Firefox)"
    echo "  ui         - Run with Playwright UI"
    echo "  debug      - Run in debug mode"
    echo "  headed     - Run with visible browser"
    echo "  report     - Open test report"
    echo "  install    - Install Playwright browsers"
    echo "  help       - Show this help message"
}

# Main execution logic
case $1 in
    "basic")
        run_tests "flashcard-basic-scenarios" "Basic Flashcard Scenarios"
        ;;
    "advanced")
        run_tests "flashcard-advanced-scenarios" "Advanced Technical Scenarios"
        ;;
    "integration")
        run_tests "flashcard-integration-tests" "Integration Tests"
        ;;
    "all")
        echo -e "${BLUE}🎯 Running ALL flashcard tests${NC}"
        run_tests "flashcard-basic-scenarios" "Basic Scenarios" &&
        run_tests "flashcard-advanced-scenarios" "Advanced Scenarios" &&
        run_tests "flashcard-integration-tests" "Integration Tests"
        
        if [ $? -eq 0 ]; then
            echo -e "\n${GREEN}🎉 ALL TESTS COMPLETED SUCCESSFULLY!${NC}"
        else
            echo -e "\n${RED}💥 Some tests failed. Check the output above.${NC}"
        fi
        ;;
    "mobile")
        run_tests "flashcard-mobile" "Mobile Tests (Pixel 5)"
        ;;
    "tablet")
        run_tests "flashcard-tablet" "Tablet Tests (iPad)"
        ;;
    "firefox")
        run_tests "flashcard-cross-browser" "Cross-browser Tests (Firefox)"
        ;;
    "ui")
        echo -e "${BLUE}🎨 Opening Playwright UI...${NC}"
        npx playwright test --config=$CONFIG_FILE --ui
        ;;
    "debug")
        echo -e "${BLUE}🐛 Running in debug mode...${NC}"
        echo "Available test files:"
        echo "- flashcard-list-scenarios.spec.ts"
        echo "- flashcard-advanced-scenarios.spec.ts"
        echo "- flashcard-integration-tests.spec.ts"
        echo ""
        read -p "Enter test file name (or press Enter for all): " test_file
        
        if [ -z "$test_file" ]; then
            npx playwright test --config=$CONFIG_FILE --debug
        else
            npx playwright test --config=$CONFIG_FILE --debug "$test_file"
        fi
        ;;
    "headed")
        echo -e "${BLUE}👁️ Running with visible browser...${NC}"
        npx playwright test --config=$CONFIG_FILE --headed
        ;;
    "report")
        echo -e "${BLUE}📊 Opening test report...${NC}"
        npx playwright show-report test-results/flashcard-report
        ;;
    "install")
        echo -e "${BLUE}📦 Installing Playwright browsers...${NC}"
        npx playwright install
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

echo -e "\n${BLUE}📝 Quick commands:${NC}"
echo "  View report: ./run-flashcard-tests.sh report"
echo "  Debug mode:  ./run-flashcard-tests.sh debug"
echo "  UI mode:     ./run-flashcard-tests.sh ui"
echo "" 