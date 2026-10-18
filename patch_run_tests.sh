sed -i '/console.log..\\n======================================================../i \
    try {\n      const waFix = await runWACustomerSendFixTests();\n      passed += waFix.passed;\n      failed += waFix.failed;\n    } catch (err: any) {\n      failed += 1;\n      console.error(`  ❌ CR-20260916-WA-CUSTOMER-SEND-FIX Suite Failed: ${err.message}`);\n    }\n' server/tests/run-tests.ts
